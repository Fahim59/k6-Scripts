import http from 'k6/http';

export const options = {
    scenarios: {
        constant_load: {
            executor: 'constant-vus',
            vus: 10,
            duration: '30s',
        },
        ramping_load: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 10 },
                { duration: '20s', target: 20 },
                { duration: '10s', target: 0 },
            ],
            startTime: '35s',
        },
    },
};

export default function () {
    http.get('https://restful-booker.herokuapp.com/booking');
}