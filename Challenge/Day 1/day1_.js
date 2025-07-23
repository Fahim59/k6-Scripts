import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export default function () {
    // Step 1: Login
    let loginRes = http.post('https://restful-booker.herokuapp.com/auth', JSON.stringify({
        username: 'admin',
        password: 'password123',
    }), 
    { 
      headers: { 'Content-Type': 'application/json' } 
    });

    check(loginRes, 
      { 'login status 200': (r) => r.status === 200 },
    );

    // Step 2: Fetch Booking Data
    let res = http.get('https://restful-booker.herokuapp.com/booking');

    check(res, 
      { 'fetch status 200': (r) => r.status === 200 }, 
    );

    sleep(1);
}

export function handleSummary(data) {
  return {
    "tc1.html": htmlReport(data),
    'tc1_result-summary.json': JSON.stringify(data),
    //k6 run script.js --out csv = tc_1result.csv
  };
}
