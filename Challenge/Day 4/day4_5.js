import http from 'k6/http';
import { check, fail, sleep } from 'k6';

export default function () {
    // Step 1: Login
    let loginRes = http.post('https://restful-booker.herokuapp.com/auth', JSON.stringify({
        username: 'admin',
        password: 'password123',
    }), { headers: { 'Content-Type': 'application/json' } });

    let loginCheck = check(loginRes, {
        'Login status 200': (r) => r.status === 200,
    });

    if (!loginCheck) fail('❌ Login failed, stopping iteration');

    let token = JSON.parse(loginRes.body).token;
    console.log(`✅ Logged in, token: ${token}`);

    // Step 2: Fetch user
    let userRes = http.get('https://restful-booker.herokuapp.com/booking');
    check(userRes, { 'User fetch status 200': (r) => r.status === 200 });

    sleep(1);
}