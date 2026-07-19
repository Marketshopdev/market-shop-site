document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const form = document.getElementById('settingsForm');
    if (!form) return;

    const submitBtn = document.getElementById('settingsSubmitBtn');
    const message = document.getElementById('settingsMessage');

    const fieldMap = {
        phone1: 'setPhone1',
        phone2: 'setPhone2',
        whatsapp: 'setWhatsapp',
        email: 'setEmail',
        address: 'setAddress',
        hours: 'setHours',
        facebook: 'setFacebook',
        instagram: 'setInstagram',
        tiktok: 'setTiktok',
        youtube: 'setYoutube',
    };

    // Pré-remplit le formulaire avec les coordonnées déjà enregistrées, une fois connecté
    auth.onAuthStateChanged(user => {
        if (!user) return;
        db.collection('settings').doc('contact').get().then(doc => {
            if (!doc.exists) return;
            const data = doc.data();
            Object.entries(fieldMap).forEach(([key, id]) => {
                const el = document.getElementById(id);
                if (el && data[key]) el.value = data[key];
            });
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enregistrement...';
        message.style.display = 'none';

        const data = {};
        Object.entries(fieldMap).forEach(([key, id]) => {
            data[key] = document.getElementById(id).value.trim();
        });

        try {
            await db.collection('settings').doc('contact').set(data, { merge: true });
            message.style.color = '#25D366';
            message.textContent = 'Coordonnées enregistrées avec succès !';
            message.style.display = 'block';
        } catch (err) {
            message.style.color = '#ff7f50';
            message.textContent = 'Erreur : ' + err.message;
            message.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enregistrer les coordonnées';
        }
    });
});
