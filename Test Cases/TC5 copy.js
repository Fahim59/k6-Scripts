import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export const options = {
  stages: [
    // { duration: '30s', target: 50 },  // ramp-up to 50 users
    // { duration: '1m', target: 50 },   // stay at 50 users
    // { duration: '10s', target: 0 },   // ramp-down

    { duration: '10s', target: 10 },  // ramp-up to 50 users
    { duration: '15s', target: 10 },   // stay at 50 users
    { duration: '5s', target: 0 },   // ramp-down
  ],
  // thresholds: {
  //   http_req_duration: ['p(95)<2000'], // 95% of requests < 2s
  //   'checks': ['rate>0.99'],           // at least 99% checks must pass
  // },
};

const userPool = [
  { username: 'mustafiz', password: '11!!qqQQ' },
  // { username: 'garcia', password: '11!!qqQQ' },
  //{ username: 'curtis01', password: '11!!qqQQ' },
  //{ username: 'ana', password: '11!!qqQQ' },
  //{ username: 'javier', password: '11!!qqQQ' }
];

export default function () {
  const user = userPool[(__VU - 1) % userPool.length];

  const baseUrl = 'https://ustx000248.florafirebackdev.com';
  const loginUrl = `${baseUrl}/connect/token`;

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
    [`✅ ${user.username} logged in`]: (r) => r.status === 200,
    [`✅ ${user.username} received token`]: (r) => r.json('access_token') !== undefined,
  });

  const token = loginRes.json().access_token;

  if (!token) {
    console.error('❌ Access token not found');
    return;
  }

  // ✅ Order Entry API sample hits
  const orderEntryEndpoints = [
    '/api/app/discount/applicable-discount-codes',
    '/api/app/corporate-setting/corporate-setting',
  ];

  for (const path of orderEntryEndpoints) {
    const apiRes = http.get(`${baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        __tenant: 'Default'
      }
    });

    check(apiRes, {
      [`✅ ${path} returned 200`]: (r) => r.status === 200
    });

    if (apiRes.status !== 200) {
      console.error(`❌ ${path} failed`);
      console.error(`Status: ${apiRes.status}`);
      console.error(`Body: ${apiRes.body}`);
    }
  }

  // 🔍 Random Product Search
  const productCodes = ['f003', 'f001', 'f005', 'f006', 'f008'];
  const randomIndex = Math.floor(Math.random() * productCodes.length);
  const searchKey = productCodes[randomIndex];

  const searchQuery = `searchKey=${encodeURIComponent(searchKey)}&pictureSizeType=2`;
  const searchUrl = `${baseUrl}/api/app/product/product-by-product-code-and-name?${searchQuery}`;

  const searchRes = http.get(searchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      __tenant: 'Default'
    }
  });

  check(searchRes, {
    [`🔍 Search '${searchKey}' returned 200`]: (r) => r.status === 200,
    [`🔍 Search '${searchKey}' returned results`]: (r) => r.body && r.body.length > 0
  });

  if (searchRes.status !== 200) {
    console.error(`❌ Product search failed`);
    console.error(`Status: ${searchRes.status}`);
    console.error(`Body: ${searchRes.body}`);
  }

  sleep(1);
}