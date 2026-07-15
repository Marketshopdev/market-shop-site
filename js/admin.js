document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();

    // ---- Sécurité : la session ne survit JAMAIS à la fermeture du navigateur ----
    // (contrairement au comportement par défaut de Firebase qui reste connecté indéfiniment)
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

    // ---- Déconnexion automatique après 10 minutes d'inactivité ----
    let inactivityTimer;
    const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes

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

    // ---- Gestion de l'état de connexion ----
    auth.onAuthStateChanged(user => {
        if (user) {
            loginScreen.style.display = 'none';
            adminScreen.style.display = 'block';
            adminEmailEl.textContent = user.email;
            resetInactivityTimer();
        } else {
            loginScreen.style.display = 'block';
            adminScreen.style.display = 'none';
            clearTimeout(inactivityTimer);
        }
    });

    // ---- Connexion ----
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

    // ---- Déconnexion ----
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
    });

    // ---- Envoi du formulaire produit ----
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
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                formMessage.style.color = '#25D366';
                formMessage.textContent = 'Produit ajouté avec succès !';
                formMessage.style.display = 'block';
                productForm.reset();
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
