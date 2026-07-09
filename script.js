// Local time in Goa (IST)
function updateTime() {
  var el = document.getElementById('local-time');
  if (!el) return;
  var opts = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false };
  el.textContent = 'IST ' + new Intl.DateTimeFormat('en-GB', opts).format(new Date()) + ' — Goa';
}
updateTime();
setInterval(updateTime, 30000);

// Scroll reveal
var revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(function(el) { io.observe(el); });
} else {
  revealEls.forEach(function(el) { el.classList.add('in'); });
}
