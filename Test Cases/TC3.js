//Login in different tenant at the same time.

import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  vus: 10,           // 5 users per environment
  duration: '1m',   // run for 2 minutes
  noConnectionReuse: false,
};

const ustx000248 = [
  { username: 'mustafiz', password: '11!!qqQQ' },
  { username: 'mark', password: '11!!qqQQ' },
  { username: 'javier', password: '11!!qqQQ' },
  { username: 'curtis01', password: '11!!qqQQ' },
  { username: 'ana', password: '11!!qqQQ' },
];

const usme000211 = [
  { username: 'ana', password: '11!!qqQQ' },
  { username: 'vaugh', password: '11!!qqQQ' },
  { username: 'emi', password: '11!!qqQQ' },
  { username: 'clark', password: '11!!qqQQ' },
  { username: 'test', password: '11!!qqQQ' },
];

export default function () {
  let baseUrl, user;

  if (__VU <= 5) {
    // First 5 VUs → Server 248
    baseUrl = 'https://ustx000248.florafirebackdev.com/connect/token';
    user = ustx000248[__VU - 1];
  } 
  else {
    // Next 5 VUs → Server 249
    baseUrl = 'https://usme000211.florafirebackdev.com/connect/token';
    user = usme000211[__VU - 6];
  }

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

  const loginRes = http.post(baseUrl, loginPayload, loginHeaders);

  if (loginRes.status !== 200) {
    console.error(`❌ Login failed for ${user.username} at ${baseUrl}`);
    console.error(`Status: ${loginRes.status}`);
    console.error(`Body: ${loginRes.body}`);
  }

  check(loginRes, {
    [`${user.username} logged in`]: (r) => r.status === 200,
    [`${user.username} received token`]: (r) => r.json('access_token') !== undefined,
  });

  sleep(1);
}

// Generate HTML + JSON after test
export function handleSummary(data) {
  return {
    'tc3_result.html': htmlReport(data),
    'tc3_result-summary.json': JSON.stringify(data, null, 2),
  };
}