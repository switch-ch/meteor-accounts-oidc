Package.describe({
  summary: "Login service for OpenID Connect (OIDC) accounts",
  version: "1.0.0"
});

Package.onUse(function(api) {
  api.use('accounts-base', ['client', 'server']);
  // Export Accounts (etc) to packages using this one.
  api.imply('accounts-base', ['client', 'server']);
  api.use('accounts-oauth', ['client', 'server']);
  api.use('switch:oidc', ['client', 'server']);

  api.addFiles('oidc_login_button.css', 'client');

  api.addFiles('oidc.js');
});
