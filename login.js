import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '1s',
};

export default function () {
  // Step 1: Login to get OAuth2 token
  const loginUrl = 'https://ustx000248.florafirebackdev.com/connect/token';

  const loginPayload =
    'grant_type=password' +
    '&username=' + encodeURIComponent('testmustafizur+5001@gmail.com') +
    '&password=' + encodeURIComponent('11!!qqQQ') +
    '&client_id=ClientPortal_App' +
    '&scope=' + encodeURIComponent('offline_access ClientPortal');

  const loginHeaders = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      '__tenant': 'Default',
    },
    timeout: '120s',
  };

  const loginRes = http.post(loginUrl, loginPayload, loginHeaders);

  // Check success
  check(loginRes, {
    '✅ successfully logged in': (r) => r.status === 200,
    '✅ response has token': (r) => r.body.includes('Bearer'),
  });

  // Step 2: Parse and print the access token
  const json = loginRes.json();
  const token = json.access_token;

  if (!token) {
      console.error('❌ Access token not found in login response');
      return;
  }

  console.log('✅ Access Token:', token);
  
  sleep(1);
}