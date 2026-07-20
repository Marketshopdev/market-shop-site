document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const pendingList = document.getElementById('pendingTestimonialsList');
    const approvedList = document.getElementById('approvedTestimonialsList');
    if (!pendingList || !approvedList) return;

    const pendingLoading = document.getElementById('pendingLoading');
    const approvedLoading = document.getElementById('approvedLoading');

    function starsFor(rating) {
        return '⭐'.repeat(rating || 0);
    }

    async function loadPending() {
        pendingLoading.style.display = 'block';
        pendingList.innerHTML = '';

        const snapshot = await db.collection('testimonials').where('status', '==', 'pending').get();
        pendingLoading.style.display = 'none';

        if (snapshot.empty) {
            pendingList.innerHTML = '<p class="admin-loading-msg">Aucun avis en attente.</p>';
            return;
        }

        const items = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

        items.forEach(t => {
            const row = document.createElement('div');
            row.className = 'admin-product-row';
            row.innerHTML = `
                <div style="flex:1;">
                    <strong>${t.author}</strong> — ${starsFor(t.rating)}<br>
                    <span>${t.text}</span>
                </div>
                <button data-id="${t.id}" class="admin-edit-btn">Approuver</button>
                <button data-id="${t.id}" class="admin-delete-btn">Rejeter</button>
            `;
            pendingList.appendChild(row);

            row.querySelector('.admin-edit-btn').addEventListener('click', async (e) => {
                e.target.disabled = true;
                await db.collection('testimonials').doc(t.id).update({ status: 'approved' });
                loadPending();
                loadApproved();
            });

            row.querySelector('.admin-delete-btn').addEventListener('click', async (e) => {
                if (!confirm('Rejeter et supprimer cet avis ?')) return;
                e.target.disabled = true;
                await db.collection('testimonials').doc(t.id).delete();
                loadPending();
            });
        });
    }

    async function loadApproved() {
        approvedLoading.style.display = 'block';
        approvedList.innerHTML = '';

        const snapshot = await db.collection('testimonials').where('status', '==', 'approved').get();
        approvedLoading.style.display = 'none';

        if (snapshot.empty) {
            approvedList.innerHTML = '<p class="admin-loading-msg">Aucun témoignage publié.</p>';
            return;
        }

        const items = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        items.forEach(t => {
            const row = document.createElement('div');
            row.className = 'admin-product-row';
            row.innerHTML = `
                <div style="flex:1;">
                    <strong>${t.author}</strong> — ${starsFor(t.rating)}<br>
                    <span>${t.text}</span>
                </div>
                <button data-id="${t.id}" class="admin-delete-btn">Supprimer</button>
            `;
            approvedList.appendChild(row);

            row.querySelector('.admin-delete-btn').addEventListener('click', async (e) => {
                if (!confirm('Supprimer définitivement ce témoignage publié ?')) return;
                e.target.disabled = true;
                await db.collection('testimonials').doc(t.id).delete();
                loadApproved();
            });
        });
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            loadPending();
            loadApproved();
        }
    });
});
