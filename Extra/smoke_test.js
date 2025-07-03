import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 1,
    duration: '10s'
}

export default function() {
    http.get('https://ecom-admin-nop.azurewebsites.net/login');
    sleep(1);
}