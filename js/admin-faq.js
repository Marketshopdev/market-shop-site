document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const form = document.getElementById('faqForm');
    if (!form) return;

    const submitBtn = document.getElementById('faqSubmitBtn');
    const message = document.getElementById('faqMessage');
    const list = document.getElementById('faqList');
    const listLoading = document.getElementById('faqListLoading');

    async function loadFaqs() {
        listLoading.style.display = 'block';
        list.innerHTML = '';

        try {
            const snapshot = await db.collection('faqs').get();
            listLoading.style.display = 'none';

            if (snapshot.empty) {
                list.innerHTML = '<p class="admin-loading-msg">Aucune question publiée.</p>';
                return;
            }

            const items = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

            items.forEach(f => {
                const row = document.createElement('div');
                row.className = 'admin-product-row';
                row.innerHTML = `
                    <div style="flex:1;">
                        <strong>${f.question}</strong><br>
                        <span>${f.answer}</span>
                    </div>
                    <button data-id="${f.id}" class="admin-delete-btn">Supprimer</button>
                `;
                list.appendChild(row);

                row.querySelector('.admin-delete-btn').addEventListener('click', async (e) => {
                    if (!confirm('Supprimer cette question ?')) return;
                    e.target.disabled = true;
                    await db.collection('faqs').doc(f.id).delete();
                    loadFaqs();
                });
            });
        } catch (err) {
            listLoading.textContent = 'Erreur lors du chargement.';
        }
    }

    auth.onAuthStateChanged(user => {
        if (user) loadFaqs();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Publication...';
        message.style.display = 'none';

        try {
            await db.collection('faqs').add({
                question: document.getElementById('faqQuestion').value.trim(),
                answer: document.getElementById('faqAnswer').value.trim(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

            message.style.color = '#25D366';
            message.textContent = 'Question publiée avec succès !';
            message.style.display = 'block';
            form.reset();
            loadFaqs();
        } catch (err) {
            message.style.color = '#ff7f50';
            message.textContent = 'Erreur : ' + err.message;
            message.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publier la question';
        }
    });
});
