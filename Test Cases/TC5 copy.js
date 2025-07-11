import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // ramp-up
    { duration: '1m', target: 50 },   // steady load
    { duration: '10s', target: 0 },   // ramp-down
  ],
};

const user = { username: 'testmustafizur+5001@gmail.com', password: '11!!qqQQ' };
const baseUrl = 'https://ustx000248.florafirebackdev.com';

export function setup() {
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
    '✅ Login returned 200': (r) => r.status === 200,
    '✅ Access token exists': (r) => r.json('access_token') !== undefined,
  });

  if (loginRes.status !== 200 || !loginRes.json('access_token')) {
    console.error('❌ Login failed or access token missing');
    console.error(`Status: ${loginRes.status}`);
    console.error(`Body: ${loginRes.body}`);
    return { token: null };
  }

  return { token: loginRes.json('access_token') };
}

export default function (data) {
  const token = data.token;
  if (!token) {
    console.error('❌ No access token. Skipping iteration.');
    return;
  }

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      __tenant: 'Default'
    }
  };

  // ✅ Order Entry API sample hits
  const orderEntryEndpoints = [
    '/api/app/discount/applicable-discount-codes',
    '/api/app/corporate-setting/corporate-setting',
  ];

  for (const path of orderEntryEndpoints) {
    const res = http.get(`${baseUrl}${path}`, headers);
    check(res, {
      [`✅ ${path} returned 200`]: (r) => r.status === 200
    });

    if (res.status !== 200) {
      console.error(`❌ ${path} failed → ${res.status}`);
      console.error(res.body);
    }
  }

  // 🔍 Random Product Search
  const productCodes = ['f003', 'f001', 'f005', 'f006', 'f008'];
  const searchKey = productCodes[Math.floor(Math.random() * productCodes.length)];
  const searchUrl = `${baseUrl}/api/app/product/product-by-product-code-and-name?searchKey=${encodeURIComponent(searchKey)}&pictureSizeType=2`;

  const searchRes = http.get(searchUrl, headers);

  check(searchRes, {
    [`🔍 Search '${searchKey}' returned 200`]: (r) => r.status === 200,
    [`🔍 Search '${searchKey}' returned data`]: (r) => r.body && r.body.length > 0
  });

  if (searchRes.status !== 200) {
    console.error(`❌ Product search failed → ${searchKey}`);
    console.error(`Status: ${searchRes.status}`);
    console.error(`Body: ${searchRes.body}`);
  }

  sleep(1);
}