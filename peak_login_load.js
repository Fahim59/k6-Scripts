import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 100 },  // Ramp-up to 100 VUs over 5 minutes
    { duration: '1h', target: 100 },  // Maintain 100 VUs for 1 hour
    { duration: '5m', target: 0 },    // Ramp-down to 0 VUs over 5 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],    // Less than 1% failed requests
  },
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
    });
  } 
  catch (e) {
    console.error('❌ Failed to parse JSON response:', e);
    return;
  }
  
  sleep(1);
}