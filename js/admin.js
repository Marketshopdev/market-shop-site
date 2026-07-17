document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

    const loginScreen = document.getElementById('loginScreen');
    const adminScreen = document.getElementById('adminScreen');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginError = document.getElementById('loginError');
    const adminEmailEl = document.getElementById('adminEmail');
    const productForm = document.getElementById('productForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');
    const productsList = document.getElementById('productsList');
    const listLoading = document.getElementById('listLoading');

    let inactivityTimer;
    const INACTIVITY_LIMIT = 10 * 60 * 1000;

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        if (auth.currentUser) {
            inactivityTimer = setTimeout(() => {
                auth.signOut();
                alert('Session expirée pour inactivité. Reconnectez-vous.');
            }, INACTIVITY_LIMIT);
        }
    }

    ['click', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
        document.addEventListener(evt, resetInactivityTimer);
    });

    // Affiche la liste des produits, avec un bouton de suppression pour chacun
    async function loadProducts() {
        listLoading.style.display = 'block';
        productsList.innerHTML = '';

        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch('/api/list-products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();

            listLoading.style.display = 'none';

            if (!result.products || result.products.length === 0) {
                productsList.innerHTML = '<p class="admin-loading-msg">Aucun produit publié pour le moment.</p>';
                return;
            }

            result.products.forEach(p => {
                const item = document.createElement('div');
                item.className = 'admin-product-row';
                item.innerHTML = `
                    <img src="${p.imageUrl}" alt="${p.nom}" width="60" height="60">
                    <div style="flex:1;">
                        <strong>${p.nom}</strong><br>
                        <span>${p.emplacement}</span>
                    </div>
                    <button data-id="${p.id}" class="admin-delete-btn">Supprimer</button>
                `;
                productsList.appendChild(item);
            });

            // Rattache l'action de suppression à chaque bouton nouvellement créé
            document.querySelectorAll('.admin-delete-btn').forEach(btn => {
                btn.addEventListener('click', () => handleDelete(btn.dataset.id, btn));
            });

        } catch (err) {
            listLoading.textContent = 'Erreur lors du chargement des produits.';
        }
    }

    async function handleDelete(id, button) {
        const confirmed = confirm('Supprimer ce produit définitivement ? Cette action est irréversible.');
        if (!confirmed) return;

        button.disabled = true;
        button.textContent = 'Suppression...';

        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch('/api/delete-product', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            if (response.ok) {
                loadProducts();
            } else {
                const result = await response.json();
                alert('Erreur : ' + (result.error || 'suppression impossible'));
                button.disabled = false;
                button.textContent = 'Supprimer';
            }
        } catch (err) {
            alert('Erreur réseau lors de la suppression.');
            button.disabled = false;
            button.textContent = 'Supprimer';
        }
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            loginScreen.style.display = 'none';
            adminScreen.style.display = 'block';
            adminEmailEl.textContent = user.email;
            resetInactivityTimer();
            loadProducts();
        } else {
            loginScreen.style.display = 'block';
            adminScreen.style.display = 'none';
            clearTimeout(inactivityTimer);
        }
    });

    loginBtn.addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        loginError.style.display = 'none';

        auth.signInWithEmailAndPassword(email, password)
            .catch(err => {
                loginError.textContent = 'Email ou mot de passe incorrect.';
                loginError.style.display = 'block';
            });
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
    });

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
        formMessage.style.display = 'none';

        try {
            const user = auth.currentUser;
            const token = await user.getIdToken();

            const formData = new FormData();
            formData.append('nom', document.getElementById('nom').value);
            formData.append('description', document.getElementById('description').value);
            formData.append('prix', document.getElementById('prix').value);
            formData.append('emplacement', document.getElementById('emplacement').value);
            formData.append('image', document.getElementById('image').files[0]);

            const response = await fetch('/api/upload-product', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                formMessage.style.color = '#25D366';
                formMessage.textContent = 'Produit ajouté avec succès !';
                formMessage.style.display = 'block';
                productForm.reset();
                loadProducts();
            } else {
                throw new Error(result.error || 'Erreur inconnue');
            }

        } catch (err) {
            formMessage.style.color = '#ff7f50';
            formMessage.textContent = 'Erreur : ' + err.message;
            formMessage.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Ajouter le produit';
        }
    });
});
