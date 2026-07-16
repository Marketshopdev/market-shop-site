import { v2 as cloudinary } from 'cloudinary';
import admin from 'firebase-admin';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

    if (!token) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        await admin.auth().verifyIdToken(token);
    } catch (err) {
        return res.status(401).json({ error: 'Session invalide, reconnectez-vous' });
    }

    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Identifiant du produit manquant' });
        }

        const docRef = db.collection('products').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Produit introuvable' });
        }

        const data = doc.data();

        // Supprime l'image sur Cloudinary si un identifiant a été enregistré
        if (data.imagePublicId) {
            await cloudinary.uploader.destroy(data.imagePublicId);
        }

        await docRef.delete();

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erreur delete-product:', error);
        return res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
    }
}
