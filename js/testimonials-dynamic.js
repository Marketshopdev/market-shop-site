document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('testimonialsGrid');
    const scoreEl = document.getElementById('ratingScore');
    const starsEl = document.getElementById('ratingStars');
    const countEl = document.getElementById('ratingCount');
    if (!grid) return;

    db.collection('testimonials').where('status', '==', 'approved').get()
        .then(snapshot => {
            if (snapshot.empty) {
                grid.innerHTML = '<p class="admin-loading-msg">Aucun témoignage pour le moment. Soyez le premier à donner votre avis !</p>';
                return;
            }

            const items = snapshot.docs
                .map(doc => doc.data())
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

            const avg = items.reduce((sum, t) => sum + (t.rating || 0), 0) / items.length;

            if (scoreEl) scoreEl.textContent = avg.toFixed(1);
            if (starsEl) starsEl.textContent = '⭐'.repeat(Math.round(avg));
            if (countEl) countEl.textContent = items.length;

            grid.innerHTML = '';
            items.forEach(t => {
                const card = document.createElement('div');
                card.className = 'testimonial-card';
                card.innerHTML = `
                    <div class="testimonial-stars">${'⭐'.repeat(t.rating || 5)}</div>
                    <p>"${t.text}"</p>
                    <span class="testimonial-author">— ${t.author}</span>
                `;
                grid.appendChild(card);
            });
        })
        .catch(err => {
            console.error('Erreur chargement témoignages:', err);
            grid.innerHTML = '<p class="admin-loading-msg">Impossible de charger les témoignages.</p>';
        });
});
