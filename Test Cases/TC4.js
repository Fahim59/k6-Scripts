import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  vus: 1,
  duration: '1s',

  thresholds: {
    // Combine TLS + Connect time: keep under 200ms (90% of the time)
    'http_req_tls_handshaking': ['p(90)<100'],
    'http_req_connecting': ['p(90)<100'],
    
    // Optional: Fail test if total duration too high
    'http_req_duration': ['p(95)<2000'], // 95% must be < 2s
  },

  noConnectionReuse: false, // Allow persistent connections
  insecureSkipTLSVerify: false,
};

export default function () {
  // Step 1: Login to get OAuth2 token
  const loginUrl = 'https://florafirebackdev.com/connect/token';

  const loginPayload =
    'grant_type=password' +
    '&username=' + encodeURIComponent('fahim') +
    '&password=' + encodeURIComponent('11!!qqQQ') +
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
    console.error(`❌ Login failed for fahim at ${loginUrl}`);
    console.error(`Status: ${loginRes.status}`);
    console.error(`Body: ${loginRes.body}`);
  }

  check(loginRes, {
    'fahim logged in': (r) => r.status === 200,
    'fahims token received': (r) => r.body.includes('access_token'),
  });

  // Step 2: Parse and print the access token
  const token = loginRes.json().access_token;

  if (!token) {
      console.error('❌ Access token not found in login response');
      return;
  }

  //Step 3: Call a protected API using the token
  const protectedApiHeaders = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json, text/plain, */*',
      'Host': 'florafirebackdev.com'
  };
  
  const res = http.get('https://ustx000248.florafirebackdev.com/api/app/error-log?LogLevelId=0&SkipCount=0&MaxResultCount=1000', {
      headers: protectedApiHeaders
  });
  
  check(res, {
      'successfully hit error log page': (r) => r.status === 200
  });
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    "tc4.html": htmlReport(data),
    'tc4.json': JSON.stringify(data),
    //k6 run script.js --out csv=result.csv
  };
}