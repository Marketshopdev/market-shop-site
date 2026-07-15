document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    db.collection('products').orderBy('createdAt', 'desc').get()
        .then(snapshot => {
            if (snapshot.empty) {
                grid.innerHTML = '<p class="empty-state">Aucun produit disponible pour le moment. Revenez bientôt !</p>';
                return;
            }

            grid.innerHTML = '';
            snapshot.forEach(doc => {
                const p = doc.data();
                const card = document.createElement('article');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${p.imageUrl}" alt="${p.nom}" loading="lazy">
                    <div class="product-body">
                        <h3>${p.nom}</h3>
                        <p class="product-desc">${p.description}</p>
                        <span class="product-price">${p.prix ? p.prix + ' F CFA' : 'Sur Devis'}</span>
                        <div class="product-actions">
                            <a href="https://wa.me/[TON_NUMERO_WHATSAPP]?text=Bonjour%2C%20je%20suis%20intéressé%20par%20${encodeURIComponent(p.nom)}" class="btn-card" target="_blank">Demander un devis</a>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        })
        .catch(err => {
            console.error('Erreur Firestore:', err);
            grid.innerHTML = '<p class="empty-state">Impossible de charger les produits pour le moment.</p>';
        });
});
