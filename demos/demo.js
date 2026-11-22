// Traduction FR/EN des démonstrations : chaque élément porte data-en (le français est le texte d'origine)
(function(){var els=[].slice.call(document.querySelectorAll('[data-en]'));els.forEach(function(e){e.dataset.fr=e.innerHTML});
var l;try{l=new URLSearchParams(location.search).get('lang')||localStorage.getItem('lumen-lang')}catch(e){}
if(l!=='fr'&&l!=='en')l=/^fr\b/i.test(navigator.language||'fr')?'fr':'en';
function go(x){l=x;document.documentElement.lang=x;els.forEach(function(e){e.innerHTML=x==='en'?e.dataset.en:e.dataset.fr});
[].forEach.call(document.querySelectorAll('.lg button'),function(b){b.classList.toggle('on',b.dataset.l===x)});try{localStorage.setItem('lumen-lang',x)}catch(e){}}
[].forEach.call(document.querySelectorAll('.lg button'),function(b){b.onclick=function(){go(b.dataset.l)}});go(l)})();
// Les boutons d'action ouvrent WhatsApp (vers Lumen Web : « je veux le même site »)
(function(){var w=document.querySelector('.wa');if(!w)return;[].forEach.call(document.querySelectorAll('.btn[href="#"],.wa-btn,.tel'),function(b){b.href=w.href;b.target='_blank';b.rel='noopener'})})();
