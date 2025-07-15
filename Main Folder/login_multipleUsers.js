import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const userPool = [
  { username: 'garcia', password: '11!!qqQQ' },
  { username: 'rodri', password: '11!!qqQQ' },
  { username: 'patri', password: '11!!qqQQ' },
  { username: 'jhonson', password: '11!!qqQQ' },
  { username: 'smith', password: '11!!qqQQ' },
];

export const options = {
  stages: [
    { duration: '30s', target: 5 },  // Ramp-up to 5 VUs
    { duration: '1m', target: 5 },    // Maintain 5 VUs
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests should complete within 500ms
    http_req_failed: ['rate<0.01'],     // Less than 1% failed requests
    'checks{myTag:auth}': ['rate>0.99'] // 99% of auth checks should pass
  },
  ext: {
    loadimpact: {
      projectID: 'MAS Florafire',
      name: 'OAuth2 Load Test'
    }
  }
};

export default function () {
  const user = userPool[__VU - 1];

  const loginUrl = 'https://ustx000248.florafirebackdev.com/connect/token';

  const loginPayload =
    'grant_type=password' +
    '&username=' + encodeURIComponent(user.username) +
    '&password=' + encodeURIComponent(user.password) +
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

  check(loginRes, {
    [`${user.username} logged in`]: (r) => r.status === 200,
    [`${user.username} token received`]: (r) => r.body.includes('access_token'),
  });

  let token;
  try {
    const json = loginRes.json();
    token = json.access_token;
    
    check(json, {
      '✅ Response contains access_token': (j) => j.access_token !== undefined,
      '✅ Token is not empty': (j) => j.access_token.length > 0,
    }, { myTag: 'auth' });
    
    console.log(`✅ ${user.username} Access Token:`, token);
  } 
  catch (e) {
    console.error(`❌ Token missing for ${user.username}`);
    return;
  }

  sleep(1);
}