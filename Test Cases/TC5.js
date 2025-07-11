import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // ramp-up
    { duration: '1m', target: 50 },   // steady load
    { duration: '10s', target: 0 },   // ramp-down
  ],
    thresholds: {
    http_req_duration: ['p(95) < 2000'], // 95% of requests < 2s
    'checks': ['rate > 0.99'],           // at least 99% checks must pass
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

  const loginHeaders = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      '__tenant': 'Default',
      'User-Agent': 'k6-load-test'
    },
    timeout: '120s',
  };

  const loginRes = http.post(loginUrl, loginPayload, loginHeaders);

  let token;
  try {
    token = loginRes.json('access_token');
  } catch (err) {
    console.error('❌ Failed to parse login response as JSON');
    console.error(`Body: ${loginRes.body}`);
  }

  check(loginRes, {
    '✅ Login returned 200': (r) => r.status === 200,
    '✅ Access token exists': () => token !== undefined,
  });

  if (loginRes.status !== 200 || !token) {
    console.error('❌ Login failed or access token missing');
    console.error(`Status: ${loginRes.status}`);
    console.error(`Body: ${loginRes.body}`);
    return { token: null };
  }

  return { token };
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
      __tenant: 'Default',
      'User-Agent': 'k6-load-test'
    }
  };

  // ✅ Parallel requests to Order Entry APIs
  const orderEntryEndpoints = [
    '/api/app/discount/applicable-discount-codes',
    '/api/app/corporate-setting/corporate-setting',
  ];

  const requests = orderEntryEndpoints.map(path => ['GET', `${baseUrl}${path}`, null, headers]);
  const responses = http.batch(requests);

  responses.forEach((res, idx) => {
    const path = orderEntryEndpoints[idx];
    check(res, {
      [`✅ ${path} returned 200`]: (r) => r.status === 200,
    });
    if (res.status !== 200) {
      console.error(`❌ ${path} failed → ${res.status}`);
      console.error(res.body);
    }
  });

  // 🔍 Random Product Search
  const productCodes = ['f003', 'f001', 'f005', 'f006', 'f008'];
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

export function handleSummary(data) {
  return {
    'tc5.html': htmlReport(data),
    'tc5_result-summary.json': JSON.stringify(data),
  };
}