document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('promoSection');
    const grid = document.getElementById('promoGrid');
    if (!grid) return;

    db.collection('products')
        .where('emplacement', '==', 'accueil-haut')
        .get()
        .then(snapshot => {
            if (snapshot.empty) return;

            const items = snapshot.docs
                .map(doc => doc.data())
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

            grid.innerHTML = '';
            items.forEach(p => {
                const card = document.createElement('article');
                card.className = 'promo-card';
                card.innerHTML = `
                    <img src="${p.imageUrl}" alt="${p.nom}" loading="lazy">
                    <div class="promo-body">
                        <h3>${p.nom}</h3>
                        <p>${p.description}</p>
                        <span class="promo-price">${p.prix ? p.prix + ' F CFA' : 'Sur Devis'}</span>
                        <a href="https://wa.me/[TON_NUMERO_WHATSAPP]?text=Bonjour%2C%20je%20suis%20intéressé%20par%20${encodeURIComponent(p.nom)}" class="btn-card" target="_blank">Nous contacter</a>
                    </div>
                `;
                grid.appendChild(card);
            });

            section.style.display = 'block';
        })
        .catch(err => console.error('Erreur chargement promotions:', err));
});
