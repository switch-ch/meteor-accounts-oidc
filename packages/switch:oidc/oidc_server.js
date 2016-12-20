Oidc = {};

OAuth.registerService('oidc', 2, null, function(query) {

  var debug = false;
  var token = getToken(query);
  //console.log('XXX: register token:', token);

  var accessToken = token.access_token;
  var expiresAt = (+new Date) + (1000 * parseInt(token.expires_in, 10));

  var userinfo = getUserInfo(accessToken);
  if (debug) console.log('XXX: userinfo:', userinfo);

  var serviceData = {};
  serviceData.id = userinfo.id || userinfo.sub;
  serviceData.username = userinfo.username || userinfo.preferred_username;
  serviceData.accessToken = OAuth.sealSecret(accessToken);
  serviceData.expiresAt = expiresAt;
  serviceData.email = userinfo.email;
  if (token.refresh_token)
    serviceData.refreshToken = token.refresh_token;
  if (debug) console.log('XXX: serviceData:', serviceData);

  var profile = {};
  profile.name = userinfo.name;
  profile.email = userinfo.email;
  if (debug) console.log('XXX: profile:', profile);

  return {
    serviceData: serviceData,
    options: { profile: profile }
  };
});

var userAgent = "Meteor";
if (Meteor.release) {
  userAgent += "/" + Meteor.release;
}

var getToken = function (query) {
  var debug = false;
  var config = getConfiguration();
  var serverTokenEndpoint = config.serverUrl + config.tokenEndpoint;
  var response;

  try {
    response = HTTP.post(
      serverTokenEndpoint,
      {
        headers: {
          Accept: 'application/json',
          "User-Agent": userAgent
        },
        params: {
          code:           query.code,
          client_id:      config.clientId,
          client_secret:  OAuth.openSecret(config.secret),
          redirect_uri:   OAuth._redirectUri('oidc', config),
          grant_type:     'authorization_code',
          state:          query.state
        }
      }
    );
  } catch (err) {
    throw _.extend(new Error("Failed to get token from OIDC " + serverTokenEndpoint + ": " + err.message),
                   {response: err.response});
  }
  if (response.data.error) {
    // if the http response was a json object with an error attribute
    throw new Error("Failed to complete handshake with OIDC " + serverTokenEndpoint + ": " + response.data.error);
  } else {
    if (debug) console.log('XXX: getToken response: ', response.data);
    return response.data;
  }
};

var getUserInfo = function (accessToken) {
  var debug = false;
  var config = getConfiguration();
  var serverUserinfoEndpoint = config.serverUrl + config.userinfoEndpoint;
  var response;
  try {
    response = HTTP.post(
      serverUserinfoEndpoint,
      {
        headers: {
          "User-Agent": userAgent
        },
        params: {
          access_token: accessToken
        }
      }
    );
  } catch (err) {
    throw _.extend(new Error("Failed to fetch userinfo from OIDC " + serverUserinfoEndpoint + ": " + err.message),
                   {response: err.response});
  }
  if (debug) console.log('XXX: getUserInfo response: ', response.data);
  return response.data;
};

var getConfiguration = function () {
  var config = ServiceConfiguration.configurations.findOne({ service: 'oidc' });
  if (!config) {
    throw new ServiceConfiguration.ConfigError('Service oidc not configured.');
  }
  return config;
};


Oidc.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
