document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('submitTestimonialForm');
    if (!form) return;

    const submitBtn = document.getElementById('submitTestimonialBtn');
    const message = document.getElementById('submitTestimonialMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
        message.style.display = 'none';

        try {
            await db.collection('testimonials').add({
                author: document.getElementById('subAuthor').value.trim(),
                rating: parseInt(document.getElementById('subRating').value, 10),
                text: document.getElementById('subText').value.trim(),
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

            message.style.color = '#25D366';
            message.textContent = 'Merci ! Votre avis sera publié après validation.';
            message.style.display = 'block';
            form.reset();
        } catch (err) {
            message.style.color = '#ff7f50';
            message.textContent = "Erreur lors de l'envoi. Réessayez plus tard.";
            message.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Envoyer mon avis';
        }
    });
});
