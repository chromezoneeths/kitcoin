/*jshint -W104, -W119 */
// This file contains abstractions for Google APIs.
const conf = require('./config');
const uuid = require('uuid/v4');
const url = require('url');
const k = require('./keys'); // This won't be in the repository; make your own keys in the Google Developer Console.
const sharedScopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];
const staffScopes = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails'
];
const { google } = require('googleapis');

exports.url = ((isStaff) => {
  return new Promise(async (r, rj) => {
    var client = new google.auth.OAuth2(
      k.clientId,
      k.clientSecret,
      `${conf.baseUrl}/ocb`
    );
    var scopes = sharedScopes;
    if (isStaff) scopes.concat(staffScopes);
    const url = client.generateAuthUrl({
      access_type: 'online',
      scope: scopes
    });
    r(url);
  });
});
exports.callback = (() => {
  return new Promise(async (r, rj) => {

  });
});