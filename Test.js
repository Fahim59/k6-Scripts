import http from 'k6/http';
import { check, sleep } from 'k6';

const productCodes = ['f003', 'f001', 'f005', 'f006', 'f008'];

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '15s', target: 10 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests < 2s
    checks: ['rate > 0.99'],           // at least 99% must pass
  },
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

  const loginRes = http.post(loginUrl, loginPayload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      '__tenant': 'Default',
    }
  });

  const token = loginRes.json('access_token');

  check(loginRes, {
    '✅ Login succeeded': (r) => r.status === 200,
    '✅ Access token exists': () => token !== undefined,
  });

  if (!token) {
    console.error('❌ Token missing');
  }

  return { token };
}

//--------------------------------------------------------------------------------------

export default function (data) {
  const token = data.token;
  if (!token) return;

  const headers = {
    'Authorization': `Bearer ${token}`,
    '__tenant': 'Default',
    'Content-Type': 'application/json'
  };

  const searchKey = productCodes[Math.floor(Math.random() * productCodes.length)];
  const searchUrl = `${baseUrl}/api/app/product/product-by-product-code-and-name?searchKey=${encodeURIComponent(searchKey)}&pictureSizeType=2`;

  const searchRes = http.get(searchUrl, headers);

  let hasData = false;
  try {
    const json = searchRes.json();
    hasData = json && Object.keys(json).length > 0;
  } 
  catch (e) {
    hasData = searchRes.body && searchRes.body.length > 0;
  }

  check(searchRes, {
    [`🔍 Search '${searchKey}' returned 200`]: (r) => r.status === 200,
    [`🔍 Search '${searchKey}' returned data`]: () => hasData
  });

  if (searchRes.status !== 200 || !hasData) {
    console.error(`❌ Product search failed → ${searchKey}`);
    console.error(`Status: ${searchRes.status}`);
    console.error(`Body: ${searchRes.body}`);
  }

  sleep(1);
}