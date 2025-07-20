import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 3,
    iterations: 6,
};

export function setup() {
    console.log('🔑 Setting up: Login or token generation');
    return { token: 'fake-token-abc123' };
}

export default function (data) {
    console.log(`🧪 Running default with token: ${data.token}`);
    
    let res = http.get('https://reqres.in/api/users/2', {
        headers: { Authorization: `Bearer ${data.token}` },
    });

    check(res, {
        'status is 200': (r) => r.status === 200,
    });
}

export function teardown(data) {
    console.log('🧹 Tearing down: Clean up actions');
}