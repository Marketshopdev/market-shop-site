document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    db.collection('products').where('emplacement', '==', 'services').get()
        .then(snapshot => {
            if (snapshot.empty) return;

            const items = snapshot.docs
                .map(doc => doc.data())
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

            items.forEach(p => {
                const card = document.createElement('article');
                card.className = 'service-row';
                card.innerHTML = `
                    <img src="${p.imageUrl}" alt="${p.nom}" style="width:74px;height:74px;border-radius:12px;object-fit:cover;">
                    <div>
                        <h3>${p.nom}</h3>
                        <p>${p.description}</p>
                    </div>
                    <a href="https://wa.me/[TON_NUMERO_WHATSAPP]?text=Bonjour%2C%20je%20suis%20intéressé%20par%20${encodeURIComponent(p.nom)}" class="btn-card" target="_blank">Nous contacter</a>
                `;
                grid.appendChild(card);
            });
        })
        .catch(err => console.error('Erreur chargement services:', err));
});
