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

    // ---- Vérification de l'authentification (NOUVEAU) ----
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
    // --------------------------------------------------------

    try {
        const form = formidable({ multiples: false });

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        const imageFile = files.image?.[0] || files.image;
        if (!imageFile) {
            return res.status(400).json({ error: 'Aucune image reçue' });
        }

        const uploadResult = await cloudinary.uploader.upload(imageFile.filepath, {
            folder: 'market-shop/products',
        });

        fs.unlinkSync(imageFile.filepath);

        const docRef = await db.collection('products').add({
            nom: fields.nom?.[0] || fields.nom || '',
            description: fields.description?.[0] || fields.description || '',
            prix: (Array.isArray(fields.prix) ? (fields.prix[0] || '') : (fields.prix || '')).trim(),
            imageUrl: uploadResult.secure_url,
imagePublicId: uploadResult.public_id,
            emplacement: fields.emplacement?.[0] || fields.emplacement || 'produits',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(200).json({
            success: true,
            id: docRef.id,
            imageUrl: uploadResult.secure_url,
        });

    } catch (error) {
        console.error('Erreur upload-product:', error);
        return res.status(500).json({ error: 'Erreur serveur lors de l\'ajout du produit' });
    }
                                                              }
