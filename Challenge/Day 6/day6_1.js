import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = 'https://reqres.in/api';
const credentials = { email: 'eve.holt@reqres.in', password: 'cityslicka' };

// -------------------- Setup: Login & Get Token --------------------

export function setup() {
    const loginPayload = JSON.stringify(credentials);

    const loginRes = http.post(`${baseUrl}/login`, loginPayload, {
        headers: { 'Content-Type': 'application/json' }
    });

    const token = loginRes.json('token');

    check(loginRes, {
        '✅ Login succeeded': (r) => r.status === 200,
        '✅ Token exists': () => token !== undefined,
    });

    if (!token) {
        console.error('❌ Token missing during setup');
    }

    return { token };
}

// -------------------- Default: Use Token to Fetch User --------------------

export default function (data) {
    const token = data.token;
    if (!token) return;

    const userRes = http.get(`${baseUrl}/users/2`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    check(userRes, {
        '✅ Fetched user data': (r) => r.status === 200,
    });

    if (userRes.status !== 200) {
        console.error(`❌ User fetch failed. Status: ${userRes.status}, Body: ${userRes.body}`);
    }

    sleep(1);
}