import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,             // Number of concurrent users
  iterations: 10,     // Total number of requests = vus * iterations
};

export default function () {
  let response = http.get('https://restful-booker.herokuapp.com/booking');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}