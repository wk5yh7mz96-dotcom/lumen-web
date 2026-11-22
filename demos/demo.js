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
  st.textContent = ".lw-modal{position:fixed;inset:0;z-index:100;background:rgba(5,8,15,.62);backdrop-filter:blur(6px);display:grid;place-items:center;padding:20px}" +
    ".lw-modal[hidden]{display:none}.lw-boite{background:#0F1422;color:#F5F1E8;border:1px solid #2A3350;border-radius:22px;max-width:440px;padding:30px;font-family:Inter,system-ui,sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.5);animation:lwIn .25s ease}" +
    "@keyframes lwIn{from{opacity:0;transform:translateY(12px) scale(.98)}}.lw-ico{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#FFB547,#F27A1A);color:#1A0E02;font-weight:900;margin-bottom:14px}" +
    ".lw-boite h3{font:700 20px Inter,sans-serif;margin-bottom:8px}.lw-p{color:#C9CFDE;line-height:1.6}.lw-sub{color:#8A93AB;font-size:13px;margin-top:10px}" +
    ".lw-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.lw-cta{background:linear-gradient(135deg,#FFB547,#F27A1A);color:#1A0E02;font-weight:800;padding:12px 18px;border-radius:999px;text-decoration:none}" +
    ".lw-fermer{background:none;border:1px solid #2A3350;color:#F5F1E8;padding:12px 18px;border-radius:999px;font:600 14px Inter,sans-serif;cursor:pointer}";
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
