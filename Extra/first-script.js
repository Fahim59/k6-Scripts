import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    //vus: 100,
    //duration: '10s',
    iterations: 10
}

export default function() {
    http.get('https://test.k6.io');
    sleep(1);
}