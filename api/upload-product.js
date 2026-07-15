import { v2 as cloudinary } from 'cloudinary';
import admin from 'firebase-admin';
import formidable from 'formidable';
import fs from 'fs';

// Empêche Vercel de parser le body automatiquement (on gère nous-mêmes le multipart/form-data pour l'upload d'image)
export const config = {
    api: {
        bodyParser: false,
    },
};

// Configuration Cloudinary (les clés viennent des variables d'environnement, jamais codées en dur)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialisation Firebase Admin (une seule fois, réutilisée entre les appels)
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

        // Upload de l'image vers Cloudinary
        const uploadResult = await cloudinary.uploader.upload(imageFile.filepath, {
            folder: 'market-shop/products',
        });

        // Nettoyage du fichier temporaire
        fs.unlinkSync(imageFile.filepath);

        // Enregistrement du produit dans Firestore
        const docRef = await db.collection('products').add({
            nom: fields.nom?.[0] || fields.nom || '',
            description: fields.description?.[0] || fields.description || '',
            prix: fields.prix?.[0] || fields.prix || '',
            imageUrl: uploadResult.secure_url,
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
