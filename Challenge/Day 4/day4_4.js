import http from 'k6/http';
import { check } from 'k6';

export default function () {
    let res = http.get('https://restful-booker.herokuapp.com/booking/23'); // Non-existing booking id!

    const passed = check(res, {
        'status is 200': (r) => r.status === 200,
    });

    if (!passed) {
        console.error(`❌ Failed API: ${res.url} returned status ${res.status}`);
        console.error(`Response body: ${res.body}`);
    }
}