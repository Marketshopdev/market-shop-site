document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('faqDynamicList');
    if (!list) return;

    db.collection('faqs').get()
        .then(snapshot => {
            if (snapshot.empty) {
                list.innerHTML = '<p class="admin-loading-msg">Aucune question pour le moment.</p>';
                return;
            }

            const items = snapshot.docs
                .map(doc => doc.data())
                .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

            list.innerHTML = '';
            items.forEach(f => {
                const item = document.createElement('div');
                item.className = 'faq-item';
                item.innerHTML = `
                    <button class="faq-question">
                        ${f.question}
                        <span class="faq-icon">+</span>
                    </button>
                    <div class="faq-answer">
                        <p>${f.answer}</p>
                    </div>
                `;
                list.appendChild(item);
            });

            // Ré-active l'accordéon maintenant que les questions sont chargées
            document.querySelectorAll('.faq-item').forEach(item => {
                const question = item.querySelector('.faq-question');
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
                    if (!isActive) item.classList.add('active');
                });
            });
        })
        .catch(err => {
            console.error('Erreur chargement FAQ:', err);
            list.innerHTML = '<p class="admin-loading-msg">Impossible de charger les questions.</p>';
        });
});
