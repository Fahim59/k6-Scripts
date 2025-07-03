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

  // Step 3: Call a protected API using the token
  const protectedApiHeaders = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      '__tenant': '831016f7-1aed-e853-54a7-3a1a049113d2' // You can dynamically fetch or hardcode this
  };
  
  const res = http.get('https://ustx000248.florafirebackdev.com/api/app/customer?skipCount=0&maxResultCount=10', {
      headers: protectedApiHeaders
  });
  
  check(res, {
      '✅ successfully hit customer maintenance page': (r) => r.status === 200
  });
  
  sleep(1);
}