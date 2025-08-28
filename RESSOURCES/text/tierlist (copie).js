// Génération dynamique des miniatures + pop-ups à partir d'un seul all.json
document.addEventListener('DOMContentLoaded', () => {
    const JSON_FILE = 'https://guip4pro.github.io/Site-Webtoons/RESSOURCES/data-json/all.json';
    const CACHE_BUST = true; // false en prod
    const BREAKPOINT_MOBILE = 720;

    /* ---------- utilitaires ---------- */
    function slugify(text = '') {
        return String(text)
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().trim()
        .replace(/['"’”“`]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }
    function normalizeContainerId(name = '') {
        return String(name).toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-');
    }

    /* ---------- stockage ---------- */
    // (accessible dans la console pour debug si besoin)
    window.__allWebtoonLinks = []; // intentionally global for easy debugging
    const webtoonIndex = new Map(); // slug -> webtoon object (from all.json)

    /* ---------- création d'un élément .webtoon-details ---------- */
    function buildDetailElement(slug, webtoon) {
        // data source: prefer webtoon.details if present, else use top-level fields
        const d = webtoon.details || {};
        const title = d.title || webtoon.title || '';
        const banner = d.banner || '';
        const cover = d.cover || webtoon.cover || webtoon.image || '';
        const alt = d.alt || webtoon.alt || title;
        const type = d.type || webtoon.type || '';
        const genre = d.genre || webtoon.genre || [];
        const status = d.status || webtoon.status || '';
        const chapters = d.chapters || webtoon.chapters || '';
        const sites = d.sites || webtoon.sites || [];
        const synopsis = d.synopsis || webtoon.synopsis || '';
        const previews = d.previewImages || webtoon.previewImages || [];
        const adaptations = d.adaptations || webtoon.adaptations || '';

        // wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'webtoon-details';
        wrapper.id = `webtoon-${slug}-details`;
        wrapper.style.display = 'none'; // hidden by default

        // close
        const close = document.createElement('span');
        close.className = 'close-popup';
        close.setAttribute('aria-label', 'Fermer');
        close.innerHTML = '&times;';
        wrapper.appendChild(close);

        // titres/bannières
        const titres = document.createElement('div');
        titres.className = 'titres_bannières';
        const h3 = document.createElement('h3');
        h3.textContent = title;
        titres.appendChild(h3);
        if (banner) {
        const b = document.createElement('img');
        b.src = banner;
        b.loading = 'lazy';
        b.alt = `${title} banner`;
        b.className = 'banner';
        titres.appendChild(b);
        }
        wrapper.appendChild(titres);

        // details-content
        const detailsContent = document.createElement('div');
        detailsContent.className = 'details-content';

        if (cover) {
        const img = document.createElement('img');
        img.src = cover;
        img.loading = 'lazy';
        img.alt = alt || title;
        img.className = 'thumbnail';
        detailsContent.appendChild(img);
        }

        const detailsText = document.createElement('div');
        detailsText.className = 'details-text';

        if (type) {
        const p = document.createElement('p');
        p.innerHTML = `<strong>Type :</strong> ${type}`;
        detailsText.appendChild(p);
        }
        if (genre && (Array.isArray(genre) ? genre.length : genre)) {
        const p = document.createElement('p');
        const g = Array.isArray(genre) ? genre.join(' / ') : genre;
        p.innerHTML = `<strong>Genre :</strong> ${g}`;
        detailsText.appendChild(p);
        }
        if (status) {
        const p = document.createElement('p');
        p.innerHTML = `<strong>Statut :</strong> ${status}`;
        detailsText.appendChild(p);
        }
        if (chapters) {
        const p = document.createElement('p');
        p.innerHTML = `<strong>Nombre de chapitres :</strong> ${chapters}`;
        detailsText.appendChild(p);
        }

        // sites-container
        if (sites && sites.length) {
        const container = document.createElement('div');
        container.className = 'sites-container';
        const titleSites = document.createElement('p');
        titleSites.className = 'sites-list';
        titleSites.innerHTML = '<strong>Sites de lecture :</strong>';
        container.appendChild(titleSites);
        const ul = document.createElement('ul');
        ul.className = 'sites-ul';
        sites.forEach(s => {
            const li = document.createElement('li');
            if (s.url) {
            const a = document.createElement('a');
            a.href = s.url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = s.name || s.url;
            li.appendChild(a);
            if (s.note) {
                const em = document.createElement('em');
                em.textContent = ` (${s.note})`;
                li.appendChild(em);
            }
            } else {
            li.textContent = s.name || '';
            }
            ul.appendChild(li);
        });
        container.appendChild(ul);
        detailsText.appendChild(container);
        }

        detailsContent.appendChild(detailsText);
        wrapper.appendChild(detailsContent);

        // Synopsis
        if (synopsis) {
        const pTitle = document.createElement('p');
        pTitle.innerHTML = '<strong>Synopsis :</strong>';
        wrapper.appendChild(pTitle);
        const pSyn = document.createElement('p');
        pSyn.innerHTML = synopsis;
        wrapper.appendChild(pSyn);
        }

        // Previews
        if (previews && previews.length) {
        const pTitle = document.createElement('p');
        pTitle.innerHTML = '<strong>Prévisualisation :</strong>';
        wrapper.appendChild(pTitle);
        const divImgs = document.createElement('div');
        divImgs.className = 'img-popup';
        previews.forEach(src => {
            const im = document.createElement('img');
            im.className = 'thumbnail';
            im.loading = 'lazy';
            im.alt = 'image preview';
            im.src = src;
            divImgs.appendChild(im);
        });
        wrapper.appendChild(divImgs);
        }

        // Adaptation
        if (adaptations && (Array.isArray(adaptations) ? adaptations.length : adaptations)) {
        const p = document.createElement('p');
        p.innerHTML = `<strong>Adaptation :</strong> ${Array.isArray(adaptations) ? adaptations.join(', ') : adaptations}`;
        wrapper.appendChild(p);
        }

        // evenement fermeture (croix)
        close.addEventListener('click', () => closePopup(wrapper));
        // fermeture clic extérieur
        wrapper.addEventListener('click', (ev) => {
        if (ev.target === wrapper) closePopup(wrapper);
        });

        return wrapper;
    }

    /* ---------- ouvrir / fermer ---------- */
    function openPopupById(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = 'block';
        // focus close button for accessibility
        const closeBtn = el.querySelector('.close-popup');
        if (closeBtn) closeBtn.focus();
        // ESC binding
        const esc = (e) => { if (e.key === 'Escape') closePopup(el); };
        document.addEventListener('keydown', esc);
        el._escHandler = esc;
    }
    function closePopup(el) {
        if (!el) return;
        el.style.display = 'none';
        if (el._escHandler) {
        document.removeEventListener('keydown', el._escHandler);
        delete el._escHandler;
        }
    }

    /* ---------- lecture all.json et génération ---------- */
    async function loadWebtoonsFromJson(jsonFile) {
        try {
        const url = jsonFile + (CACHE_BUST ? `?v=${Date.now()}` : '');
        const res = await fetch(url);
        if (!res.ok) throw new Error('Erreur ' + res.status);
        const data = await res.json();

        // container où placer les popups (aside si présent, sinon body)
        const popupContainer = document.querySelector('aside') || document.body;

        // pour chaque catégorie
        (data.categories || []).forEach(category => {
            const containerId = normalizeContainerId(category.name);
            const grid = document.getElementById(containerId);
            if (!grid) return;

            (category.webtoons || []).forEach(webtoon => {
            const slug = webtoon.id || slugify(webtoon.title);
            webtoonIndex.set(slug, webtoon);

            // 1) créer la vignette <a><img></a>
            const a = document.createElement('a');
            a.href = `#webtoon-${slug}-details`;
            a.dataset.webtoonId = slug;
            const aliases = [webtoon.title, ...(Array.isArray(webtoon.aliases) ? webtoon.aliases : [])].map(s => s.toLowerCase());
            a.dataset.aliases = aliases.join(',');

            const img = document.createElement('img');
            img.src = webtoon.image || webtoon.cover || '';
            if (webtoon.loading) img.loading = webtoon.loading;
            img.alt = webtoon.alt || webtoon.title || '';
            a.appendChild(img);

            grid.appendChild(a);
            window.__allWebtoonLinks.push(a);

            // 2) créer le bloc .webtoon-details et l'ajouter au DOM
            const detailEl = buildDetailElement(slug, webtoon);
            popupContainer.appendChild(detailEl);
            });
        });

        // délégation: clic sur une vignette -> ouvrir le popup correspondant
        const tierList = document.querySelector('.tier-list');
        if (tierList) {
            tierList.addEventListener('click', (e) => {
            const a = e.target.closest('a');
            if (!a) return;
            const slug = a.dataset.webtoonId || (a.getAttribute('href') || '').replace(/^#webtoon-/, '').replace(/-details$/, '');
            if (!slug) return;
            e.preventDefault();
            openPopupById(`webtoon-${slug}-details`);
            });
        }

        } catch (err) {
        console.error('Erreur lors du chargement du JSON :', err);
        }
    }

    /* ---------- recherche ---------- */
    const searchInput = document.getElementById('search-webtoon');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
        const q = this.value.trim().toLowerCase();
        window.__allWebtoonLinks.forEach(link => {
            const aliases = (link.dataset.aliases || '').split(',');
            const match = q === '' || aliases.some(a => a.includes(q));
            link.style.display = match ? '' : 'none';
        });
        });
    }

    /* ---------- responsive : sites-container -> sites-mobile ---------- */
    function syncSitesForAllPopups() {
        document.querySelectorAll('.webtoon-details').forEach(popup => {
        const detailsContent = popup.querySelector('.details-content');
        const detailsText = popup.querySelector('.details-text');
        if (!detailsContent || !detailsText) return;
        const orig = popup.querySelector('.sites-container');
        const mobile = popup.querySelector('.sites-mobile');

        if (window.innerWidth <= BREAKPOINT_MOBILE) {
            if (!mobile) {
            if (orig) {
                popup.dataset.sitesOriginalInner = orig.innerHTML;
                popup.dataset.sitesOriginalClass = orig.className || 'sites-container';
                orig.remove();
            }
            const newMobile = document.createElement('div');
            newMobile.className = 'sites-mobile';
            newMobile.innerHTML = popup.dataset.sitesOriginalInner || '<p class="sites-list"><strong>Sites de lecture :</strong></p>';
            detailsContent.parentNode.insertBefore(newMobile, detailsContent.nextSibling || null);
            }
            return;
        }

        if (window.innerWidth > BREAKPOINT_MOBILE) {
            if (mobile) mobile.remove();
            if (!orig && popup.dataset.sitesOriginalInner) {
            const restored = document.createElement('div');
            restored.className = popup.dataset.sitesOriginalClass || 'sites-container';
            restored.innerHTML = popup.dataset.sitesOriginalInner;
            detailsText.appendChild(restored);
            }
        }
        });
    }

    // resize debounced
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(syncSitesForAllPopups, 120);
    });

    // observe DOM in case other scripts add .webtoon-details
    const observer = new MutationObserver((muts) => {
        for (const m of muts) {
        if ([...m.addedNodes].some(n => n.nodeType === 1 && n.matches && n.matches('.webtoon-details'))) {
            setTimeout(syncSitesForAllPopups, 60);
            break;
        }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    /* ---------- fermer tous les popups si hashchange (optionnel) ---------- */
    window.addEventListener('hashchange', () => {
        document.querySelectorAll('.webtoon-details').forEach(d => { if (d.style.display === 'block') closePopup(d); });
    });

    /* ---------- kick off ---------- */
    loadWebtoonsFromJson(JSON_FILE);
    setTimeout(syncSitesForAllPopups, 100);
});







    /* BARRE DE NAVIGATION LATERALE */
function toggleNav() {
    const nav = document.getElementById("sidebarNav");
    if (nav.style.width === "250px") {
        nav.style.width = "0";
    } else {
        nav.style.width = "250px";
    }
}

    /* CREER SA PROPRE TIER LIST */
function tierlistMaker() {
    alert("Fonctionnalité en cours de développement");
}




    // Zoom sur Image
// écouteur global qui intercepte les clics sur toute image
// ayant la classe thumbnail, même celles créées plus tard
document.addEventListener("click", function(e) {
    if (e.target.classList.contains("thumbnail")) {
        modal.style.display = "block";
        modalImg.src = e.target.src;
    }
});

// Créer le modal et ses éléments
const modal = document.createElement("div");
modal.className = "modal";
const closeModal = document.createElement("span");
closeModal.className = "close";
closeModal.innerHTML = "&times;";
const modalImg = document.createElement("img");
modalImg.className = "modal-content";

// Ajouter les éléments au modal
modal.appendChild(closeModal);
modal.appendChild(modalImg);
document.body.appendChild(modal);

// Récupérer toutes les images avec la classe "thumbnail"
const images = document.querySelectorAll(".thumbnail");

// Ajouter un événement de clic à chaque image
images.forEach(img => {
    img.onclick = function() {
        modal.style.display = "block";
        modalImg.src = this.src; // Mettre la source de l'image dans le modal
    }
});

// Lorsque l'utilisateur clique sur (x), fermer le modal
closeModal.onclick = function() {
    modal.style.display = "none";
}

// Fermer le modal si l'utilisateur clique en dehors de l'image
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}





document.addEventListener('DOMContentLoaded', () => {
    // Formulaire
    const form = document.querySelector('.contact-form');
    const inputs = document.querySelectorAll(".contact-form input[maxlength], .contact-form textarea[maxlength]");

    // Initialise les compteurs de caractères
    const countersMap = new Map();

    inputs.forEach(input => {
        const max = input.getAttribute("maxlength");
        // On cherche un <p> avec la classe .char-count dans le parent
        const counter = input.parentElement.querySelector("p.char-count");
        if (counter) {
            const updateCount = () => {
                const remaining = max - input.value.length;
                counter.textContent = `Caractères restants : ${remaining}`;
            };
            input.addEventListener("input", updateCount);
            updateCount();  // Initialisation

            // Sauvegarde la fonction pour réutilisation après reset
            countersMap.set(input, updateCount);
        }
    });


    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        console.log('🟢 submit event fired');

        const formData = new FormData(form);
        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            console.log('Fetch response:', response);

            if (response.ok) {
                console.log('✅ Envoi réussi');
                form.reset();

                // Forcer la mise à jour des compteurs après reset
                countersMap.forEach((updateCount, input) => updateCount());

                // Affichage du popup
                const popup = document.getElementById('popup-message');
                popup.classList.add('popup-visible');

                setTimeout(() => {
                    popup.classList.remove('popup-visible');
                }, 3000);
            } else {
                console.error('❌ Envoi échoué, status:', response.status);
                alert("Une erreur s'est produite. Statut : " + response.status);
            }
        } catch (err) {
            console.error('🚨 Erreur fetch():', err);
            alert("Erreur réseau : vérifie la console");
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact-form');
    const inputs = form.querySelectorAll("input[maxlength], textarea[maxlength]");
    const countersMap = new Map();

    inputs.forEach(input => {
        const max = parseInt(input.getAttribute("maxlength"), 10);

        // on remonte au .form-group parent, puis on y cherche le .char-count
        const group   = input.closest('.form-group');
        const counter = group?.querySelector('.char-count');

        if (counter) {
        const updateCount = () => {
            const remaining = max - input.value.length;
            counter.textContent = `Caractères restants : ${remaining}`;
        };
        input.addEventListener('input', updateCount);
        updateCount();  // initialisation
        countersMap.set(input, updateCount);
        }
    });

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
        const res = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
            form.reset();
            // on rafraîchit tous les compteurs
            countersMap.forEach(fn => fn());
            const popup = document.getElementById('popup-message');
            popup.classList.add('popup-visible');
            setTimeout(() => popup.classList.remove('popup-visible'), 3000);
        } else {
            alert("Erreur d'envoi (status " + res.status + ")");
        }
        } catch {
        alert("Erreur réseau, vois la console");
        }
    });

});
