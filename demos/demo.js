/* Kit commun des démonstrations Lumen Web
   - FR/EN : chaque élément traduisible porte data-en (le français est le texte d'origine) ; placeholders : data-en-ph
   - Les boutons de contact (data-contact="whatsapp|email|phone|map") et les formulaires (data-demo-form)
     n'ouvrent RIEN de réel : ces entreprises sont fictives. Une fenêtre explique ce que ferait le vrai site.
   - Menu mobile, apparitions au défilement, en-tête qui change au défilement. */
(function () {
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var els = $$("[data-en]"), phs = $$("[data-en-ph]");
  els.forEach(function (e) { e.dataset.fr = e.innerHTML; });
  phs.forEach(function (e) { e.dataset.frPh = e.placeholder; });
  var lang;
  try { lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("lumen-lang"); } catch (e) {}
  if (lang !== "fr" && lang !== "en") lang = /^fr\b/i.test(navigator.language || "fr") ? "fr" : "en";
  function go(l) {
    lang = l; document.documentElement.lang = l;
    els.forEach(function (e) { e.innerHTML = l === "en" ? e.dataset.en : e.dataset.fr; });
    phs.forEach(function (e) { e.placeholder = l === "en" ? e.dataset.enPh : e.dataset.frPh; });
    $$(".lg button").forEach(function (b) { b.classList.toggle("on", b.dataset.l === l); });
    try { localStorage.setItem("lumen-lang", l); } catch (e) {}
  }
  $$(".lg button").forEach(function (b) { b.addEventListener("click", function () { go(b.dataset.l); }); });
  go(lang);

  /* Fenêtre « démonstration » */
  var T = {
    fr: { t: "Ceci est une démonstration", whatsapp: "Sur le vrai site, ce bouton ouvre directement le <b>WhatsApp de l'entreprise</b>, avec un message déjà rédigé.",
          email: "Sur le vrai site, ce bouton ouvre la <b>messagerie e-mail</b> du visiteur, adressée à l'entreprise.",
          phone: "Sur le vrai site, ce bouton <b>appelle l'entreprise</b> en un geste depuis le téléphone.",
          map: "Sur le vrai site, ce bouton ouvre l'<b>itinéraire dans Google Maps</b>.",
          form: "Sur le vrai site, cette demande arrive chez l'entreprise par <b>WhatsApp ou par e-mail</b>, au choix.",
          sub: "Cette entreprise est fictive : rien n'a été envoyé.", cta: "Je veux un site comme celui-ci", close: "Fermer" },
    en: { t: "This is a demo", whatsapp: "On the real website, this button opens the <b>business's WhatsApp</b> with a ready-written message.",
          email: "On the real website, this button opens the visitor's <b>email app</b>, addressed to the business.",
          phone: "On the real website, this button <b>calls the business</b> in one tap from a phone.",
          map: "On the real website, this button opens <b>directions in Google Maps</b>.",
          form: "On the real website, this request reaches the business by <b>WhatsApp or email</b>, as they prefer.",
          sub: "This business is fictional: nothing was sent.", cta: "I want a website like this", close: "Close" }
  };
  var modal = document.createElement("div");
  modal.className = "lw-modal"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true"); modal.hidden = true;
  modal.innerHTML = '<div class="lw-boite"><div class="lw-ico">✦</div><h3></h3><p class="lw-p"></p><p class="lw-sub"></p>' +
    '<div class="lw-actions"><a class="lw-cta" href="../../?utm_campaign=demo#commander"></a><button type="button" class="lw-fermer"></button></div></div>';
  document.body.appendChild(modal);
  var st = document.createElement("style");
  st.textContent = ".lw-modal{position:fixed;inset:0;z-index:100;background:rgba(5,14,32,.62);backdrop-filter:blur(6px);display:grid;place-items:center;padding:20px}" +
    ".lw-modal[hidden]{display:none}.lw-boite{background:#0E2144;color:#F5F1E8;border:1px solid #2A4272;border-radius:22px;max-width:440px;padding:30px;font-family:Inter,system-ui,sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.5);animation:lwIn .25s ease}" +
    "@keyframes lwIn{from{opacity:0;transform:translateY(12px) scale(.98)}}.lw-ico{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#FFB547,#F27A1A);color:#1A0E02;font-weight:900;margin-bottom:14px}" +
    ".lw-boite h3{font:700 20px Inter,sans-serif;margin-bottom:8px}.lw-p{color:#C9CFDE;line-height:1.6}.lw-sub{color:#8A93AB;font-size:13px;margin-top:10px}" +
    ".lw-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.lw-cta{background:linear-gradient(135deg,#FFB547,#F27A1A);color:#1A0E02;font-weight:800;padding:12px 18px;border-radius:999px;text-decoration:none}" +
    ".lw-fermer{background:none;border:1px solid #2A4272;color:#F5F1E8;padding:12px 18px;border-radius:999px;font:600 14px Inter,sans-serif;cursor:pointer}";
  document.head.appendChild(st);
  var dernierFocus = null;
  function ouvrir(kind) {
    var t = T[lang]; dernierFocus = document.activeElement;
    modal.querySelector("h3").textContent = t.t; modal.querySelector(".lw-p").innerHTML = t[kind] || t.form;
    modal.querySelector(".lw-sub").textContent = t.sub; modal.querySelector(".lw-cta").textContent = t.cta;
    modal.querySelector(".lw-fermer").textContent = t.close; modal.hidden = false; modal.querySelector(".lw-fermer").focus();
  }
  function fermer() { modal.hidden = true; if (dernierFocus) dernierFocus.focus(); }
  modal.addEventListener("click", function (e) { if (e.target === modal || e.target.classList.contains("lw-fermer")) fermer(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) fermer(); });
  $$("[data-contact]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); ouvrir(a.dataset.contact); }); });
  $$("[data-demo-form]").forEach(function (f) { f.addEventListener("submit", function (e) { e.preventDefault(); ouvrir("form"); }); });

  /* Bouton « Retour à Lumen Web » */
  var ret = document.createElement("a"); ret.className = "lw-retour"; ret.href = "../../#realisations";
  function retTexte() { ret.innerHTML = '<span aria-hidden="true">←</span> ' + (lang === "en" ? "Back to Lumen Web" : "Retour à Lumen Web"); }
  retTexte(); document.body.appendChild(ret);
  // se cache en bas de page pour ne pas couvrir le pied de page
  var finPage = function () { ret.classList.toggle("cache", innerHeight + scrollY > document.documentElement.scrollHeight - 160); };
  addEventListener("scroll", finPage, { passive: true }); finPage();
  $$(".lg button").forEach(function (b) { b.addEventListener("click", retTexte); });
  ret.addEventListener("click", function (e) {
    try { sessionStorage.setItem("lw-retour", "1"); } catch (x) {}
    // si on vient du site Lumen Web, on revient exactement où on était
    if (document.referrer && document.referrer.indexOf(location.origin) === 0 && !/\/demos\//.test(document.referrer) && history.length > 1) { e.preventDefault(); history.back(); }
  });
  var st2 = document.createElement("style");
  st2.textContent = ".lw-retour{position:fixed;left:16px;bottom:18px;z-index:95;display:inline-flex;align-items:center;gap:8px;padding:10px 16px 10px 12px;border-radius:999px;" +
    "background:rgba(255,255,255,.94);color:#16162A;border:1px solid rgba(0,0,0,.08);font:600 13.5px Inter,system-ui,sans-serif;text-decoration:none;" +
    "box-shadow:0 8px 24px rgba(0,0,0,.22);backdrop-filter:blur(8px);transition:transform .25s,opacity .3s,box-shadow .25s}" +
    ".lw-retour:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,0,0,.28)}" +
    ".lw-retour span{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#16162A;color:#fff;font-size:13px;line-height:1}" +
    ".lw-retour.cache{opacity:0;pointer-events:none;transform:translateY(10px)}" +
    "@media (max-width:640px){.lw-retour{left:12px;bottom:22px;font-size:12.5px;padding:9px 14px 9px 10px}}";
  document.head.appendChild(st2);

  /* Menu mobile */
  var burger = document.querySelector(".burger"), nav = document.querySelector("header nav");
  if (burger && nav) {
    burger.addEventListener("click", function () { var o = nav.classList.toggle("ouvert"); burger.setAttribute("aria-expanded", o); });
    $$("header nav a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("ouvert"); burger.setAttribute("aria-expanded", "false"); }); });
  }
  /* En-tête au défilement */
  var h = document.querySelector("header");
  if (h) { var maj = function () { h.classList.toggle("defile", scrollY > 40); }; addEventListener("scroll", maj, { passive: true }); maj(); }
  /* Apparitions (désactivées pour les captures : ?capture) */
  if (!new URLSearchParams(location.search).has("capture") && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("anim");
    var obs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("vu"); obs.unobserve(e.target); } }); }, { threshold: 0, rootMargin: "0px 0px 15% 0px" });
    $$(".rv").forEach(function (el) { obs.observe(el); });
  }
})();
