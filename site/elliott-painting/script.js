// Elliott Painting Inc: spec preview behavior (self-contained, see SPECS.md)

// Close the Services menu when tapping anywhere else
document.addEventListener('click', function (e) {
  document.querySelectorAll('.nav-services[open]').forEach(function (menu) {
    if (!menu.contains(e.target)) menu.removeAttribute('open');
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
        '<p>We got your request and will reach out soon to set up your free estimate.</p>' +
        '<p class="preview-note"><strong>Preview:</strong> this request was not sent anywhere. ' +
        'On the live site, every estimate request texts and emails you instantly and is saved to your CRM, ' +
        'so no lead slips through.</p>' +
      '</div>';
  });
});
