import http from 'k6/http';
import { check, sleep } from 'k6';

const userPool = [
  { username: 'garcia', password: '11!!qqQQ' },
  { username: 'rodri', password: '11!!qqQQ' },
  { username: 'patri', password: '11!!qqQQ' },
  { username: 'jhonson', password: '11!!qqQQ' },
  { username: 'smith', password: '11!!qqQQ' },
];

export const options = {
  vus: 5, // match number of users
  duration: '5s',
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

  const token = loginRes.json().access_token;

  if (!token) {
    console.error(`❌ Token missing for ${user.username}`);
  } 
  else {
    console.log(`✅ ${user.username} token:`, token);
  }

  sleep(1);
}