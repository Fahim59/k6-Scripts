import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 1000 },

        { duration: '30s', target: 0 },
      ]
}

export default function() {
    http.get('https://ecom-admin-nop.azurewebsites.net/login');
    sleep(1);
}