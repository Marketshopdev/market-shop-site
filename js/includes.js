async function loadPartial(placeholderId, url) {
    const el = document.getElementById(placeholderId);
    if (!el) return;
    const response = await fetch(url);
    el.innerHTML = await response.text();
}

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadPartial('header-placeholder', 'partials/header.html'),
        loadPartial('footer-placeholder', 'partials/footer.html')
    ]);

    // Met en surbrillance automatiquement le lien du menu correspondant à la page actuelle
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Signale aux autres scripts (menu, partage) que header/footer sont prêts
    document.dispatchEvent(new Event('partialsLoaded'));
});
