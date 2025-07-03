import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 1,
    duration: '1s',
}

export default function () {
  const loginUrl = 'https://ustx000248.florafirebackdev.com/connect/token';
  
  const payload = JSON.stringify({
    grant_type: 'password',
    username: 'testmustafizur+5001@gmail.com',
    password: '11!!qqQQ',
    client_id: 'ClientPortal_App',
    scope: 'offline_access ClientPortal'
  });

  //Header parameter
  const params = {
    headers:{
        'Content-Type': 'application/x-www-form-urlencoded',
        '__tenant': 'Default'
    },
    timeout: '120s',
  };

  const response = http.post(loginUrl, payload, params);
    check(response, {
        'tenant request success': (r) => r.status === 200,
        'is res body has token_type': (r) => r.body.includes('Bearer')
    });
}