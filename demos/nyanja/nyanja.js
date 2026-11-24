/* Nyanja · démonstration Lumen Web
   Carte interactive, fiches plats, panier → commande WhatsApp, créneaux de réservation,
   devis événements, carte cadeau, prix en plusieurs monnaies. Tout est simulé : rien n'est envoyé. */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const en = () => document.documentElement.lang === "en";
  const T = (fr, an) => (en() ? an : fr);

  /* ---------- Monnaies (prix de base en dollars, taux indicatifs) ---------- */
  const DEVISES = {
    USD: { s: "$", r: 1, pas: 0.5, avant: true, n: "Dollar US ($)" },
    EUR: { s: "€", r: 0.93, pas: 0.5, n: "Euro (€)" },
    XOF: { s: "FCFA", r: 610, pas: 100, n: "Franc CFA (FCFA)" },
    CDF: { s: "FC", r: 2850, pas: 500, n: "Franc congolais (FC)" },
    UGX: { s: "UGX", r: 4200, pas: 1000, n: "Shilling ougandais (UGX)" },
    KES: { s: "KSh", r: 129, pas: 10, n: "Shilling kényan (KSh)" },
    NGN: { s: "₦", r: 1550, pas: 100, avant: true, n: "Naira (₦)" }
  };
  let devise = "USD";
  try { devise = localStorage.getItem("nyanja-devise") || devise; } catch (e) {}
  if (!DEVISES[devise]) devise = "USD";
  function prix(usd) {
    const d = DEVISES[devise]; let v = Math.round(usd * d.r / d.pas) * d.pas;
    const txt = v.toLocaleString(en() ? "en-US" : "fr-FR", { minimumFractionDigits: d.pas < 1 && v % 1 ? 2 : 0, maximumFractionDigits: 2 });
    return d.avant ? d.s + txt : txt + " " + d.s;
  }

  /* ---------- La carte ---------- */
  const CATS = [
    { id: "entrees", fr: "Entrées", en: "Starters" },
    { id: "plats", fr: "Plats", en: "Mains" },
    { id: "sauces", fr: "Soupes & sauces", en: "Soups & sauces" },
    { id: "douceurs", fr: "Douceurs", en: "Sweets" },
    { id: "boissons", fr: "Boissons", en: "Drinks" }
  ];
  const M = [
    { id: "dodo", c: "entrees", p: 3, pim: 1, veg: 1, fr: ["Plantain frit (dodo)", "Doré et caramélisé, sauce pimentée", "Banane plantain mûre, huile, sel, sauce piment"], en: ["Fried plantain (dodo)", "Golden and caramelised, chili sauce", "Ripe plantain, oil, salt, chili sauce"], all: [] },
    { id: "puff", c: "entrees", p: 3, veg: 1, fr: ["Beignets puff-puff", "Légers et chauds, à partager", "Farine, levure, sucre, muscade"], en: ["Puff-puff", "Light and warm, to share", "Flour, yeast, sugar, nutmeg"], all: ["gluten"] },
    { id: "suya", c: "entrees", p: 6, pim: 2, fr: ["Brochettes suya", "Épices à l'arachide, oignon, tomate", "Bœuf, poudre de suya (arachide, piment, gingembre), oignon"], en: ["Beef suya skewers", "Peanut spice, onion, tomato", "Beef, suya spice (peanut, chili, ginger), onion"], all: ["arachide"] },
    { id: "avocat", c: "entrees", p: 4, veg: 1, fr: ["Salade d'avocat", "Tomate, oignon rouge, citron vert", "Avocat, tomate, oignon rouge, coriandre, citron vert"], en: ["Avocado salad", "Tomato, red onion, lime", "Avocado, tomato, red onion, coriander, lime"], all: [] },
    { id: "jollof", c: "plats", p: 12, pim: 1, img: "jollof", sig: "Le plus aimé|Most loved", fr: ["Jollof royal", "Riz jollof fumé et riz sauté, poulet grillé, poisson braisé et sauce arachide onctueuse.", "Riz, tomate, poivrons, poulet, poisson, arachide, épices"], en: ["Royal jollof", "Smoky jollof and fried rice, grilled chicken, braised fish and a creamy groundnut sauce.", "Rice, tomato, peppers, chicken, fish, groundnut, spices"], all: ["arachide", "poisson"] },
    { id: "ananas", c: "plats", p: 12, img: "ananas", sig: "Signature|Signature", fr: ["Riz ananas & poulet laqué", "Riz sauté aux légumes servi dans un ananas entier, poulet laqué au miel et sésame.", "Riz, petits pois, carottes, ananas, poulet, miel, sésame"], en: ["Pineapple rice & glazed chicken", "Vegetable fried rice served in a whole pineapple, honey-glazed chicken and sesame.", "Rice, peas, carrots, pineapple, chicken, honey, sesame"], all: ["sésame", "soja"] },
    { id: "ofada", c: "plats", p: 10, pim: 3, img: "ofada", fr: ["Ofada & plantain", "Riz ofada local, sauce aux piments avec œuf, et plantain doré à la poêle.", "Riz ofada, piments, poivrons, œuf, plantain, huile de palme"], en: ["Ofada & plantain", "Local ofada rice, a spicy pepper sauce with egg, and golden fried plantain.", "Ofada rice, chili, peppers, egg, plantain, palm oil"], all: ["œuf"] },
    { id: "ragout", c: "plats", p: 11, pim: 2, img: "ragout", fr: ["Ragoût de la maison", "Bœuf, viandes assorties et œufs dans une riche sauce rouge aux poivrons, avec riz aux haricots.", "Bœuf, tripes, œufs, tomate, poivrons, riz, haricots"], en: ["House stew", "Beef, assorted meats and eggs in a rich red pepper sauce, with rice and beans.", "Beef, tripe, eggs, tomato, peppers, rice, beans"], all: ["œuf"] },
    { id: "egusi", c: "sauces", p: 13, pim: 1, img: "egusi-foufou", sig: "Tradition|Tradition", fr: ["Egusi & foufou", "Sauce aux graines de courge, bœuf et légumes-feuilles, servie avec un foufou fait main.", "Graines d'egusi, bœuf, feuilles amères, huile de palme, manioc"], en: ["Egusi & fufu", "Melon-seed sauce with beef and bitter leaves, served with hand-made fufu.", "Egusi seeds, beef, bitter leaves, palm oil, cassava"], all: [] },
    { id: "igname", c: "sauces", p: 14, pim: 1, img: "egusi-igname", fr: ["Egusi & igname pilée", "Notre egusi servi avec deux boules d'igname pilée, sur feuille de bananier.", "Graines d'egusi, bœuf, légumes-feuilles, igname"], en: ["Egusi & pounded yam", "Our egusi served with two balls of pounded yam, on banana leaf.", "Egusi seeds, beef, greens, yam"], all: [] },
    { id: "pepper", c: "sauces", p: 11, pim: 3, img: "pepper-soup", fr: ["Pepper soup au poisson-chat", "Un bouillon parfumé et poivré, poisson-chat, feuilles d'utazi et piment frais.", "Poisson-chat, épices pepper soup, utazi, piment"], en: ["Catfish pepper soup", "A fragrant, peppery broth with catfish, utazi leaves and fresh chili.", "Catfish, pepper soup spices, utazi, chili"], all: ["poisson"] },
    { id: "feuilles", c: "sauces", p: 12, pim: 1, img: "feuilles", fr: ["Sauce feuilles & bœuf rôti", "Légumes-feuilles mijotés, bœuf rôti et plantain frit.", "Légumes-feuilles, bœuf, oignon, huile de palme, plantain"], en: ["Leaf sauce & roast beef", "Slow-cooked greens, roast beef and fried plantain.", "Greens, beef, onion, palm oil, plantain"], all: [] },
    { id: "puffmiel", c: "douceurs", p: 4, veg: 1, fr: ["Puff-puff au miel & mangue", "Tièdes, avec mangue fraîche", "Puff-puff, miel, mangue"], en: ["Honey puff-puff & mango", "Warm, with fresh mango", "Puff-puff, honey, mango"], all: ["gluten"] },
    { id: "plroti", c: "douceurs", p: 4, veg: 1, fr: ["Plantain rôti", "Caramel, noix de coco grillée", "Plantain, caramel, coco"], en: ["Baked plantain", "Caramel, toasted coconut", "Plantain, caramel, coconut"], all: ["lait"] },
    { id: "passion", c: "douceurs", p: 4, veg: 1, fr: ["Crème passion", "Légère et acidulée", "Fruit de la passion, crème, sucre"], en: ["Passion fruit cream", "Light and tangy", "Passion fruit, cream, sugar"], all: ["lait"] },
    { id: "bissap", c: "boissons", p: 2, veg: 1, fr: ["Bissap (zobo)", "Hibiscus, gingembre, ananas, menthe", "Hibiscus, gingembre, ananas, menthe"], en: ["Bissap (zobo)", "Hibiscus, ginger, pineapple, mint", "Hibiscus, ginger, pineapple, mint"], all: [] },
    { id: "jpassion", c: "boissons", p: 2.5, veg: 1, fr: ["Jus de passion frais", "Pressé chaque matin", "Fruit de la passion, eau, sucre de canne"], en: ["Fresh passion juice", "Pressed every morning", "Passion fruit, water, cane sugar"], all: [] },
    { id: "gingembre", c: "boissons", p: 2, veg: 1, fr: ["Jus de gingembre", "Citron, un peu de miel", "Gingembre, citron, miel"], en: ["Ginger juice", "Lemon, a little honey", "Ginger, lemon, honey"], all: [] },
    { id: "cafe", c: "boissons", p: 2.5, veg: 1, fr: ["Café d'Afrique de l'Est", "Arabica des hauts plateaux", "Café arabica"], en: ["East African coffee", "Highland arabica", "Arabica coffee"], all: [] }
  ];
  const parId = Object.fromEntries(M.map(m => [m.id, m]));
  const SIGNATURE = ["jollof", "egusi", "pepper", "ananas", "ofada", "ragout"];
  const ALL_EN = { arachide: "peanut", poisson: "fish", "œuf": "egg", "sésame": "sesame", soja: "soy", gluten: "gluten", lait: "milk" };
  const nom = m => (en() ? m.en : m.fr)[0], desc = m => (en() ? m.en : m.fr)[1];
  const piments = n => n ? "🌶️".repeat(n) : "";
  const IMG_DIM = { jollof: [600, 598], ananas: [600, 782], ofada: [600, 962], ragout: [600, 752], "egusi-foufou": [600, 741], "egusi-igname": [600, 793], "pepper-soup": [600, 663], feuilles: [600, 815] };
  const img = (m, l) => `img/${m.img}-${l && m.img !== "feuilles" ? "l" : "s"}.webp`;

  /* Plats signature */
  function rendrePlats() {
    $("#plats-grille").innerHTML = SIGNATURE.map(id => { const m = parId[id], [w, hh] = IMG_DIM[m.img];
      const sig = m.sig ? `<span class="tag">${m.sig.split("|")[en() ? 1 : 0]}</span>` : (m.pim === 3 ? `<span class="tag">${T("Très pimenté", "Very spicy")}</span>` : "");
      return `<article class="plat" data-id="${id}" tabindex="0" role="button" aria-label="${nom(m)} : ${T("voir la fiche", "see details")}">
        <div class="ph"><img src="${img(m)}" width="${w}" height="${hh}" alt="${nom(m)}" loading="lazy">${sig}<span class="prix">${prix(m.p)}</span>
        <button type="button" class="plus" data-ajout="${id}" aria-label="${T("Ajouter", "Add")} ${nom(m)}">+</button></div>
        <h3>${nom(m)}</h3><p>${desc(m)}</p><div class="mots">${m.pim ? `<span class="piment" title="${T("Niveau de piment", "Spice level")}">${piments(m.pim)}</span>` : ""}<span>${T("Voir la fiche →", "See details →")}</span></div></article>`;
    }).join("");
  }

  /* Carte à onglets */
  let ongletActif = 0;
  function rendreCarte() {
    $("#onglets").innerHTML = CATS.map((c, i) => `<button type="button" role="tab" id="o-${c.id}" aria-controls="p-${c.id}" aria-selected="${i === ongletActif}" tabindex="${i === ongletActif ? 0 : -1}">${en() ? c.en : c.fr}</button>`).join("");
    $("#panneaux").innerHTML = CATS.map((c, i) => `<div class="carte" id="p-${c.id}" role="tabpanel" aria-labelledby="o-${c.id}" ${i === ongletActif ? "" : "hidden"}>` +
      M.filter(m => m.c === c.id).map(m => `<div class="ligne"><div class="txt" data-id="${m.id}" role="button" tabindex="0"><div class="h"><b>${nom(m)}</b><span class="pts"></span><span class="p">${prix(m.p)}</span></div><small>${desc(m).length > 70 ? (en() ? m.en : m.fr)[2] : desc(m)}</small>${m.veg ? `<i>${T("VÉG", "VEG")}</i>` : ""}${m.pim > 1 ? `<i>${piments(m.pim)}</i>` : ""}</div><button type="button" class="plus" data-ajout="${m.id}" aria-label="${T("Ajouter", "Add")} ${nom(m)}">+</button></div>`).join("") + `</div>`).join("");
    const ong = $$("#onglets button");
    ong.forEach((b, i) => { b.onclick = () => { ongletActif = i; rendreCarte(); $$("#onglets button")[i].focus(); };
      b.onkeydown = e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { ongletActif = (i + (e.key === "ArrowRight" ? 1 : -1) + CATS.length) % CATS.length; rendreCarte(); $$("#onglets button")[ongletActif].focus(); } }; });
  }

  /* Sélecteurs de monnaie */
  function rendreDevises() {
    $$("select.devise").forEach(s => { s.innerHTML = Object.entries(DEVISES).map(([k, d]) => `<option value="${k}" ${k === devise ? "selected" : ""}>${d.n}</option>`).join("");
      s.onchange = () => { devise = s.value; try { localStorage.setItem("nyanja-devise", devise); } catch (e) {} toutRendre(); }; });
  }

  /* ---------- Fiche plat ---------- */
  const fiche = $("#fiche"); let ficheId = null, avantFiche = null;
  function ouvrirFiche(id) {
    const m = parId[id]; if (!m) return; ficheId = id; avantFiche = document.activeElement;
    const im = fiche.querySelector(".fi-img"); im.hidden = !m.img;
    if (m.img) { im.querySelector("img").src = img(m, true); im.querySelector("img").alt = nom(m); }
    fiche.querySelector(".fi-boite").style.gridTemplateColumns = m.img ? "" : "1fr";
    fiche.querySelector(".fi-cat").textContent = (CATS.find(c => c.id === m.c) || {})[en() ? "en" : "fr"];
    fiche.querySelector("#fi-nom").textContent = nom(m);
    fiche.querySelector(".fi-desc").textContent = desc(m);
    fiche.querySelector(".fi-pim").textContent = m.pim ? piments(m.pim) + " " + [T("doux", "mild"), T("relevé", "medium"), T("très pimenté", "very spicy")][m.pim - 1] : T("Pas pimenté", "Not spicy");
    fiche.querySelector(".fi-ing").textContent = (en() ? m.en : m.fr)[2];
    fiche.querySelector(".fi-all").textContent = m.all.length ? m.all.map(a => en() ? ALL_EN[a] : a).join(", ") : T("Aucun allergène majeur", "No major allergens");
    fiche.querySelector(".fi-prix").textContent = prix(m.p);
    fiche.querySelector(".fi-ajout").textContent = T("Ajouter à ma commande", "Add to my order");
    fiche.hidden = false; fiche.querySelector(".fi-x").focus();
  }
  const fermerFiche = () => { fiche.hidden = true; if (avantFiche) avantFiche.focus(); };
  fiche.querySelector(".fi-x").onclick = fermerFiche;
  fiche.addEventListener("click", e => { if (e.target === fiche) fermerFiche(); });
  fiche.querySelector(".fi-ajout").onclick = () => { ajouter(ficheId); fermerFiche(); };

  /* ---------- Panier ---------- */
  let panier = {}; let mode = "livraison";
  try { panier = JSON.parse(localStorage.getItem("nyanja-panier") || "{}"); } catch (e) {}
  const sauver = () => { try { localStorage.setItem("nyanja-panier", JSON.stringify(panier)); } catch (e) {} };
  const nbArticles = () => Object.values(panier).reduce((a, b) => a + b, 0);
  const total = () => Object.entries(panier).reduce((s, [id, q]) => s + (parId[id] ? parId[id].p * q : 0), 0);
  function ajouter(id) {
    panier[id] = (panier[id] || 0) + 1; sauver(); majPanier();
    const btn = $("#panier-btn"); btn.animate([{ scale: 1 }, { scale: 1.12 }, { scale: 1 }], { duration: 400 });
    $$(`[data-ajout="${id}"]`).forEach(b => { b.classList.add("ok"); b.textContent = "✓"; setTimeout(() => { b.classList.remove("ok"); b.textContent = "+"; }, 900); });
  }
  function majPanier() {
    const n = nbArticles(), btn = $("#panier-btn");
    btn.hidden = n === 0; $("#pb-n").textContent = n; $("#pb-total").textContent = prix(total());
    $("#pn-liste").innerHTML = n ? Object.entries(panier).map(([id, q]) => { const m = parId[id];
      return `<div class="pn-item"><div><b>${nom(m)}</b><small>${prix(m.p)} × ${q}</small></div><div class="q"><button type="button" data-q="-1" data-id="${id}" aria-label="${T("Retirer un", "Remove one")}">−</button><span>${q}</span><button type="button" data-q="1" data-id="${id}" aria-label="${T("Ajouter un", "Add one")}">+</button></div></div>`; }).join("")
      : `<p class="pn-vide">${T("Votre commande est vide. Ajoutez des plats depuis la carte.", "Your order is empty. Add dishes from the menu.")}</p>`;
    $("#pn-total").textContent = prix(total() + (mode === "livraison" && n ? 1.5 : 0));
    $("#pn-livr").textContent = mode === "livraison" ? T(`Livraison incluse : ${prix(1.5)} · environ 35 min`, `Delivery included: ${prix(1.5)} · about 35 min`) : mode === "emporter" ? T("Prêt en 20 min environ", "Ready in about 20 min") : T("Vos plats sont servis dès votre arrivée", "Your dishes are served as soon as you arrive");
    $("#c-adr-champ").hidden = mode !== "livraison";
  }
  $("#pn-liste").addEventListener("click", e => { const b = e.target.closest("button[data-q]"); if (!b) return; const id = b.dataset.id; panier[id] = (panier[id] || 0) + +b.dataset.q; if (panier[id] <= 0) delete panier[id]; sauver(); majPanier(); });
  const panierEl = $("#panier"); let avantPanier = null;
  $("#panier-btn").onclick = () => { avantPanier = document.activeElement; panierEl.hidden = false; panierEl.querySelector(".pn-x").focus(); };
  const fermerPanier = () => { panierEl.hidden = true; if (avantPanier) avantPanier.focus(); };
  $$("[data-fermer]").forEach(b => b.onclick = fermerPanier);
  $$(".mode").forEach(b => b.onclick = () => { mode = b.dataset.m; $$(".mode").forEach(x => x.classList.toggle("on", x === b)); majPanier(); });

  /* Clics : ajout et fiches (délégation) */
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-ajout]"); if (a) { e.stopPropagation(); ajouter(a.dataset.ajout); return; }
    const f = e.target.closest(".plat[data-id], .ligne .txt[data-id]"); if (f) ouvrirFiche(f.dataset.id);
  });
  document.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".plat[data-id], .ligne .txt[data-id]")) { e.preventDefault(); ouvrirFiche(e.target.dataset.id); }
    if (e.key === "Escape") { if (!fiche.hidden) fermerFiche(); else if (!panierEl.hidden) fermerPanier(); else if (!$("#wa-modale").hidden) fermerWa(); else if (!$("#lb").hidden) fermerLb(); }
  });

  /* ---------- Message WhatsApp (démonstration) ---------- */
  let avantWa = null;
  let via = "wa";
  function whatsapp(titre, texte) {
    const mail = via === "mail", boite = $("#wa-modale .wa-boite");
    boite.classList.toggle("mail", mail);
    $("#wa-sous").textContent = mail ? T("Nouveau message", "New message") : T("en ligne · répond en 15 min", "online · replies within 15 min");
    $("#mail-objet").textContent = titre + " · " + T("site Nyanja", "Nyanja website");
    if (mail) texte = texte.replace(/ 👋/, ",").replace(/[👤📞📅🕐👥💬🛵🥡🍽️📍💰🎉🎁💝✍️]\uFE0F? ?/gu, "") + "\n\n—\n" + T("Envoyé depuis le site de Nyanja", "Sent from the Nyanja website");
    $("#wa-titre").textContent = mail ? T("Votre e-mail", "Your email") : "Nyanja · " + titre;
    const bulle = $("#wa-bulle"); bulle.textContent = texte;
    const s = document.createElement("small"); s.textContent = mail ? "" : new Date().toTimeString().slice(0, 5) + " ✓✓"; bulle.appendChild(s);
    $("#wa-explique").innerHTML = mail
      ? T("<b>Ceci est une démonstration :</b> sur le vrai site, votre messagerie s'ouvre à cet instant avec cet e-mail déjà écrit, adressé au restaurant. Rien n'a été envoyé.",
          "<b>This is a demo:</b> on the real website, your email app opens right now with this email already written, addressed to the restaurant. Nothing has been sent.")
      : T("<b>Ceci est une démonstration :</b> sur le vrai site, WhatsApp s'ouvre à cet instant avec ce message déjà écrit, adressé au restaurant. Rien n'a été envoyé.",
          "<b>This is a demo:</b> on the real website, WhatsApp opens right now with this message already written, addressed to the restaurant. Nothing has been sent.");
    // Vrai site (e-mail) : location.href = "mailto:<adresse>?subject=" + encodeURIComponent(objet) + "&body=" + encodeURIComponent(texte)
    // Sur le vrai site : window.open("https://wa.me/<numéro du restaurant>?text=" + encodeURIComponent(texte))
    avantWa = document.activeElement; $("#wa-modale").hidden = false; $("#wa-fermer").focus();
  }
  function fermerWa() { $("#wa-modale").hidden = true; if (avantWa) avantWa.focus(); }
  $("#wa-fermer").onclick = fermerWa;
  $("#wa-modale").addEventListener("click", e => { if (e.target.id === "wa-modale") fermerWa(); });

  /* Validation */
  function erreur(el, msg) { const c = el.closest(".champ"); c.classList.toggle("ko", !!msg); const s = c.querySelector(".err"); if (s) s.textContent = msg || ""; el.setAttribute("aria-invalid", !!msg); return !msg; }
  const telOk = v => /^[+\d][\d\s().-]{7,}$/.test(v.trim());

  /* Commande */
  const commander = () => {
    if (!nbArticles()) return;
    const nomC = $("#c-nom"), tel = $("#c-tel"), adr = $("#c-adr");
    let ok = erreur(nomC, nomC.value.trim().length < 2 ? T("Indiquez votre nom.", "Please enter your name.") : "");
    ok = erreur(tel, !telOk(tel.value) ? T("Numéro invalide.", "Invalid number.") : "") && ok;
    if (mode === "livraison") ok = erreur(adr, adr.value.trim().length < 4 ? T("Indiquez l'adresse.", "Please enter the address.") : "") && ok;
    if (!ok) return;
    const lignes = Object.entries(panier).map(([id, q]) => `• ${q} × ${nom(parId[id])} — ${prix(parId[id].p * q)}`).join("\n");
    const modeTxt = { livraison: T("🛵 Livraison", "🛵 Delivery"), emporter: T("🥡 À emporter", "🥡 Takeaway"), place: T("🍽️ Prêt à mon arrivée", "🍽️ Ready when I arrive") }[mode];
    whatsapp(T("Commandes", "Orders"), T(
      `Bonjour Nyanja 👋\nJe voudrais commander :\n\n${lignes}\n\n${modeTxt}` + (mode === "livraison" ? `\n📍 Adresse : ${adr.value.trim()}\n🛵 Livraison : ${prix(1.5)}` : "") + `\n💰 Total : ${$("#pn-total").textContent}\n\n👤 ${nomC.value.trim()} · ${tel.value.trim()}\n\nMerci !`,
      `Hello Nyanja 👋\nI'd like to order:\n\n${lignes}\n\n${modeTxt}` + (mode === "livraison" ? `\n📍 Address: ${adr.value.trim()}\n🛵 Delivery: ${prix(1.5)}` : "") + `\n💰 Total: ${$("#pn-total").textContent}\n\n👤 ${nomC.value.trim()} · ${tel.value.trim()}\n\nThank you!`));
  };

  $("#pn-envoyer").onclick = () => { via = "wa"; commander(); };
  $("#pn-mail").onclick = () => { via = "mail"; commander(); };

  /* ---------- Réservation : créneaux ---------- */
  const f = $("#form-resa"), dateIn = $("#r-date"), heureIn = $("#r-heure"), out = $("#r-pers"); let pers = 2;
  const now = new Date(), iso = d => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10); };
  dateIn.min = iso(now); dateIn.value = iso(now);
  const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const GROUPES = [["Midi", "Lunch", ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00"]], ["Soir", "Evening", ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"]], ["Nuit", "Late night", ["22:30", "23:30", "00:30", "01:30", "02:30"]]];
  function creneaux() {
    const d = dateIn.value, aujourdhui = d === iso(now), minNow = now.getHours() * 60 + now.getMinutes();
    let libres = 0;
    $("#creneaux").innerHTML = GROUPES.map(([fr, an, hs]) => `<h5>${T(fr, an)}</h5>` + hs.map(hh => {
      const [H, Mi] = hh.split(":").map(Number), mins = H * 60 + Mi + (H < 6 ? 1440 : 0);
      const passe = aujourdhui && mins < minNow + 30, complet = hash(d + hh) % 4 === 0;
      if (!passe && !complet) libres++;
      return `<button type="button" role="radio" aria-checked="${heureIn.value === hh}" ${passe || complet ? "disabled" : ""} data-h="${hh}" title="${complet ? T("Complet", "Fully booked") : ""}">${en() ? hh : hh.replace(":", " h ")}</button>`;
    }).join("")).join("");
    const soir = GROUPES[1][2].filter(hh => !(hash(d + hh) % 4 === 0)).length, peu = soir <= 4;
    const di = $("#dispo"); di.classList.toggle("peu", peu);
    di.textContent = peu ? T(`🔥 Plus que ${Math.max(1, soir - 2)} tables ce soir`, `🔥 Only ${Math.max(1, soir - 2)} tables left tonight`) : T(`✓ ${libres} créneaux disponibles`, `✓ ${libres} time slots available`);
    if (heureIn.value && !$(`#creneaux button[data-h="${heureIn.value}"]:not(:disabled)`)) heureIn.value = "";
    recap();
  }
  $("#creneaux").addEventListener("click", e => { const b = e.target.closest("button[data-h]"); if (!b || b.disabled) return; heureIn.value = b.dataset.h; $$("#creneaux button").forEach(x => x.setAttribute("aria-checked", x === b)); $("#err-heure").textContent = ""; recap(); });
  dateIn.addEventListener("change", creneaux);
  $$(".pers button").forEach(b => b.addEventListener("click", () => { pers = Math.min(20, Math.max(1, pers + +b.dataset.p)); out.textContent = pers; recap(); }));
  const jolieDate = v => v ? new Date(v + "T12:00").toLocaleDateString(en() ? "en-GB" : "fr-FR", { weekday: "long", day: "numeric", month: "long" }) : "";
  const heureTxt = () => heureIn.value ? (en() ? heureIn.value : heureIn.value.replace(":", " h ")) : T("(choisissez un horaire)", "(choose a time)");
  function recap() {
    $("#recap-txt").innerHTML = T(`Table pour <b>${pers} personne${pers > 1 ? "s" : ""}</b>, <b>${jolieDate(dateIn.value)}</b> à <b>${heureTxt()}</b>. Votre message sera prêt à envoyer, sur WhatsApp ou par e-mail.`,
      `Table for <b>${pers} ${pers > 1 ? "people" : "person"}</b>, <b>${jolieDate(dateIn.value)}</b> at <b>${heureTxt()}</b>. Your message will be ready to send, by WhatsApp or email.`);
  }
  f.addEventListener("input", recap);
  f.addEventListener("submit", e => {
    e.preventDefault(); via = (e.submitter && e.submitter.dataset.via) || "wa";
    const nomR = $("#r-nom"), tel = $("#r-tel"), msg = $("#r-msg").value.trim();
    let ok = erreur(nomR, nomR.value.trim().length < 2 ? T("Indiquez votre nom.", "Please enter your name.") : "");
    ok = erreur(tel, !telOk(tel.value) ? T("Indiquez un numéro valide.", "Please enter a valid phone number.") : "") && ok;
    ok = erreur(dateIn, !dateIn.value || dateIn.value < dateIn.min ? T("Choisissez aujourd'hui ou une date à venir.", "Choose today or a later date.") : "") && ok;
    if (!heureIn.value) { $("#err-heure").textContent = T("Choisissez un horaire.", "Please choose a time."); ok = false; }
    if (!ok) return;
    whatsapp(T("Réservations", "Bookings"), T(
      `Bonjour Nyanja 👋\nJe souhaite réserver une table :\n\n👤 Nom : ${nomR.value.trim()}\n📞 Téléphone : ${tel.value.trim()}\n📅 Date : ${jolieDate(dateIn.value)}\n🕐 Heure : ${heureTxt()}\n👥 Personnes : ${pers}` + (msg ? `\n💬 Message : ${msg}` : "") + `\n\nMerci !`,
      `Hello Nyanja 👋\nI'd like to book a table:\n\n👤 Name: ${nomR.value.trim()}\n📞 Phone: ${tel.value.trim()}\n📅 Date: ${jolieDate(dateIn.value)}\n🕐 Time: ${heureTxt()}\n👥 Guests: ${pers}` + (msg ? `\n💬 Message: ${msg}` : "") + `\n\nThank you!`));
  });

  /* ---------- Événements ---------- */
  let typeEvt = "anniversaire";
  const EVT = { anniversaire: ["Anniversaire", "Birthday"], mariage: ["Mariage / dot", "Wedding / dowry"], entreprise: ["Repas d'entreprise", "Company dinner"], traiteur: ["Traiteur à domicile", "Catering at home"] };
  $$(".evt").forEach(b => b.onclick = () => { typeEvt = b.dataset.t; $$(".evt").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); }); });
  $("#d-date").min = iso(now);
  $("#form-devis").addEventListener("submit", e => {
    e.preventDefault(); via = (e.submitter && e.submitter.dataset.via) || "wa";
    const dd = $("#d-date"), inv = $("#d-inv"), nm = $("#d-nom"), tl = $("#d-tel");
    let ok = erreur(dd, !dd.value ? T("Choisissez une date.", "Choose a date.") : "");
    ok = erreur(inv, !(+inv.value >= 5) ? T("5 invités minimum.", "At least 5 guests.") : "") && ok;
    ok = erreur(nm, nm.value.trim().length < 2 ? T("Indiquez votre nom.", "Please enter your name.") : "") && ok;
    ok = erreur(tl, !telOk(tl.value) ? T("Numéro invalide.", "Invalid number.") : "") && ok;
    if (!ok) return;
    const m = $("#d-msg").value.trim(), t = EVT[typeEvt][en() ? 1 : 0];
    whatsapp(T("Événements", "Events"), T(
      `Bonjour Nyanja 👋\nJe voudrais un devis :\n\n🎉 ${t}\n📅 ${jolieDate(dd.value)}\n👥 ${inv.value} invités` + (m ? `\n💬 ${m}` : "") + `\n\n👤 ${nm.value.trim()} · ${tl.value.trim()}\n\nMerci !`,
      `Hello Nyanja 👋\nI'd like a quote:\n\n🎉 ${t}\n📅 ${jolieDate(dd.value)}\n👥 ${inv.value} guests` + (m ? `\n💬 ${m}` : "") + `\n\n👤 ${nm.value.trim()} · ${tl.value.trim()}\n\nThank you!`));
  });

  /* ---------- Carte cadeau ---------- */
  const MONTANTS = [25, 50, 100, 200]; let montant = 50;
  function rendreCadeau() {
    $("#montants").innerHTML = MONTANTS.map(v => `<button type="button" role="radio" aria-checked="${v === montant}" data-v="${v}">${prix(v)}</button>`).join("");
    $("#ck-montant").textContent = prix(montant);
    const n = $("#ck-nom").value.trim(); $("#ck-pour").textContent = n ? T("Pour ", "For ") + n : T("Pour quelqu'un de spécial", "For someone special");
  }
  $("#montants").addEventListener("click", e => { const b = e.target.closest("button[data-v]"); if (!b) return; montant = +b.dataset.v; rendreCadeau(); });
  $("#ck-nom").addEventListener("input", rendreCadeau);
  const offrir = () => {
    const n = $("#ck-nom").value.trim(), mo = $("#ck-mot").value.trim();
    whatsapp(T("Cartes cadeaux", "Gift cards"), T(
      `Bonjour Nyanja 👋\nJe voudrais offrir une carte cadeau :\n\n🎁 Montant : ${prix(montant)}` + (n ? `\n💝 Pour : ${n}` : "") + (mo ? `\n✍️ Message : « ${mo} »` : "") + `\n\nComment puis-je payer ? Merci !`,
      `Hello Nyanja 👋\nI'd like to give a gift card:\n\n🎁 Amount: ${prix(montant)}` + (n ? `\n💝 For: ${n}` : "") + (mo ? `\n✍️ Message: “${mo}”` : "") + `\n\nHow can I pay? Thank you!`));
  };

  $("#ck-offrir").onclick = () => { via = "wa"; offrir(); };
  $("#ck-mail").onclick = () => { via = "mail"; offrir(); };

  /* ---------- Jour / Nuit ---------- */
  const vJ = $("#v-jour"), vN = $("#v-nuit"), heure = $("#v-heure");
  function moment(mo) {
    $$(".bascule button").forEach(b => b.setAttribute("aria-selected", b.dataset.m === mo));
    $("#m-jour").hidden = mo !== "jour"; $("#m-nuit").hidden = mo !== "nuit";
    vJ.classList.toggle("cache", mo !== "jour"); vN.classList.toggle("cache", mo !== "nuit");
    heure.textContent = mo === "jour" ? T("☀ 12 h 30 · déjeuner", "☀ 12:30 pm · lunch") : T("☾ 23 h 45 · dîner & terrasse", "☾ 11:45 pm · dinner & terrace");
    heure.dataset.m = mo;
  }
  $$(".bascule button").forEach(b => b.addEventListener("click", () => moment(b.dataset.m)));
  moment(now.getHours() >= 6 && now.getHours() < 18 ? "jour" : "nuit");

  /* ---------- Galerie plein écran ---------- */
  const lb = $("#lb"), photos = $$(".galerie button"); let cur = 0, avant = null;
  function voir(i) { cur = (i + photos.length) % photos.length; const im = photos[cur].querySelector("img");
    lb.querySelector("img").src = im.dataset.l || im.currentSrc; lb.querySelector("img").alt = im.alt; lb.querySelector("p").textContent = im.alt + " · " + (cur + 1) + "/" + photos.length; }
  photos.forEach((b, i) => b.addEventListener("click", () => { avant = b; voir(i); lb.hidden = false; lb.querySelector(".fermer").focus(); }));
  function fermerLb() { lb.hidden = true; if (avant) avant.focus(); }
  lb.querySelector(".fermer").onclick = fermerLb; lb.querySelector(".prec").onclick = () => voir(cur - 1); lb.querySelector(".suiv").onclick = () => voir(cur + 1);
  lb.addEventListener("click", e => { if (e.target === lb) fermerLb(); });
  document.addEventListener("keydown", e => { if (lb.hidden) return; if (e.key === "ArrowRight") voir(cur + 1); if (e.key === "ArrowLeft") voir(cur - 1); });

  /* ---------- Tout (re)dessiner ---------- */
  function toutRendre() { rendreDevises(); rendrePlats(); rendreCarte(); majPanier(); creneaux(); rendreCadeau(); moment(heure.dataset.m || "jour"); }
  toutRendre();
  $$(".lg button").forEach(b => b.addEventListener("click", () => setTimeout(toutRendre, 0)));
})();
