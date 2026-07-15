document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Ouvre ou ferme le menu au clic sur le bouton hamburger
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Gestion de l'envoi du formulaire sur WhatsApp
const whatsappForm = document.getElementById('whatsappForm');

if (whatsappForm) {
    whatsappForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Empêche le rechargement de la page

        // Récupération des valeurs du formulaire
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const product = document.getElementById('product').value || 'Aucun produit spécifique';
        const message = document.getElementById('message').value;

        // Ton numéro de téléphone WhatsApp pro (sans le signe +)
        const myPhoneNumber = "22879499501"; 

        // Construction du message formaté et propre pour WhatsApp
        const formattedMessage = `Bonjour Market Shop !\n\n` +
                                 `Je souhaite passer une commande / prendre contact :\n\n` +
                                 `*Nom :* ${name}\n` +
                                 `*Téléphone :* ${phone}\n` +
                                 `*Produit d'intérêt :* ${product}\n\n` +
                                 `*Message / Détails :*\n${message}`;

        // Encodage du message pour l'URL
        const encodedMessage = encodeURIComponent(formattedMessage);

        // Lien de redirection vers WhatsApp (Fonctionne sur mobile et ordinateur)
        const whatsappURL = `https://wa.me/${myPhoneNumber}?text=${encodedMessage}`;

        // Redirection instantanée de l'utilisateur vers WhatsApp
        window.open(whatsappURL, '_blank');
    });
}

    // Ferme le menu si l'utilisateur clique sur un lien
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
});
