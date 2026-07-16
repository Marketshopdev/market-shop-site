document.addEventListener('DOMContentLoaded', () => {
    const shareBtn = document.getElementById('shareBtn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: 'Market Shop',
            text: 'Découvrez Market Shop : tout ce dont vous avez besoin, au meilleur prix.',
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // L'utilisateur a annulé le partage, rien à faire
            }
        } else {
            // Solution de repli si le navigateur ne supporte pas le partage natif
            navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papier !');
        }
    });
});
