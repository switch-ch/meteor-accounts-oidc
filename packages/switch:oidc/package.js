Package.describe({
  summary: "OpenID Connect (OIDC) flow",
  version: "1.0.0",
  name: "switch:oidc",
  git: "https://github.com/switch-ch/meteor-accounts-oidc.git",
});

Package.onUse(function(api) {
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use('underscore', 'client');
  api.use('templating', 'client');
  api.use('random', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.export('Oidc');

  api.addFiles(['oidc_configure.html', 'oidc_configure.js'], 'client');

  api.addFiles('oidc_server.js', 'server');
  api.addFiles('oidc_client.js', 'client');
});
