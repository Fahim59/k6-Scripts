//Login with single and multiple users (Test with increasing load ramp (1 user every 30 seconds, up to 25 users))

import http from 'k6/http';
import { check, sleep } from 'k6';

// Ramp configuration: 1 user every 30 seconds, up to 25 users
export const options = {
  stages: [
    { duration: '30s', target: 1 },
    { duration: '30s', target: 2 },
    { duration: '30s', target: 3 },
    { duration: '30s', target: 4 },
    { duration: '30s', target: 5 },
    { duration: '30s', target: 6 },
    { duration: '30s', target: 7 },
    { duration: '30s', target: 8 },
    { duration: '30s', target: 9 },
    { duration: '30s', target: 10 },
    { duration: '30s', target: 11 },
    { duration: '30s', target: 12 },
    { duration: '30s', target: 13 },
    { duration: '30s', target: 14 },
    { duration: '30s', target: 15 },
    { duration: '30s', target: 16 },
    { duration: '30s', target: 17 },
    { duration: '30s', target: 18 },
    { duration: '30s', target: 19 },
    { duration: '30s', target: 20 },
    { duration: '30s', target: 21 },
    { duration: '30s', target: 22 },
    { duration: '30s', target: 23 },
    { duration: '30s', target: 24 },
    { duration: '30s', target: 25 },
  ],
  noConnectionReuse: false, // Allow persistent connections
  insecureSkipTLSVerify: false,
  tags: { test_type: 'login_ramp' },
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

  sleep(1); // Short pause between iterations
}