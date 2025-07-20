import http from 'k6/http';
import { check } from 'k6';

export default function () {
    let res = http.get('https://restful-booker.herokuapp.com/booking');

    check(res, {
        'status is 200': (r) => r.status === 200,
        'content type is json': (r) => r.headers['Content-Type'].includes('application/json'),
        'response has booking id array': (r) => JSON.parse(r.body).some(b => b.bookingid === 137),
    });
}