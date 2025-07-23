import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 1 },
    { duration: '30s', target: 2 },
    { duration: '30s', target: 3 },
  ],
};

export default function () {
    let loginRes = http.post('https://restful-booker.herokuapp.com/auth', JSON.stringify({
        username: 'admin',
        password: 'password123',
    }), 
    { 
      headers: { 'Content-Type': 'application/json' } 
    });

    check(loginRes, 
      { 'login status 200': (r) => r.status === 200 },
    );
}