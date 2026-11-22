/* Lumen Web · kit d'animation des démonstrations (GSAP + ScrollTrigger + Lenis)
   Réglages par démo : window.ANIM = { marque, fond, texte, accent, signature: "restaurant" | "hotel" | "clinique" }
   Désactivé avec ?capture (captures d'écran) et pour les visiteurs qui préfèrent moins d'animations. */
(function () {
  var q = new URLSearchParams(location.search);
  if (q.has("capture") || matchMedia("(prefers-reduced-motion: reduce)").matches || !window.gsap || !window.ScrollTrigger) return;
  var C = window.ANIM || {}, html = document.documentElement, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  gsap.registerPlugin(ScrollTrigger);
  // L'ancien système d'apparition (demo.js) laisse la place à GSAP
  html.classList.remove("anim"); $$(".rv").forEach(function (e) { e.classList.add("vu"); });
  html.classList.add("gsap");
  var fin = matchMedia("(pointer:fine)").matches, mobile = innerWidth < 760;

  /* Styles du kit */
  var st = document.createElement("style");
  st.textContent =
    "l-mot{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.12em;margin-bottom:-.12em}l-mot>l-i{display:inline-block;will-change:transform}" +
    ".lw-intro{position:fixed;inset:0;z-index:200;display:grid;place-items:center;background:var(--i-fond);color:var(--i-texte)}" +
    ".lw-intro b{font:500 clamp(34px,7vw,84px)/1 var(--i-police,Georgia,serif);letter-spacing:-.01em;display:block;text-align:center}" +
    ".lw-intro .l{display:inline-block;overflow:hidden;vertical-align:top}.lw-intro .l i{display:inline-block;font-style:normal}" +
    ".lw-intro .lw-b{display:block;width:min(240px,50vw);height:2px;background:rgba(255,255,255,.12);margin:26px auto 0;overflow:hidden}.lw-intro .lw-b em{display:block;height:100%;width:100%;background:var(--i-accent);transform:scaleX(0);transform-origin:left}" +
    ".lw-barre{position:fixed;left:0;top:0;height:3px;width:100%;z-index:120;background:var(--i-accent);transform:scaleX(0);transform-origin:left;pointer-events:none}" +
    ".lw-c,.lw-r{position:fixed;left:0;top:0;z-index:300;pointer-events:none;border-radius:50%;mix-blend-mode:difference}" +
    ".lw-c{width:8px;height:8px;margin:-4px 0 0 -4px;background:#fff}.lw-r{width:40px;height:40px;margin:-20px 0 0 -20px;border:1.5px solid #fff;transition:width .3s,height .3s,margin .3s,background .3s}" +
    ".lw-r.sur{width:74px;height:74px;margin:-37px 0 0 -37px;background:#fff}" +
    "html.gsap,html.gsap body{overflow-x:clip}html.gsap.lw-curseur,html.gsap.lw-curseur a,html.gsap.lw-curseur button{cursor:none}";
  document.head.appendChild(st);
  html.style.setProperty("--i-fond", C.fond || "#111"); html.style.setProperty("--i-texte", C.texte || "#fff");
  html.style.setProperty("--i-accent", C.accent || "#FFB547"); if (C.police) html.style.setProperty("--i-police", C.police);

  /* Découpe d'un titre en mots (garde <em>, <span>, <br>) */
  function decouper(el) {
    if (el.dataset.decoupe) return $$("l-mot>l-i", el); el.dataset.decoupe = 1;
    (function marche(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.textContent.split(/(\s+)/), f = document.createDocumentFragment();
          parts.forEach(function (p) { if (!p) return; if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(p)); return; }
            var m = document.createElement("l-mot"); var i = document.createElement("l-i"); i.textContent = p; m.appendChild(i); f.appendChild(m); });
          n.replaceChild(f, c);
        } else if (c.nodeType === 1 && c.tagName !== "BR") marche(c);
      });
    })(el);
    return $$("l-mot>l-i", el);
  }

  /* Défilement fluide (ordinateur) */
  var lenis = null;
  if (window.Lenis && fin) {
    lenis = new Lenis({ lerp: .09, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
    html.style.scrollBehavior = "auto";
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a || a.getAttribute("href").length < 2 || a.dataset.contact) return;
      var t = document.querySelector(a.getAttribute("href")); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -70, duration: 1.4 });
    });
  }

  /* Barre de progression */
  var barre = document.createElement("div"); barre.className = "lw-barre"; document.body.appendChild(barre);
  gsap.to(barre, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });

  /* Titre et image d'accueil */
  var hero = document.querySelector(".hero"), heroImg = hero && hero.querySelector("img"), heroH1 = hero && hero.querySelector("h1");
  var heroAutres = hero ? $$(".script, small, p, .actions, .puce, .note, .infos, .barre-resa, form", hero).filter(function (e) { return !e.closest("h1"); }) : [];
  var tlHero = gsap.timeline({ paused: true });
  if (heroImg) tlHero.fromTo(heroImg, { scale: 1.25 }, { scale: 1, duration: 2.2, ease: "expo.out" }, 0);
  if (heroH1) tlHero.from(decouper(heroH1), { yPercent: 115, rotate: 4, duration: 1.2, ease: "expo.out", stagger: .06 }, .15);
  if (heroAutres.length) tlHero.from(heroAutres, { y: 30, opacity: 0, duration: 1, ease: "power3.out", stagger: .08 }, .5);
  if (heroImg) gsap.to(heroImg, { yPercent: 12, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });

  /* Intro de marque (une fois par visite) */
  var dejaVu = false; try { dejaVu = sessionStorage.getItem("lw-intro-" + (C.marque || "")) === "1"; sessionStorage.setItem("lw-intro-" + (C.marque || ""), "1"); } catch (e) {}
  if (C.marque && !dejaVu) {
    var ov = document.createElement("div"); ov.className = "lw-intro"; ov.setAttribute("aria-hidden", "true");
    ov.innerHTML = "<div><b>" + C.marque.split("").map(function (ch) { return '<span class="l"><i>' + (ch === " " ? "&nbsp;" : ch) + "</i></span>"; }).join("") + "</b><div class=\"lw-b\"><em></em></div></div>";
    document.body.appendChild(ov); if (lenis) lenis.stop();
    gsap.timeline({ onComplete: function () { ov.remove(); if (lenis) lenis.start(); } })
      .from(ov.querySelectorAll(".l i"), { yPercent: 110, duration: .8, ease: "expo.out", stagger: .035 })
      .to(ov.querySelector("em"), { scaleX: 1, duration: .9, ease: "power2.inOut" }, .2)
      .to(ov.querySelectorAll(".l i"), { yPercent: -110, duration: .5, ease: "power3.in", stagger: .015 }, "+=.1")
      .to(ov, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=.2")
      .add(function () { tlHero.play(); }, "-=.75");
  } else tlHero.play();

  /* Titres de section : mot par mot */
  $$("section h2, section h3.grand, .titre h2").forEach(function (h) {
    if (h.closest(".hero")) return;
    gsap.from(decouper(h), { yPercent: 115, rotate: 3, duration: 1.1, ease: "expo.out", stagger: .045, scrollTrigger: { trigger: h, start: "top 88%" } });
  });
  /* Sur-titres et paragraphes d'intro */
  $$("section .sur, section .centre > p, section .tete p").forEach(function (e) {
    gsap.from(e, { y: 24, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: e, start: "top 90%" } });
  });

  /* Photos : dévoilement + léger zoom, puis parallaxe interne */
  $$("section img").forEach(function (im) {
    if (im.closest(".hero") || im.width && im.width < 120) return;
    var cadre = im.parentElement, clip = getComputedStyle(cadre).overflow !== "visible";
    gsap.fromTo(im, { clipPath: "inset(100% 0% 0% 0%)", scale: clip ? 1.25 : 1 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.5, ease: "expo.out", scrollTrigger: { trigger: cadre, start: "top 86%" } });
  });

  /* Groupes de cartes : arrivée en cascade */
  var vus = new Set();
  $$("section article, section .carte-exp, section .plat, section .canal, section .etape, section details, section .av, section .avis-c, section .ch").forEach(function (el) {
    var p = el.parentElement; if (vus.has(p)) return; vus.add(p);
    var enfants = [].slice.call(p.children).filter(function (c) { return c.matches("article,.carte-exp,.plat,.canal,.etape,details,.av,.avis-c,.ch,div,a"); });
    gsap.from(enfants, { y: 60, opacity: 0, rotateX: -8, transformPerspective: 900, duration: 1.1, ease: "expo.out", stagger: .09, scrollTrigger: { trigger: p, start: "top 85%" } });
  });

  /* Compteurs */
  $$("[data-compte]").forEach(function (e) {
    var brut = e.textContent.trim(), m = brut.match(/^([^\d]*)([\d]+(?:[.,]\d+)?)(.*)$/); if (!m) return;
    var dec = (m[2].split(/[.,]/)[1] || "").length, sep = m[2].indexOf(",") > -1 ? "," : ".", cible = parseFloat(m[2].replace(",", ".")), o = { v: 0 };
    e.textContent = m[1] + (0).toFixed(dec).replace(".", sep) + m[3];
    var maj = function () { e.textContent = m[1] + o.v.toFixed(dec).replace(".", sep) + m[3]; };
    if (e.closest(".hero")) tlHero.to(o, { v: cible, duration: 2, ease: "power2.out", onUpdate: maj }, .6);
    else gsap.to(o, { v: cible, duration: 2, ease: "power2.out", scrollTrigger: { trigger: e, start: "top 92%", once: true }, onUpdate: maj });
  });

  /* En-tête : se cache en descendant, revient en remontant */
  var tete = document.querySelector("header");
  if (tete) ScrollTrigger.create({ start: 300, end: "max", onUpdate: function (s) { gsap.to(tete, { yPercent: s.direction > 0 ? -110 : 0, duration: .45, ease: "power3.out", overwrite: true }); } });

  /* Curseur personnalisé + boutons aimantés (ordinateur) */
  if (fin) {
    html.classList.add("lw-curseur");
    var c = document.createElement("div"), r = document.createElement("div"); c.className = "lw-c"; r.className = "lw-r"; document.body.appendChild(c); document.body.appendChild(r);
    var xc = gsap.quickTo(c, "x", { duration: .12 }), yc = gsap.quickTo(c, "y", { duration: .12 }), xr = gsap.quickTo(r, "x", { duration: .45, ease: "power3" }), yr = gsap.quickTo(r, "y", { duration: .45, ease: "power3" });
    addEventListener("pointermove", function (e) { xc(e.clientX); yc(e.clientY); xr(e.clientX); yr(e.clientY); });
    document.addEventListener("pointerover", function (e) { r.classList.toggle("sur", !!(e.target.closest && e.target.closest("a,button,summary,select,input,textarea,label"))); });
    $$(".btn, .wa, header a.btn").forEach(function (b) {
      b.addEventListener("pointermove", function (e) { var k = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - k.left - k.width / 2) * .28, y: (e.clientY - k.top - k.height / 2) * .38, duration: .4, ease: "power3.out" }); });
      b.addEventListener("pointerleave", function () { gsap.to(b, { x: 0, y: 0, duration: .8, ease: "elastic.out(1,.4)" }); });
    });
  }

  /* ---------- Moments signature ---------- */
  if (C.signature === "restaurant") {
    // La bande défile plus vite quand on fait défiler la page
    var bande = document.querySelector(".defile-bande > div");
    if (bande) { var vit = { v: 1 }; ScrollTrigger.create({ onUpdate: function (s) { gsap.to(vit, { v: 1 + Math.min(Math.abs(s.getVelocity()) / 300, 6), duration: .2, overwrite: true }); gsap.to(vit, { v: 1, duration: 1.2, delay: .2 }); } });
      bande.getAnimations && bande.getAnimations().forEach(function (a) { gsap.ticker.add(function () { a.playbackRate = vit.v; }); }); }
    // La carte en papier se pose sur la table
    var carte = document.querySelector("#carte .feuille");
    if (carte) gsap.fromTo(carte, { rotateX: 55, y: 120, scale: .85, transformPerspective: 1400, transformOrigin: "50% 100%" }, { rotateX: 0, y: 0, scale: 1, ease: "none", scrollTrigger: { trigger: "#carte", start: "top 95%", end: "top 25%", scrub: 1 } });
    // Galerie : colonnes à des vitesses différentes
    $$("#galerie img").forEach(function (im, i) { gsap.to(im.parentElement.tagName === "SECTION" || im.parentElement.classList.contains("grille") ? im : im, { yPercent: (i % 2 ? -8 : 6), ease: "none", scrollTrigger: { trigger: "#galerie", start: "top bottom", end: "bottom top", scrub: true } }); });
  }
  if (C.signature === "hotel") {
    // L'image d'accueil s'ouvre comme une fenêtre sur le lac
    if (heroImg) gsap.fromTo(heroImg, { clipPath: "inset(18% 22% 18% 22% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.8, ease: "expo.inOut", delay: dejaVu || !C.marque ? .1 : 2.1 });
    // Chambres : chaque photo glisse latéralement à l'intérieur de son cadre
    $$(".chambres img").forEach(function (im) { gsap.fromTo(im, { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: im.parentElement, start: "top bottom", end: "bottom top", scrub: true } }); });
    // Expériences : les cartes s'élèvent en 3D, décalées
    $$(".carte-exp").forEach(function (cx, i) { gsap.fromTo(cx, { y: 80 + i * 40 }, { y: 0, ease: "none", scrollTrigger: { trigger: ".exp-grille", start: "top bottom", end: "top 30%", scrub: 1 } }); });
  }
  if (C.signature === "clinique") {
    // Cartes flottantes de l'accueil
    $$(".hero .flottant, .hero [class*=flot], .hero .carte-f").forEach(function (f, i) { gsap.to(f, { y: i % 2 ? 10 : -10, duration: 2.4 + i * .4, ease: "sine.inOut", yoyo: true, repeat: -1 }); });
    // Les 3 étapes se relient par une ligne qui se dessine
    var et = document.querySelector(".etapes");
    if (et) { var ligne = document.createElement("div"); ligne.style.cssText = "position:absolute;left:0;right:0;top:38px;height:2px;background:linear-gradient(90deg,#4C95FF,#fff);transform-origin:left;transform:scaleX(0);opacity:.5;pointer-events:none";
      if (getComputedStyle(et).position === "static") et.style.position = "relative"; et.prepend(ligne);
      gsap.to(ligne, { scaleX: 1, ease: "none", scrollTrigger: { trigger: et, start: "top 80%", end: "bottom 50%", scrub: 1 } }); }
  }

  addEventListener("load", function () { ScrollTrigger.refresh(); });
  document.querySelectorAll(".lg button").forEach(function (b) { b.addEventListener("click", function () { setTimeout(function () { ScrollTrigger.refresh(); }, 50); }); });
})();
