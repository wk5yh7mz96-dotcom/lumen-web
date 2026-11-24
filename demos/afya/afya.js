/* Afya · démonstration Lumen Web : statut d'ouverture en direct, orienteur, soins, rendez-vous en 3 étapes
   (créneaux par médecin, sur place ou en vidéo), ticket en direct, confirmation WhatsApp / e-mail simulée,
   ajout à l'agenda (.ics réel), visite du centre en diaporama. Rien n'est envoyé : la clinique est fictive. */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const en = () => document.documentElement.lang === "en", T = (f, a) => (en() ? a : f);
  const loc = () => (en() ? "en-GB" : "fr-FR");
  const usd = n => "$" + n;
  const h = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

  const ICO = {
    generale: '<path d="M7 3h2v6a3 3 0 0 0 6 0V3h2v6a5 5 0 0 1-4 4.9V15a3 3 0 0 0 6 0v-1.2a2.5 2.5 0 1 1 2 0V15a5 5 0 0 1-10 0v-1.1A5 5 0 0 1 7 9z"/>',
    pediatrie: '<path d="M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-6 20v-5a6 6 0 0 1 12 0v5h-2v-4h-2v4h-4v-4H8v4z"/>',
    dentaire: '<path d="M7.5 2C4.5 2 3 4.5 3 7c0 3 1.5 4.5 2 7 .6 3.4 1.2 8 3 8 1.6 0 1.6-5 4-5s2.4 5 4 5c1.8 0 2.4-4.6 3-8 .5-2.5 2-4 2-7 0-2.5-1.5-5-4.5-5-1.8 0-3 1-4.5 1S9.3 2 7.5 2Z"/>',
    imagerie: '<path d="M4 4h16v12H4zm2 2v8h12V6zm2 12h8v2H8z"/><path d="M12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/>',
    labo: '<path d="M9 2h6v2h-1v5.2l5.4 9.4A2.3 2.3 0 0 1 17.4 22H6.6a2.3 2.3 0 0 1-2-3.4L10 9.2V4H9zm3 9.5L9.1 16h5.8z"/>',
    femme: '<path d="M12 2a6 6 0 0 1 1 11.9V16h3v2h-3v4h-2v-4H8v-2h3v-2.1A6 6 0 0 1 12 2Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>'
  };
  const SOINS = [
    { id: "generale", prix: 20, duree: 20, video: true, docs: ["amina", "joseph"], emo: "🩺",
      fr: ["Médecine générale", "Fièvre, toux, fatigue, tension ou diabète : le premier réflexe pour toute la famille.", "Généraliste"],
      en: ["General practice", "Fever, cough, tiredness, blood pressure or diabetes: the first step for the whole family.", "GP"] },
    { id: "dentaire", prix: 30, duree: 30, photo: "dentaire", docs: ["samuel"], emo: "🦷",
      fr: ["Dentaire", "Contrôle, détartrage, soins des caries et urgences dentaires. Les enfants sont les bienvenus.", "Dentiste"],
      en: ["Dental", "Check-ups, scaling, fillings and dental emergencies. Children welcome.", "Dentist"] },
    { id: "pediatrie", prix: 25, duree: 30, video: true, docs: ["grace"], emo: "🧸",
      fr: ["Pédiatrie", "De la naissance à l'adolescence : vaccins, croissance, fièvre, petits bobos.", "Pédiatre"],
      en: ["Paediatrics", "From birth to teens: vaccines, growth, fever, everyday bumps.", "Paediatrician"] },
    { id: "femme", prix: 30, duree: 30, video: true, docs: ["esther"], emo: "🤰",
      fr: ["Santé de la femme", "Gynécologie, suivi de grossesse, échographies et contraception.", "Gynécologue"],
      en: ["Women's health", "Gynaecology, pregnancy follow-up, ultrasounds and contraception.", "Gynaecologist"] },
    { id: "labo", prix: 8, duree: 15, docs: ["labo"], emo: "🧪",
      fr: ["Laboratoire", "Prise de sang, analyses d'urine, tests rapides. Résultats sur WhatsApp sous 24 h.", "Laboratoire"],
      en: ["Laboratory", "Blood tests, urine analysis, rapid tests. Results on WhatsApp within 24 h.", "Laboratory"] },
    { id: "imagerie", prix: 60, duree: 30, photo: "imagerie", docs: ["imagerie"], emo: "🩻",
      fr: ["Imagerie", "Échographie, radio numérique et scanner, avec un compte rendu expliqué par le médecin.", "Imagerie"],
      en: ["Imaging", "Ultrasound, digital X-ray and CT scan, with a report explained by the doctor.", "Imaging"] }
  ];
  const DOCS = {
    amina: { n: "Dr Amina K.", i: "AK", c: "#DDF6EE", lg: "FR · EN · SW" },
    joseph: { n: "Dr Joseph M.", i: "JM", c: "#E3EDFF", lg: "FR · EN" },
    grace: { n: "Dr Grace N.", i: "GN", c: "#FFF1DB", lg: "FR · EN · SW" },
    samuel: { n: "Dr Samuel O.", i: "SO", c: "#F1E8FF", lg: "EN · SW" },
    esther: { n: "Dr Esther B.", i: "EB", c: "#FFE6EA", lg: "FR · EN" },
    imagerie: { n: T("Équipe d'imagerie", "Imaging team"), equipe: 1, i: "🩻", c: "#E3EDFF", lg: "FR · EN" },
    labo: { n: T("Laboratoire", "Laboratory"), equipe: 1, i: "🧪", c: "#DDF6EE", lg: "FR · EN · SW" }
  };
  const nomDoc = id => DOCS[id].equipe ? (id === "labo" ? T("Laboratoire", "Laboratory") : T("Équipe d'imagerie", "Imaging team")) : DOCS[id].n;
  const S = id => SOINS.find(s => s.id === id);
  const L = s => (en() ? s.en : s.fr);

  /* Horaires : lun-ven 7:30-20:00 · sam 8:00-16:00 · dim fermé (urgences seulement) */
  const HOR = { 1: [450, 1200], 2: [450, 1200], 3: [450, 1200], 4: [450, 1200], 5: [450, 1200], 6: [480, 960], 0: null };
  const hm = m => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  const heureTxt = m => en() ? new Date(2000, 0, 1, Math.floor(m / 60), m % 60).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : (Math.floor(m / 60) + " h" + (m % 60 ? " " + String(m % 60).padStart(2, "0") : ""));
  const jour0 = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const maint = () => new Date(), mNow = () => { const n = maint(); return n.getHours() * 60 + n.getMinutes(); };
  const cle = d => d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  function creneaux(doc, d) {
    const H = HOR[d.getDay()]; if (!H) return [];
    const auj = +jour0(d) === +jour0(maint()), out = [];
    for (let m = H[0]; m <= H[1] - 30; m += 30) {
      const pris = h(doc + cle(d) + m) % 3 === 0 || (auj && m < mNow() + 30);
      out.push({ m, pris });
    }
    return out;
  }
  function premierLibre(doc, depuis = 0) {
    for (let k = depuis; k < depuis + 14; k++) { const d = jour0(maint()); d.setDate(d.getDate() + k);
      const c = creneaux(doc, d).find(x => !x.pris); if (c) return { d, m: c.m, k }; }
    return null;
  }
  const quandTxt = (d, k) => k === 0 ? T("aujourd'hui", "today") : k === 1 ? T("demain", "tomorrow") : d.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" });
  const ecart = d => Math.round((jour0(d) - jour0(maint())) / 864e5);

  /* Statut d'ouverture (bandeau) */
  function statut() {
    const n = maint(), H = HOR[n.getDay()], m = mNow(), ouvert = H && m >= H[0] && m < H[1];
    $("#etat-pouls").classList.toggle("ferme", !ouvert);
    let txt;
    if (ouvert) txt = T(`<b>Ouvert maintenant</b> <span class="det">· ferme à ${heureTxt(H[1])}</span>`, `<b>Open now</b> <span class="det">· closes at ${heureTxt(H[1])}</span>`);
    else { let k = 0, d; do { k++; d = new Date(n); d.setDate(d.getDate() + (H && m < H[0] ? k - 1 : k)); } while (!HOR[d.getDay()] && k < 7);
      const o = HOR[d.getDay()][0], q = ecart(d) === 0 ? T("aujourd'hui", "today") : ecart(d) === 1 ? T("demain", "tomorrow") : d.toLocaleDateString(loc(), { weekday: "long" });
      txt = T(`<b>Fermé</b> <span class="det">· ouvre ${q} à ${heureTxt(o)} · urgences 24 h/24</span>`, `<b>Closed</b> <span class="det">· opens ${q} at ${heureTxt(o)} · emergencies 24/7</span>`); }
    $("#etat-txt").innerHTML = txt;
    const p = premierLibre("amina"); const t = p ? `${quandTxt(p.d, p.k)[0].toUpperCase() + quandTxt(p.d, p.k).slice(1)} · ${heureTxt(p.m)}` : "—";
    $("#prochain").textContent = t; $("#prochain2").textContent = t + " · " + T("médecine générale", "general practice");
    // Horaires
    const noms = en() ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] : ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    $("#horaires").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(j => `<li class="${j === n.getDay() ? "auj" : ""}"><span>${noms[j]}${j === n.getDay() ? T(" · aujourd'hui", " · today") : ""}</span><span>${HOR[j] ? heureTxt(HOR[j][0]) + " – " + heureTxt(HOR[j][1]) : T("Urgences seulement", "Emergencies only")}</span></li>`).join("");
  }

  /* Soins */
  function rendreSoins() {
    $("#soins-grille").innerHTML = SOINS.map(s => { const l = L(s), bas = `<div class="bas"><span>${T("dès", "from")} <b>${usd(s.prix)}</b> · ${s.duree} min</span><button type="button" data-prendre="${s.id}">${T("Réserver →", "Book →")}</button></div>`;
      return s.photo ? `<article class="carte soin photo${s.id === "imagerie" ? " large" : ""}"><img src="img/${s.photo}-${s.photo === "imagerie" ? "l" : "s"}.webp" width="${s.photo === "imagerie" ? 736 : 640}" height="${s.photo === "imagerie" ? 1308 : 640}" alt="${l[0]}" loading="lazy"><div class="txt"><h3>${l[0]}</h3><p>${l[1]}</p>${bas}</div></article>`
        : `<article class="carte soin"><div class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICO[s.id]}</svg></div><h3>${l[0]}</h3><p>${l[1]}</p>${bas}</article>`; }).join("");
    $("#q-soin").innerHTML = SOINS.map(s => `<option value="${s.id}" ${s.id === st.soin ? "selected" : ""}>${L(s)[0]}</option>`).join("");
  }

  /* Orienteur */
  const QUI = [["moi", "🙋", "Moi", "Me"], ["enfant", "🧒", "Mon enfant", "My child"], ["parent", "👵", "Un parent âgé", "An elderly parent"]];
  const QUOI = [["fievre", "🌡️", "Fièvre", "Fever"], ["toux", "😷", "Toux, rhume", "Cough, cold"], ["dents", "🦷", "Mal de dents", "Toothache"], ["grossesse", "🤰", "Grossesse", "Pregnancy"],
    ["analyses", "🧪", "Prise de sang", "Blood test"], ["radio", "🩻", "Écho ou radio prescrite", "Prescribed scan"], ["blessure", "🩹", "Petite blessure", "Minor injury"], ["controle", "✅", "Bilan de santé", "Check-up"]];
  let oQui = null, oQuoi = null;
  function service(qui, quoi) {
    if (quoi === "dents") return "dentaire"; if (quoi === "grossesse") return "femme"; if (quoi === "analyses") return "labo"; if (quoi === "radio") return "imagerie";
    return qui === "enfant" ? "pediatrie" : "generale";
  }
  function rendreOrient() {
    $("#o-qui").innerHTML = QUI.map(q => `<button type="button" aria-pressed="${oQui === q[0]}" data-qui="${q[0]}">${q[1]} ${T(q[2], q[3])}</button>`).join("");
    $("#o-quoi").innerHTML = QUOI.filter(q => !(oQui === "enfant" && q[0] === "grossesse") && !(oQui === "parent" && q[0] === "grossesse")).map(q => `<button type="button" aria-pressed="${oQuoi === q[0]}" data-quoi="${q[0]}">${q[1]} ${T(q[2], q[3])}</button>`).join("");
    const r = $("#o-res");
    if (!oQui || !oQuoi) { r.className = "o-res vide"; r.innerHTML = T("Choisissez une réponse à chaque question : nous vous indiquons le bon service.", "Pick one answer for each question: we'll point you to the right service."); return; }
    const s = S(service(oQui, oQuoi)), doc = s.docs[0], p = premierLibre(doc);
    r.className = "o-res";
    r.innerHTML = `<div class="ico">${s.emo}</div><div><small>${T("Nous vous conseillons", "We recommend")}</small><b>${L(s)[0]}</b><small>${p ? T("Premier créneau", "First slot") + " : " + quandTxt(p.d, p.k) + " " + T("à", "at") + " " + heureTxt(p.m) + " · " + nomDoc(doc) : ""}</small></div><button type="button" class="btn p" data-orient-go>${T("Réserver ce créneau", "Book this slot")}</button>`;
    r.querySelector("[data-orient-go]").onclick = () => { if (p) { choisirSoin(s.id, doc); st.jour = p.d; st.heure = p.m; } aller(3); $("#rdv").scrollIntoView({ behavior: "smooth" }); };
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-qui]"); if (a) { oQui = a.dataset.qui; if (oQui !== "moi" && oQuoi === "grossesse") oQuoi = null; rendreOrient(); }
    const b = e.target.closest("[data-quoi]"); if (b) { oQuoi = b.dataset.quoi; rendreOrient(); }
    const c = e.target.closest("[data-prendre]"); if (c) { choisirSoin(c.dataset.prendre); aller(1); $("#rdv").scrollIntoView({ behavior: "smooth" }); }
    const d = e.target.closest("[data-doc-go]"); if (d) { const id = d.dataset.docGo, s = SOINS.find(x => x.docs.includes(id)), p = premierLibre(id);
      choisirSoin(s.id, id); if (p) { st.jour = p.d; st.heure = p.m; } aller(p ? 3 : 2); $("#rdv").scrollIntoView({ behavior: "smooth" }); }
  });

  /* Rendez-vous */
  const st = { soin: "generale", doc: "amina", mode: "centre", jour: null, heure: null, etape: 1 };
  function choisirSoin(id, doc) { const s = S(id); st.soin = id; st.doc = doc && s.docs.includes(doc) ? doc : s.docs[0]; if (!s.video) st.mode = "centre"; st.jour = null; st.heure = null; rendreRdv(); }
  function jours() { const out = []; for (let k = 0; k < 7; k++) { const d = jour0(maint()); d.setDate(d.getDate() + k); out.push(d); } return out; }
  function rendreRdv() {
    const s = S(st.soin);
    $("#r-soins").innerHTML = SOINS.map(x => `<button type="button" role="radio" aria-checked="${x.id === st.soin}" data-soin="${x.id}">${L(x)[0]}<span>${T("dès", "from")} ${usd(x.prix)}</span></button>`).join("");
    $("#r-docs").innerHTML = s.docs.map(id => { const D = DOCS[id], p = premierLibre(id);
      return `<button type="button" role="radio" aria-checked="${id === st.doc}" data-doc="${id}"><span class="pp" style="background:${D.c}">${D.i}</span><span><b>${nomDoc(id)}</b><small>${L(s)[2]} · ${D.lg}${p ? " · " + T("libre", "free") + " " + quandTxt(p.d, p.k) : ""}</small></span></button>`; }).join("");
    $$("#r-mode button").forEach(b => { b.setAttribute("aria-checked", b.dataset.m === st.mode); b.disabled = b.dataset.m === "video" && !s.video; b.style.opacity = b.disabled ? .45 : ""; });
    // jours
    const J = jours(); if (!st.jour) { const p = premierLibre(st.doc); st.jour = p ? p.d : J[0]; }
    $("#r-jours").innerHTML = J.map(d => { const c = creneaux(st.doc, d), libres = c.filter(x => !x.pris).length;
      return `<button type="button" role="radio" aria-checked="${+d === +st.jour}" data-jour="${+d}" ${libres ? "" : "disabled"} aria-label="${d.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" })}">${d.toLocaleDateString(loc(), { weekday: "short" }).replace(".", "")}<b>${d.getDate()}</b><small>${libres ? libres + T(" libres", " free") : HOR[d.getDay()] ? T("complet", "full") : T("fermé", "closed")}</small></button>`; }).join("");
    const c = creneaux(st.doc, st.jour);
    $("#r-creneaux").innerHTML = c.length && c.some(x => !x.pris) ? c.map(x => `<button type="button" role="radio" aria-checked="${x.m === st.heure}" data-heure="${x.m}" ${x.pris ? "disabled" : ""}>${hm(x.m)}</button>`).join("")
      : `<p class="vide">${T("Aucun créneau ce jour-là : choisissez un autre jour.", "No slots that day: pick another day.")}</p>`;
    ticket();
  }
  function prix() { return S(st.soin).prix - (st.mode === "video" ? 5 : 0); }
  function code() { return "AF-" + String(1000 + h(st.doc + (st.jour ? cle(st.jour) : "") + st.heure) % 9000); }
  function ticket() {
    const s = S(st.soin);
    $("#t-soin").textContent = L(s)[0]; $("#t-doc").textContent = nomDoc(st.doc);
    $("#t-date").textContent = st.jour ? st.jour.toLocaleDateString(loc(), { weekday: "short", day: "numeric", month: "short" }) : "—";
    $("#t-heure").textContent = st.heure != null ? heureTxt(st.heure) : T("à choisir", "to choose");
    $("#t-ou").textContent = st.mode === "video" ? T("En vidéo", "Video call") : T("Au centre", "At the centre");
    $("#t-prix").textContent = usd(prix()); $("#t-code").textContent = st.heure != null ? code() : "AF-····";
  }
  function aller(n) {
    if (n >= 2 && !st.doc) n = 1;
    if (n === 3 && st.heure == null) n = 2;
    st.etape = n;
    $$(".panneau").forEach(p => p.classList.toggle("on", +p.dataset.p === n));
    $$(".etapes-rdv button").forEach(b => { const k = +b.dataset.aller; b.classList.toggle("on", k === n); b.classList.toggle("fait", k < n); b.disabled = k === 3 && st.heure == null; });
    $("#r-prec").style.visibility = n === 1 ? "hidden" : ""; $("#r-suiv").hidden = n === 3; $("#r-envois").hidden = n !== 3;
    rendreRdv();
  }
  $("#form-rdv").addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t || t.disabled) return;
    if (t.dataset.soin) choisirSoin(t.dataset.soin);
    else if (t.dataset.doc) { st.doc = t.dataset.doc; st.jour = null; st.heure = null; rendreRdv(); }
    else if (t.dataset.m) { st.mode = t.dataset.m; rendreRdv(); }
    else if (t.dataset.jour) { st.jour = new Date(+t.dataset.jour); st.heure = null; rendreRdv(); }
    else if (t.dataset.heure) { st.heure = +t.dataset.heure; rendreRdv(); setTimeout(() => aller(3), 250); }
    else if (t.dataset.aller) aller(+t.dataset.aller);
  });
  $("#r-suiv").onclick = () => aller(st.etape + 1);
  $("#r-prec").onclick = () => aller(st.etape - 1);

  /* Recherche rapide (accueil) */
  $("#rapide").addEventListener("submit", e => { e.preventDefault(); choisirSoin($("#q-soin").value); const q = +$("#q-quand").value;
    if (q < 2) { const d = jour0(maint()); d.setDate(d.getDate() + q); if (creneaux(st.doc, d).some(x => !x.pris)) st.jour = d; }
    aller(2); $("#rdv").scrollIntoView({ behavior: "smooth" }); });

  /* Envoi (démo) */
  function err(el, m) { const c = el.closest(".champ"); c.classList.toggle("ko", !!m); c.querySelector(".err").textContent = m || ""; return !m; }
  let via = "wa", avantM;
  $("#form-rdv").addEventListener("submit", e => {
    e.preventDefault(); via = (e.submitter && e.submitter.dataset.via) || "wa";
    const nom = $("#r-nom"), tel = $("#r-tel");
    let ok = err(nom, nom.value.trim().length < 2 ? T("Indiquez le nom du patient.", "Please enter the patient's name.") : "");
    ok = err(tel, !/^[+\d][\d\s().-]{7,}$/.test(tel.value.trim()) ? T("Numéro invalide.", "Invalid number.") : "") && ok;
    if (!ok) return;
    const s = S(st.soin), motif = $("#r-motif").value.trim(), prem = $("#r-premiere").checked;
    const date = st.jour.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" });
    let txt = T(`Bonjour Afya 👋\nJe souhaite un rendez-vous :\n\n🩺 ${L(s)[0]} · ${nomDoc(st.doc)}\n📅 ${date} à ${heureTxt(st.heure)}\n📍 ${st.mode === "video" ? "En vidéo" : "Au centre"}\n💰 ${usd(prix())}` + (motif ? `\n📝 ${motif}` : "") + (prem ? "\n🆕 Première visite" : "") + `\n\n👤 ${nom.value.trim()} · ${tel.value.trim()}\n🔖 ${code()}\n\nMerci !`,
      `Hello Afya 👋\nI'd like an appointment:\n\n🩺 ${L(s)[0]} · ${nomDoc(st.doc)}\n📅 ${date} at ${heureTxt(st.heure)}\n📍 ${st.mode === "video" ? "Video call" : "At the centre"}\n💰 ${usd(prix())}` + (motif ? `\n📝 ${motif}` : "") + (prem ? "\n🆕 First visit" : "") + `\n\n👤 ${nom.value.trim()} · ${tel.value.trim()}\n🔖 ${code()}\n\nThank you!`);
    const mail = via === "mail", boite = $(".m-boite"); boite.classList.toggle("mail", mail);
    if (mail) txt = T("À : rdv@afya.example\nObjet : Demande de rendez-vous · ", "To: rdv@afya.example\nSubject: Appointment request · ") + code() + "\n\n" + txt.replace(/ 👋/, ",").replace(/[🩺📅📍💰📝🆕👤🔖]️? ?/gu, "");
    $("#msg-titre").textContent = mail ? T("Nouvel e-mail", "New email") : "Afya · " + T("Rendez-vous", "Appointments");
    $("#msg-sous").textContent = mail ? "rdv@afya.example" : T("en ligne · répond en quelques minutes", "online · replies within minutes");
    const b = $("#bulle"); b.textContent = txt; const sm = document.createElement("small"); sm.textContent = mail ? "" : new Date().toTimeString().slice(0, 5) + " ✓✓"; b.appendChild(sm);
    $("#msg-explique").innerHTML = mail ? T("<b>Démonstration :</b> sur le vrai site, votre messagerie s'ouvre avec cet e-mail déjà écrit. Rien n'est envoyé ici.", "<b>Demo:</b> on the real website, your email app opens with this email already written. Nothing is sent here.")
      : T("<b>Démonstration :</b> sur le vrai site, WhatsApp s'ouvre avec ce message déjà écrit, adressé à la clinique. Rien n'est envoyé ici.", "<b>Demo:</b> on the real website, WhatsApp opens with this message already written, addressed to the clinic. Nothing is sent here.");
    $("#ok-rdv").classList.remove("on"); $(".m-bas > .act").hidden = false; $("#msg-explique").hidden = false;
    avantM = document.activeElement; $("#msg").hidden = false; $("#msg-ok").focus();
  });
  const fermerM = () => { $("#msg").hidden = true; if (avantM) avantM.focus(); };
  $("#msg-fermer").onclick = fermerM;
  $("#msg").addEventListener("click", e => { if (e.target.id === "msg") fermerM(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#msg").hidden) fermerM(); });
  $("#msg-ok").onclick = () => { $(".m-bas > .act").hidden = true; $("#msg-explique").hidden = true; $("#ok-rdv").classList.add("on"); $("#ics").focus(); };
  // Ajout à l'agenda : un vrai fichier .ics
  $("#ics").onclick = () => {
    const d = new Date(st.jour); d.setHours(Math.floor(st.heure / 60), st.heure % 60); const f = new Date(+d + S(st.soin).duree * 6e4);
    const z = x => x.getFullYear() + String(x.getMonth() + 1).padStart(2, "0") + String(x.getDate()).padStart(2, "0") + "T" + String(x.getHours()).padStart(2, "0") + String(x.getMinutes()).padStart(2, "0") + "00";
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Afya demo//FR", "BEGIN:VEVENT", "UID:" + code() + "@afya.example", "DTSTAMP:" + z(new Date()), "DTSTART:" + z(d), "DTEND:" + z(f),
      "SUMMARY:" + L(S(st.soin))[0] + " · Afya (" + T("démo", "demo") + ")", "DESCRIPTION:" + nomDoc(st.doc) + " · " + code(), "LOCATION:" + (st.mode === "video" ? T("En vidéo", "Video call") : "Afya"),
      "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Afya", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "rendez-vous-afya.ics"; document.body.appendChild(a); a.click(); a.remove();
  };

  /* Équipe */
  function rendreDocs() {
    $("#docs").innerHTML = ["amina", "grace", "samuel", "esther"].map(id => { const D = DOCS[id], s = SOINS.find(x => x.docs.includes(id)), p = premierLibre(id);
      return `<article class="carte doc"><div class="h"><span class="pp" style="background:${D.c}">${D.i}</span><div><b>${D.n}</b><small>${L(s)[2]}</small></div></div>
        <div class="meta"><span>🗣️ ${D.lg}</span>${s.video ? `<span>📹 ${T("Vidéo possible", "Video available")}</span>` : ""}</div>
        <div class="dispo"><span>${T("Libre", "Free")} <b>${p ? quandTxt(p.d, p.k) + " · " + heureTxt(p.m) : "—"}</b></span><button type="button" data-doc-go="${id}">${T("Réserver", "Book")}</button></div></article>`; }).join("");
  }

  /* Visite du centre (défile toute seule) */
  const VIS = [
    ["exterieur", 577, 960, ["L'entrée", "Accès de plain-pied, parking gratuit, ouvert dès 7 h 30.", ["Parking", "Accès fauteuil", "Pharmacie voisine"]], ["The entrance", "Step-free access, free parking, open from 7:30 am.", ["Parking", "Wheelchair access", "Pharmacy next door"]]],
    ["attente", 736, 736, ["Salle d'attente", "Climatisée, Wi-Fi gratuit, eau offerte. Un écran affiche votre tour.", ["Climatisation", "Wi-Fi", "Écran d'appel"]], ["Waiting room", "Air-conditioned, free Wi-Fi, water offered. A screen shows your turn.", ["Air-con", "Wi-Fi", "Queue screen"]]],
    ["couloir", 1024, 1024, ["Les consultations", "Des cabinets calmes, désinfectés entre chaque patient.", ["Calme", "Désinfection", "Confidentialité"]], ["Consultations", "Quiet rooms, disinfected between every patient.", ["Quiet", "Disinfected", "Private"]]],
    ["chambre", 1080, 1289, ["Observation", "Pour quelques heures de surveillance ou une perfusion, au calme.", ["Lit médicalisé", "Surveillance", "Accompagnant"]], ["Observation", "For a few hours of monitoring or a drip, in peace.", ["Medical bed", "Monitoring", "Companion welcome"]]],
    ["imagerie", 736, 1308, ["Imagerie", "Échographie, radio numérique et scanner, sur place.", ["Écho", "Radio", "Scanner"]], ["Imaging", "Ultrasound, digital X-ray and CT scan, on site.", ["Ultrasound", "X-ray", "CT scan"]]]
  ];
  let vk = 0, vt;
  function rendreVisite() {
    $("#onglets").innerHTML = VIS.map((v, i) => { const l = en() ? v[4] : v[3]; return `<button type="button" role="tab" aria-selected="${i === vk}" class="${i === vk ? "on" : ""}" data-v="${i}"><b>${l[0]}</b><span>${l[1].split(",")[0]}</span><i></i></button>`; }).join("");
    if (!$("#scene img")) $("#scene").insertAdjacentHTML("afterbegin", VIS.map((v, i) => `<img src="img/${v[0]}-l.webp" width="${v[1]}" height="${v[2]}" alt="${v[3][0]}" loading="lazy" class="${i === 0 ? "on" : ""}">`).join(""));
    voirV(vk, true);
  }
  function voirV(i, sansMinuteur) {
    vk = (i + VIS.length) % VIS.length; const l = en() ? VIS[vk][4] : VIS[vk][3];
    $$("#scene img").forEach((m, j) => { m.classList.toggle("on", j === vk); if (j === vk) m.loading = "eager"; });
    $$("#onglets button").forEach((b, j) => { b.classList.remove("on"); b.setAttribute("aria-selected", j === vk); if (j === vk) { void b.offsetWidth; b.classList.add("on"); } });
    $("#sc-txt").textContent = l[1]; $("#sc-liste").innerHTML = l[2].map(x => `<li>${x}</li>`).join("");
    clearTimeout(vt); if (!/capture/.test(location.search)) vt = setTimeout(suiteV, 6000);
  }
  let pause = false;
  function suiteV() { if (pause) { vt = setTimeout(suiteV, 600); return; } voirV(vk + 1); }
  $("#onglets").addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (b) voirV(+b.dataset.v); });
  $("#visite").addEventListener("mouseenter", () => { pause = true; $("#visite").classList.add("pause"); });
  $("#visite").addEventListener("mouseleave", () => { pause = false; $("#visite").classList.remove("pause"); });

  /* Bouton urgence flottant : caché sur l'accueil et en bas de page */
  const urg = $(".urg-f"), maj = () => urg.classList.toggle("cache", scrollY < innerHeight * .7 || innerHeight + scrollY > document.documentElement.scrollHeight - 140);
  addEventListener("scroll", maj, { passive: true }); maj();

  function tout() { statut(); rendreSoins(); rendreOrient(); rendreRdv(); aller(st.etape); rendreDocs(); rendreVisite(); }
  tout(); setInterval(statut, 60000);
  $$(".lg button").forEach(b => b.addEventListener("click", () => setTimeout(tout, 0)));
})();
