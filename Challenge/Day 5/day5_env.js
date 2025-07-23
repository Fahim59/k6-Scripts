import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'https://restful-booker.herokuapp.com';
const username = __ENV.USERNAME;
const password = __ENV.PASSWORD;

export default function () {
    if (!username || !password) {
        console.error('ERROR: USERNAME and PASSWORD environment variables are required');
        return;
    }

    const payload = JSON.stringify({
        username: username,
        password: password,
    });

    const headers = { 'Content-Type': 'application/json' };

    let res = http.post(`${baseUrl}/auth`, payload, { headers });

    check(res, {
        'login status is 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
        const token = res.json('token');
        console.log(`✅ Token for ${username}: ${token}`);
    } 
    else {
        console.log(`❌ Login failed for ${username}`);
    }

    sleep(1);
}