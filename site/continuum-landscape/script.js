// Spec template behavior. specs/build.py copies this file into each spec folder.

var header = document.querySelector('.site-header');
var menuToggle = document.querySelector('.menu-toggle');
var mobileMenu = document.getElementById('mobile-menu');
var servicesItem = document.querySelector('.has-menu');
var servicesButton = servicesItem && servicesItem.querySelector('.nav-link');

function setMobileMenu(open) {
  mobileMenu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  header.classList.toggle('menu-open', open);
}

function setServicesMenu(open) {
  servicesItem.classList.toggle('open', open);
  servicesButton.setAttribute('aria-expanded', String(open));
}

// Phone: hamburger opens and closes the full menu; picking a link closes it
menuToggle.addEventListener('click', function () { setMobileMenu(mobileMenu.hidden); });
mobileMenu.addEventListener('click', function (e) { if (e.target.closest('a')) setMobileMenu(false); });

// Desktop: Services opens on hover (CSS) or click/tap (here)
servicesButton.addEventListener('click', function () { setServicesMenu(!servicesItem.classList.contains('open')); });

// Click outside or press Escape to close either menu
document.addEventListener('click', function (e) {
  if (!servicesItem.contains(e.target)) setServicesMenu(false);
  if (!header.contains(e.target)) setMobileMenu(false);
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { setServicesMenu(false); setMobileMenu(false); }
});

// Header turns solid once the page scrolls (designs that float it over the hero use this)
function setScrolled() { header.classList.toggle('scrolled', window.scrollY > 8); }
window.addEventListener('scroll', setScrolled, { passive: true });
setScrolled();

// Before/after sliders: the range input moves the divider
document.querySelectorAll('.ba input').forEach(function (input) {
  input.addEventListener('input', function () {
    input.closest('.ba').style.setProperty('--pos', input.value + '%');
  });
});

// Estimate form: PREVIEW MODE. Nothing is sent anywhere. At launch, replace
// the thank-you swap with a real submit (HubSpot form in the owner's own account).
document.querySelectorAll('.estimate-form').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = (form.elements.namedItem('name').value || '').trim().split(/\s+/)[0];
    form.innerHTML =
      '<div class="form-done" role="status">' +
        '<h3>Thanks' + (name ? ', ' + name.replace(/[<>&"]/g, '') : '') + '!</h3>' +
        '<p>' + form.dataset.thanks + '</p>' +
        '<p class="preview-note"><strong>Preview:</strong> this request was not sent anywhere. ' +
        'On the live site, every request texts and emails you instantly and is saved to your CRM, ' +
        'so no lead slips through.</p>' +
      '</div>';
  });
});
