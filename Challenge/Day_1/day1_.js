import http from 'k6/http';
import { check, sleep } from 'k6';

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
