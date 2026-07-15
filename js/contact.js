document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const whatsappNumber = '[TON_NUMERO_WHATSAPP]'; // format international sans +, ex: 22879499501

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        const text =
            `Bonjour, je vous contacte via le site Market Shop.\n\n` +
            `Nom : ${name}\n` +
            `Téléphone : ${phone}\n` +
            (email ? `Email : ${email}\n` : '') +
            `Sujet : ${subject}\n` +
            `Message : ${message}`;

        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    });
});
