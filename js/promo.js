// ============================================
// FICHIER : js/promo.js (nouveau)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('promoSection');
    const grid = document.getElementById('promoGrid');
    if (!grid) return;

    db.collection('products')
        .where('emplacement', '==', 'accueil-haut')
        .orderBy('createdAt', 'desc')
        .get()
        .then(snapshot => {
            if (snapshot.empty) return; // rien à afficher, la section reste cachée

            grid.innerHTML = '';
            snapshot.forEach(doc => {
                const p = doc.data();
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

            section.style.display = 'block'; // révèle la section seulement s'il y a du contenu
        })
        .catch(err => console.error('Erreur chargement promotions:', err));
});
                                                    
