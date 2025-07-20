import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 3,
    iterations: 6,
};

export default function () {
    let res = http.get('https://postman-echo.com/get?foo1=bar1&foo2=bar2');

    let isJSON = res.headers['Content-Type']?.includes('application/json');
    let responseBody = isJSON ? JSON.parse(res.body) : {};

    let isPassed = check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
        'Content-Type is JSON': () => isJSON,
        'args include foo1=bar1': () => responseBody.args.foo1 === 'bar1',
        'args include foo2=bar2': () => responseBody.args.foo2 === 'bar2',
    });

    if (!isPassed) {
        console.error(`❌ One or more checks failed for ${res.url}`);
        console.error(`Response body: ${res.body}`);
    } else {
        console.log('✅ All checks passed for this response');
    }

    sleep(1);
}