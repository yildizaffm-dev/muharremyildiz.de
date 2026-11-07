(function(){
var red=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
/* Einblenden + goldene Unterstreichung */
var beob="IntersectionObserver" in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("da");beob.unobserve(e.target);if(e.target.hasAttribute("data-zaehl"))zaehl(e.target)}})},{rootMargin:"0px 0px -12% 0px"}):null;
document.querySelectorAll(".einblenden,.unterstrich,[data-zaehl]").forEach(function(el){if(beob)beob.observe(el);else{el.classList.add("da");if(el.hasAttribute("data-zaehl"))zaehl(el)}});
/* Zaehler */
function zaehl(el){var ziel=+el.getAttribute("data-zaehl"),von=+(el.getAttribute("data-von")||0),nach=el.getAttribute("data-nach")||"";if(red){el.textContent=ziel+nach;return}
var t0=null,d=1600;function s(t){if(!t0)t0=t;var p=Math.min((t-t0)/d,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(von+(ziel-von)*e)+nach;if(p<1)requestAnimationFrame(s)}requestAnimationFrame(s)}
/* Wechselwort */
var w=document.getElementById("wechselwort");
if(w&&!red){var ws=JSON.parse(w.getAttribute("data-woerter")),i=0;setInterval(function(){w.classList.add("raus");setTimeout(function(){i=(i+1)%ws.length;w.textContent=ws[i];w.classList.remove("raus")},350)},2600)}
/* Glanz folgt der Maus */
document.querySelectorAll(".glanz").forEach(function(k){k.addEventListener("pointermove",function(e){var r=k.getBoundingClientRect();k.style.setProperty("--mx",(e.clientX-r.left)+"px");k.style.setProperty("--my",(e.clientY-r.top)+"px")})});
/* Menue */
var m=document.getElementById("menue"),b=document.getElementById("burger");
if(m&&b){function auf(a){m.classList.toggle("offen",a);m.setAttribute("aria-hidden",!a);b.setAttribute("aria-expanded",a);document.documentElement.style.overflow=a?"hidden":""}
b.onclick=function(){auf(true)};document.getElementById("zu").onclick=function(){auf(false)};m.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){auf(false)})});
document.addEventListener("keydown",function(e){if(e.key==="Escape")auf(false)})}
})();
/* Zusaetze im Kopf blenden beim Scrollen mit aus */
(function(){var els=document.querySelectorAll(".hero .wechsel,.hero .heldlinks");if(!els.length)return;function f(){var o=Math.max(0,1-scrollY/(innerHeight*.25));els.forEach(function(e){e.style.opacity=o;e.style.visibility=o<.02?"hidden":"visible"})}addEventListener("scroll",f,{passive:true});f()})();
