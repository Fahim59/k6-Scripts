import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    stages: [
        { duration: '5s', target: 50 },   //5 sec e 50 user
        { duration: '10s', target: 50 }, //stay 10 sec with 50 user

        { duration: '10s', target: 100 },
        { duration: '20s', target: 100 },

        { duration: '15s', target: 150 },
        { duration: '30s', target: 150 },

        { duration: '20s', target: 200 },
        { duration: '40s', target: 200 },

        { duration: '5s', target: 0 },
      ]
}

export default function() {
    http.get('https://ecom-admin-nop.azurewebsites.net/login');
    sleep(1);
}