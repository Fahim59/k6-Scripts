import http from 'k6/http';
import { check, fail } from 'k6';

export default function () {
    let res = http.get('https://restful-booker.herokuapp.com/booking');

    let passed = check(res, {
        'status is 200': (r) => r.status === 200,
    });

    if (!passed) {
        fail('❌ Critical failure: Status not 200');
    }
}