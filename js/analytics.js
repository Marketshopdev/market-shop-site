function loadGoogleAnalytics() {
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-3ZB57VGLGZ';
    document.head.appendChild(script1);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-3ZB57VGLGZ');
}

document.addEventListener('partialsLoaded', () => {
    const consent = localStorage.getItem('cookieConsent');

    if (consent === 'accepted') {
        loadGoogleAnalytics();
    }

    if (!consent) {
        showConsentBanner();
    }
});

function showConsentBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.style.cssText = 'position:fixed; bottom:0; left:0; right:0; background:#0d1f3d; border-top:1px solid #1a2a40; padding:20px; z-index:3000; display:flex; flex-wrap:wrap; gap:15px; align-items:center; justify-content:space-between;';
    banner.innerHTML = `
        <p style="color:#8892b0; margin:0; flex:1; min-width:250px; font-size:0.9em;">
            Nous utilisons des cookies pour améliorer votre expérience et mesurer l'audience du site.
            <a href="politique-confidentialite.html" style="color:#FF7F50;">En savoir plus</a>
        </p>
        <div style="display:flex; gap:10px;">
            <button id="cookieDecline" style="padding:10px 20px; background:transparent; border:1px solid #1a2a40; color:#fff; border-radius:6px; cursor:pointer;">Refuser</button>
            <button id="cookieAccept" style="padding:10px 20px; background:#FF7F50; border:none; color:#fff; border-radius:6px; cursor:pointer; font-weight:bold;">Accepter</button>
        </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('cookieAccept').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        loadGoogleAnalytics();
        banner.remove();
    });

    document.getElementById('cookieDecline').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        banner.remove();
    });
}
