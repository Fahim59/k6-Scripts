import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const searchTerms = new SharedArray('searchValues', function () {
  return [
    { type: 'name', value: 'Linda' },
    { type: 'phone', value: '+13847410628' },
    { type: 'id', value: '0000000001' },
    { type: 'name', value: 'Javier' },
    { type: 'phone', value: '+21245678033' },
    { type: 'id', value: '0000000008' }
  ];
});

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

  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const searchQuery = encodeURIComponent(randomTerm.value);

  const res = http.get(`${baseUrl}/api/app/customer?orderType=1&filter=${searchQuery}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      __tenant: 'Default'
    }
  });

  let responseData;
  try {
    responseData = res.json();
  } 
  catch (_) {
    responseData = null;
  }

  check(res, {
    [`🔍 Search '${randomTerm.value}' status 200`]: (r) => r.status === 200,
    [`🔍 Search '${randomTerm.value}' loads data`]: () => responseData && responseData.items && responseData.items.length >= 0,
    [`⚡ Search '${randomTerm.value}' under 2s`]: (r) => r.timings.duration < 2000
  });

  sleep(1);
}