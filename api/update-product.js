import { v2 as cloudinary } from 'cloudinary';
import admin from 'firebase-admin';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

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
        const form = formidable({ multiples: false });

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        const getField = (f) => Array.isArray(f) ? (f[0] || '') : (f || '');

        const id = getField(fields.id);
        if (!id) {
            return res.status(400).json({ error: 'Identifiant du produit manquant' });
        }

        const docRef = db.collection('products').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Produit introuvable' });
        }

        const existingData = doc.data();

        const updateData = {
            nom: getField(fields.nom),
            description: getField(fields.description),
            prix: getField(fields.prix).trim(),
            emplacement: getField(fields.emplacement) || 'produits',
        };

        // Remplace la photo uniquement si une nouvelle a été fournie
        const imageFile = files.image?.[0] || files.image;
        if (imageFile && imageFile.size > 0) {
            const uploadResult = await cloudinary.uploader.upload(imageFile.filepath, {
                folder: 'market-shop/products',
            });
            fs.unlinkSync(imageFile.filepath);

            // Supprime l'ancienne photo sur Cloudinary pour ne pas laisser de fichiers orphelins
            if (existingData.imagePublicId) {
                await cloudinary.uploader.destroy(existingData.imagePublicId).catch(() => {});
            }

            updateData.imageUrl = uploadResult.secure_url;
            updateData.imagePublicId = uploadResult.public_id;
        }

        await docRef.update(updateData);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erreur update-product:', error);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
    }
                                                                   }
