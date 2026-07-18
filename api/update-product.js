import admin from 'firebase-admin';

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
        const { id, nom, description, prix, emplacement } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Identifiant du produit manquant' });
        }

        await db.collection('products').doc(id).update({
            nom: nom || '',
            description: description || '',
            prix: (prix || '').trim(),
            emplacement: emplacement || 'produits',
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erreur update-product:', error);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
    }
        }
