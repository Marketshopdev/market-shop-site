import admin from 'firebase-admin';

if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
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
        const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json({ products });
    } catch (error) {
        console.error('Erreur list-products:', error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
      }
