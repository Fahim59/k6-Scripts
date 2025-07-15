//Maintain peak load of 25 concurrent users for 1 hour to verify sustained performance. (Maintain 25 VUs for 1 Hour)

import http from 'k6/http';
import { check, sleep } from 'k6';

// Ramp configuration: 5 users per minute up to 25 users
export const options = {
  vus: 25,
  duration: '1h',
  noConnectionReuse: false,
  tags: { test_type: 'soak_test' },
};

// Simulated user credentials
const userPool = [
  { username: 'mustafiz', password: '11!!qqQQ' },
  { username: 'mark', password: '11!!qqQQ' },
  { username: 'javier', password: '11!!qqQQ' },
  { username: 'curtis01', password: '11!!qqQQ' },
  { username: 'ana', password: '11!!qqQQ' },
  { username: 'jhon', password: '11!!qqQQ' },
  { username: 'amy', password: '11!!qqQQ' },
  { username: 'william', password: '11!!qqQQ' },
  { username: 'mary', password: '11!!qqQQ' },
  { username: 'jenni', password: '11!!qqQQ' },
  { username: 'james', password: '11!!qqQQ' },
  { username: 'wilson', password: '11!!qqQQ' },
  { username: 'elizabeth', password: '11!!qqQQ' },
  { username: 'linda', password: '11!!qqQQ' },
  { username: 'robert', password: '11!!qqQQ' },
  { username: 'garcia', password: '11!!qqQQ' },
  { username: 'rodri', password: '11!!qqQQ' },
  { username: 'patri', password: '11!!qqQQ' },
  { username: 'jhonson', password: '11!!qqQQ' },
  { username: 'smith', password: '11!!qqQQ' },
  { username: 'miller', password: '11!!qqQQ' },
  { username: 'davis', password: '11!!qqQQ' },
  { username: 'brown', password: '11!!qqQQ' },
  { username: 'tanvir', password: '11!!qqQQ' },
  { username: 'rajib', password: '11!!qqQQ' },
];

export default function () {
  const user = userPool[(__VU - 1) % userPool.length]; // Recycle users if not enough

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

  if (loginRes.status !== 200) {
    console.error(`❌ Login failed for ${user.username} at ${baseUrl}`);
    console.error(`Status: ${loginRes.status}`);
    console.error(`Body: ${loginRes.body}`);
  }

  check(loginRes, {
    [`${user.username} logged in`]: (r) => r.status === 200,
    [`${user.username} token received`]: (r) => r.body.includes('access_token'),
  });

  const token = loginRes.json().access_token;

  if (!token) {
    console.error(`❌ Token missing for ${user.username}`);
  } else {
    console.log(`✅ ${user.username} token:`, token);
  }

  sleep(1);
}