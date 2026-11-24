/* Pwani · démonstration Lumen Web : chambres, calendrier de disponibilités (2 mois), prix total,
   monnaies, réservation WhatsApp ou e-mail (simulées : rien n'est envoyé). */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const en = () => document.documentElement.lang === "en", T = (f, a) => (en() ? a : f);
  const loc = () => (en() ? "en-GB" : "fr-FR");

  /* Monnaies (base : dollar) */
  const DEV = { USD: { s: "$", r: 1, pas: 1, av: 1, n: "Dollar US ($)" }, EUR: { s: "€", r: .93, pas: 1, n: "Euro (€)" }, XOF: { s: "FCFA", r: 610, pas: 500, n: "Franc CFA (FCFA)" },
    CDF: { s: "FC", r: 2850, pas: 1000, n: "Franc congolais (FC)" }, KES: { s: "KSh", r: 129, pas: 50, n: "Shilling kényan (KSh)" }, UGX: { s: "UGX", r: 4200, pas: 1000, n: "Shilling ougandais (UGX)" }, NGN: { s: "₦", r: 1550, pas: 500, av: 1, n: "Naira (₦)" } };
  let dev = "USD"; try { dev = localStorage.getItem("pwani-devise") || "USD"; } catch (e) {} if (!DEV[dev]) dev = "USD";
  const prix = u => { const d = DEV[dev], v = Math.round(u * d.r / d.pas) * d.pas, t = v.toLocaleString(loc()); return d.av ? d.s + t : t + " " + d.s; };

  /* Chambres */
  const CH = [
    { id: "bambou", p: 160, img: "suite-bambou", dim: [640, 960], m2: 38, pers: 3, tag: ["Le plus réservé", "Most booked"],
      fr: ["Suite Bambou", "Un lit à baldaquin sous une charpente de bambou, des voilages blancs qui dansent avec la brise, et la jungle à la fenêtre.", ["Lit king size", "Moustiquaire voile", "Douche à l'italienne", "Terrasse privée", "Climatisation", "Wi-Fi"]],
      en: ["Bamboo Suite", "A canopy bed under a bamboo frame, white drapes dancing in the breeze, and the jungle at the window.", ["King-size bed", "Canopy net", "Walk-in shower", "Private terrace", "Air conditioning", "Wi-Fi"]] },
    { id: "cocon", p: 240, img: "cocon", dim: [640, 959], m2: 52, pers: 2, tag: ["Signature", "Signature"],
      fr: ["Suite Cocon", "Une voûte en bambou tressé à la main, comme un cocon. Fauteuil en rotin, porte sculptée et silence absolu.", ["Lit king size", "Voûte en bambou", "Baignoire", "Salon privé", "Minibar offert", "Wi-Fi"]],
      en: ["Cocoon Suite", "A hand-woven bamboo vault, like a cocoon. Rattan armchair, carved door and absolute silence.", ["King-size bed", "Bamboo vault", "Bathtub", "Private lounge", "Free minibar", "Wi-Fi"]] },
    { id: "chaume", p: 320, img: "villa-chaume", dim: [640, 1138], m2: 75, pers: 4, tag: ["Pour la famille", "For families"],
      fr: ["Villa Chaume", "Sous un grand toit de chaume, une villa ouverte sur le jardin : baldaquin, salon, tapis tissés et terrasse en bois.", ["Lit king + canapé-lit", "Jusqu'à 4 personnes", "Terrasse sur le jardin", "Douche extérieure", "Petit-déjeuner en villa", "Wi-Fi"]],
      en: ["Thatched Villa", "Under a great thatched roof, a villa open onto the garden: canopy bed, lounge, woven rugs and wooden deck.", ["King bed + sofa bed", "Up to 4 guests", "Garden terrace", "Outdoor shower", "Breakfast in the villa", "Wi-Fi"]] }
  ];
  let chId = "bambou", pers = 2, deb = null, fin = null, decal = 0;
  const ch = () => CH.find(c => c.id === chId);
  const jour = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const auj = jour(new Date());
  const cle = d => d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  const h = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 11);
  const complet = d => h(chId + cle(d)) % 6 === 0;
  const tarif = d => Math.round(ch().p * ((d.getDay() === 5 || d.getDay() === 6) ? 1.15 : 1));
  const nuits = () => deb && fin ? Math.round((fin - deb) / 864e5) : 0;
  const totalNuits = () => { let s = 0; if (!nuits()) return 0; for (let d = new Date(deb); d < fin; d.setDate(d.getDate() + 1)) s += tarif(d); return s; };
  const libresCeMois = c => { let n = 0; const d = new Date(auj); for (let i = 0; i < 30; i++) { if (!(h(c.id + cle(d)) % 6 === 0)) n++; d.setDate(d.getDate() + 1); } return n; };

  /* Rendu chambres */
  function rendreChambres() {
    $("#chambres-grille").innerHTML = CH.map(c => { const L = en() ? c.en : c.fr, rest = Math.max(2, Math.round(libresCeMois(c) / 6));
      return `<article class="ch" data-id="${c.id}" tabindex="0" role="button" aria-label="${L[0]}">
        <div class="ph"><img src="img/${c.img}-s.webp" width="${c.dim[0]}" height="${c.dim[1]}" alt="${L[0]}" loading="lazy"><span class="tag">${c.tag[en() ? 1 : 0]}</span><span class="reste">🔥 ${T(`Plus que ${rest} nuits libres ce mois`, `Only ${rest} nights left this month`)}</span></div>
        <div class="info"><h3>${L[0]}</h3><div class="specs"><span>${c.m2} m²</span><span>· ${T("jusqu'à", "up to")} ${c.pers} ${T("pers.", "guests")}</span><span>· ${T("petit-déj. inclus", "breakfast incl.")}</span></div><p>${L[1]}</p>
        <div class="bas"><div class="prix"><small>${T("à partir de", "from")}</small><b>${prix(c.p)}</b> <span>/ ${T("nuit", "night")}</span></div><button type="button" class="btn btn-plein" data-choisir="${c.id}">${T("Choisir", "Select")}</button></div></div></article>`; }).join("");
    $("#choix-ch").innerHTML = CH.map(c => `<button type="button" role="radio" aria-checked="${c.id === chId}" data-ch="${c.id}">${(en() ? c.en : c.fr)[0]}<span>${prix(c.p)} / ${T("nuit", "night")}</span></button>`).join("");
  }
  function choisir(id, aller) {
    chId = id; if (pers > ch().pers) pers = ch().pers;
    if (deb && fin) { for (let d = new Date(deb); d < fin; d.setDate(d.getDate() + 1)) if (complet(d)) { deb = fin = null; $("#err-dates").textContent = T("Ces dates ne sont plus libres pour cette chambre : choisissez-en d'autres.", "Those dates aren't available for this room: please choose others."); break; } }
    toutRendre(); if (aller) $("#reserver").scrollIntoView({ behavior: "smooth" });
  }

  /* Calendrier */
  function rendreCal() {
    const base = new Date(auj.getFullYear(), auj.getMonth() + decal, 1);
    const mois = [0, 1].map(k => new Date(base.getFullYear(), base.getMonth() + k, 1));
    $("#cal-titre").textContent = mois[0].toLocaleDateString(loc(), { month: "long", year: "numeric" });
    $("#cal-prec").disabled = decal <= 0;
    const js = en() ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] : ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
    $("#cal").innerHTML = mois.map(m => { const n = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate(), vide = (m.getDay() + 6) % 7;
      let c = `<div class="mois"><h4>${m.toLocaleDateString(loc(), { month: "long" })}</h4><div class="jours">` + js.map(j => `<span class="js">${j}</span>`).join("") + "<span></span>".repeat(vide);
      for (let i = 1; i <= n; i++) { const d = new Date(m.getFullYear(), m.getMonth(), i), passe = d < auj, plein = !passe && complet(d);
        let cl = ""; if (deb && +d === +deb) cl = "deb"; else if (fin && +d === +fin) cl = "fin"; else if (deb && fin && d > deb && d < fin) cl = "dans";
        c += `<button type="button" class="${cl}" data-d="${+d}" ${passe || plein ? "disabled" : ""} aria-label="${d.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" })}${plein ? " – " + T("complet", "full") : ""}">${i}${passe || plein ? "" : `<small>${prix(tarif(d)).replace(/\s?(FCFA|FC|KSh|UGX)$/, "")}</small>`}</button>`; }
      return c + "</div></div>"; }).join("");
  }
  $("#cal").addEventListener("click", e => { const b = e.target.closest("button[data-d]"); if (!b) return; const d = new Date(+b.dataset.d); $("#err-dates").textContent = "";
    if (!deb || (deb && fin) || d <= deb) { deb = d; fin = null; }
    else { for (let x = new Date(deb); x < d; x.setDate(x.getDate() + 1)) if (complet(x)) { $("#err-dates").textContent = T("Une nuit est complète dans cette période : choisissez d'autres dates.", "One night is full in that period: please choose other dates."); deb = d; fin = null; return toutRendre(); } fin = d; }
    toutRendre(); });
  $("#cal-prec").onclick = () => { if (decal > 0) { decal--; rendreCal(); } };
  $("#cal-suiv").onclick = () => { if (decal < 10) { decal++; rendreCal(); } };

  /* Récapitulatif */
  const fmt = d => d.toLocaleDateString(loc(), { weekday: "short", day: "numeric", month: "short" });
  function recap() {
    const n = nuits(), s = totalNuits(), tx = Math.round(s * .1);
    const txt = deb && fin ? `${fmt(deb)} → ${fmt(fin)}` : deb ? `${fmt(deb)} → ${T("choisissez le départ", "choose check-out")}` : T("Choisissez vos dates", "Choose your dates");
    $("#r-dates").textContent = txt; $("#barre-dates").textContent = deb && fin ? `${fmt(deb)} → ${fmt(fin)}` : T("Choisir", "Choose");
    $("#r-pers").textContent = pers; $("#barre-pers").value = Math.min(pers, 4);
    $("#r-calc").textContent = n ? `${n} ${T(n > 1 ? "nuits" : "nuit", n > 1 ? "nights" : "night")} · ${(en() ? ch().en : ch().fr)[0]}` : T("Séjour", "Stay");
    $("#r-sous").textContent = n ? prix(s) : "—"; $("#r-taxes").textContent = n ? prix(tx) : "—"; $("#r-total").textContent = n ? prix(s + tx) : "—";
    $("#r-eco").textContent = n ? T(`✓ Vous économisez ${prix(Math.round((s + tx) * .1))} par rapport aux plateformes`, `✓ You save ${prix(Math.round((s + tx) * .1))} compared with booking platforms`) : "";
  }
  $$(".pers button").forEach(b => b.onclick = () => { pers = Math.min(ch().pers, Math.max(1, pers + +b.dataset.p)); recap(); });
  $("#barre-pers").onchange = e => { pers = Math.min(ch().pers, +e.target.value); recap(); };
  $("#choix-ch").addEventListener("click", e => { const b = e.target.closest("[data-ch]"); if (b) choisir(b.dataset.ch); });

  /* Barre de l'accueil */
  $("#barre").addEventListener("submit", e => { e.preventDefault(); $("#reserver").scrollIntoView({ behavior: "smooth" }); });
  $$("[data-ouvrir-cal]").forEach(b => b.onclick = () => $("#reserver").scrollIntoView({ behavior: "smooth" }));

  /* Monnaies */
  function rendreDev() { $$("select.devise").forEach(s => { s.innerHTML = Object.entries(DEV).map(([k, d]) => `<option value="${k}" ${k === dev ? "selected" : ""}>${d.n}</option>`).join("");
    s.onchange = () => { dev = s.value; try { localStorage.setItem("pwani-devise", dev); } catch (e) {} toutRendre(); }; }); }

  /* Fiche chambre */
  const fiche = $("#fiche"); let ficheId, avantF;
  function ouvrirFiche(id) { const c = CH.find(x => x.id === id), L = en() ? c.en : c.fr; ficheId = id; avantF = document.activeElement;
    fiche.querySelector(".ph img").src = `img/${c.img}-l.webp`; fiche.querySelector(".ph img").alt = L[0];
    $("#fi-sur").textContent = `${c.m2} m² · ${T("jusqu'à", "up to")} ${c.pers} ${T("personnes", "guests")}`; $("#fi-nom").textContent = L[0]; $("#fi-desc").textContent = L[1];
    $("#fi-liste").innerHTML = L[2].map(x => `<li>${x}</li>`).join("");
    $("#fi-prix").innerHTML = `<small style="display:block;color:var(--doux);font-size:12px">${T("à partir de", "from")}</small><b style="font:500 36px var(--serif)">${prix(c.p)}</b> <span style="color:var(--doux)">/ ${T("nuit", "night")}</span>`;
    $("#fi-choisir").textContent = T("Choisir cette chambre", "Select this room"); fiche.hidden = false; fiche.querySelector(".x").focus(); }
  const fermerF = () => { fiche.hidden = true; if (avantF) avantF.focus(); };
  fiche.querySelector(".x").onclick = fermerF; fiche.addEventListener("click", e => { if (e.target === fiche) fermerF(); });
  $("#fi-choisir").onclick = () => { fermerF(); choisir(ficheId, true); };
  document.addEventListener("click", e => { const c = e.target.closest("[data-choisir]"); if (c) { e.stopPropagation(); choisir(c.dataset.choisir, true); return; }
    const a = e.target.closest(".ch[data-id]"); if (a) ouvrirFiche(a.dataset.id); });
  document.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".ch[data-id]")) { e.preventDefault(); ouvrirFiche(e.target.dataset.id); }
    if (e.key === "Escape") { if (!fiche.hidden) fermerF(); else if (!$("#msg").hidden) fermerM(); else if (!$("#lb").hidden) fermerLb(); } });

  /* Message (démo) */
  let avantM;
  function message(via, titre, texte) {
    const mail = via === "mail", boite = $(".msg-boite"); boite.classList.toggle("mail", mail);
    $("#msg-titre").textContent = mail ? T("Votre e-mail", "Your email") : "Pwani · " + titre;
    $("#msg-sous").textContent = mail ? T("Nouveau message", "New message") : T("en ligne · répond en 10 min", "online · replies within 10 min");
    $("#mail-objet").textContent = titre + " · Pwani";
    if (mail) texte = texte.replace(/ 👋/, ",").replace(/[🏡📅🌙👥💰👤📞💬]️? ?/gu, "") + "\n\n—\n" + T("Envoyé depuis le site de Pwani", "Sent from the Pwani website");
    const b = $("#bulle"); b.textContent = texte; const s = document.createElement("small"); s.textContent = mail ? "" : new Date().toTimeString().slice(0, 5) + " ✓✓"; b.appendChild(s);
    $("#msg-explique").innerHTML = mail ? T("<b>Ceci est une démonstration :</b> sur le vrai site, votre messagerie s'ouvre avec cet e-mail déjà écrit, adressé à l'hôtel. Rien n'a été envoyé.", "<b>This is a demo:</b> on the real website, your email app opens with this email already written, addressed to the hotel. Nothing has been sent.")
      : T("<b>Ceci est une démonstration :</b> sur le vrai site, WhatsApp s'ouvre avec ce message déjà écrit, adressé à l'hôtel. Rien n'a été envoyé.", "<b>This is a demo:</b> on the real website, WhatsApp opens with this message already written, addressed to the hotel. Nothing has been sent.");
    avantM = document.activeElement; $("#msg").hidden = false; $("#msg-fermer").focus();
  }
  const fermerM = () => { $("#msg").hidden = true; if (avantM) avantM.focus(); };
  $("#msg-fermer").onclick = fermerM; $("#msg").addEventListener("click", e => { if (e.target.id === "msg") fermerM(); });

  /* Envoi de la réservation */
  function err(el, m) { const c = el.closest(".champ"); c.classList.toggle("ko", !!m); c.querySelector(".err").textContent = m || ""; return !m; }
  $("#form-resa").addEventListener("submit", e => {
    e.preventDefault(); const via = (e.submitter && e.submitter.dataset.via) || "wa";
    const nom = $("#r-nom"), tel = $("#r-tel"), msg = $("#r-msg").value.trim();
    let ok = err(nom, nom.value.trim().length < 2 ? T("Indiquez votre nom.", "Please enter your name.") : "");
    ok = err(tel, !/^[+\d][\d\s().-]{7,}$/.test(tel.value.trim()) ? T("Numéro invalide.", "Invalid number.") : "") && ok;
    if (!nuits()) { $("#err-dates").textContent = T("Choisissez vos dates d'arrivée et de départ dans le calendrier.", "Choose your check-in and check-out dates in the calendar."); ok = false; $("#cal").scrollIntoView({ behavior: "smooth", block: "center" }); }
    if (!ok) return;
    const n = nuits(), s = totalNuits(), L = en() ? ch().en : ch().fr;
    message(via, T("Réservations", "Bookings"), T(
      `Bonjour Pwani 👋\nJe souhaite réserver :\n\n🏡 ${L[0]}\n📅 ${fmt(deb)} → ${fmt(fin)}\n🌙 ${n} nuit${n > 1 ? "s" : ""}\n👥 ${pers} voyageur${pers > 1 ? "s" : ""}\n💰 Total estimé : ${prix(s + Math.round(s * .1))}` + (msg ? `\n💬 ${msg}` : "") + `\n\n👤 ${nom.value.trim()} · ${tel.value.trim()}\n\nMerci !`,
      `Hello Pwani 👋\nI'd like to book:\n\n🏡 ${L[0]}\n📅 ${fmt(deb)} → ${fmt(fin)}\n🌙 ${n} night${n > 1 ? "s" : ""}\n👥 ${pers} guest${pers > 1 ? "s" : ""}\n💰 Estimated total: ${prix(s + Math.round(s * .1))}` + (msg ? `\n💬 ${msg}` : "") + `\n\n👤 ${nom.value.trim()} · ${tel.value.trim()}\n\nThank you!`));
  });

  /* Galerie */
  const lb = $("#lb"), ph = $$(".galerie button"); let cur = 0, avL;
  const voir = i => { cur = (i + ph.length) % ph.length; const im = ph[cur].querySelector("img"); lb.querySelector("img").src = im.dataset.l || im.src; lb.querySelector("img").alt = im.alt; lb.querySelector("p").textContent = im.alt + " · " + (cur + 1) + "/" + ph.length; };
  ph.forEach((b, i) => b.onclick = () => { avL = b; voir(i); lb.hidden = false; lb.querySelector(".fermer").focus(); });
  function fermerLb() { lb.hidden = true; if (avL) avL.focus(); }
  lb.querySelector(".fermer").onclick = fermerLb; lb.querySelector(".prec").onclick = () => voir(cur - 1); lb.querySelector(".suiv").onclick = () => voir(cur + 1);
  lb.addEventListener("click", e => { if (e.target === lb) fermerLb(); });

  /* Dates proposées par défaut : dans 14 jours, 3 nuits libres */
  (function () { const d = new Date(auj); d.setDate(d.getDate() + 14);
    for (let k = 0; k < 40; k++) { const f = new Date(d); f.setDate(f.getDate() + 3); let ok = true; for (let x = new Date(d); x < f; x.setDate(x.getDate() + 1)) if (complet(x)) ok = false;
      if (ok) { deb = new Date(d); fin = f; decal = (deb.getFullYear() - auj.getFullYear()) * 12 + deb.getMonth() - auj.getMonth(); if (innerWidth > 720 && decal > 0) decal--; break; } d.setDate(d.getDate() + 1); } })();

  function toutRendre() { rendreDev(); rendreChambres(); rendreCal(); recap(); }
  toutRendre();
  $$(".lg button").forEach(b => b.addEventListener("click", () => setTimeout(toutRendre, 0)));
})();
