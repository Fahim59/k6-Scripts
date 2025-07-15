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
    '✅ Login status is 200': (r) => r.status === 200,
    '✅ Response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Step 2: Parse and print the access token
  let token;
  try {
    const json = loginRes.json();
    token = json.access_token;
    
    check(json, {
      '✅ Response contains access_token': (j) => j.access_token !== undefined,
      '✅ Token is not empty': (j) => j.access_token.length > 0,
    });
    
    console.log('✅ Access Token:', token);
  } 
  catch (e) {
    console.error('❌ Failed to parse JSON response:', e);
    return;
  }
  
  sleep(1);
}