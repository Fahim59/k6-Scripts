import http from 'k6/http';
import { sleep } from 'k6';
import {check} from 'k6';

export const options = {
    vus: 10,
    duration: '10s',

    thresholds: {                                                                                       //Thresholds
        http_req_duration: ['p(95) < 1000'], //1s
        http_req_failed: ['rate < 0.01'],  //1%

        http_reqs: ['count > 20'],
        http_reqs: ['rate > 3.5'],
        vus: ['value > 5'],

    }
}

export default function() {
    const response = http.get('https://ecom-admin-nop.azurewebsites.net/login');

    //console.log(response.status);
    //console.log(response.body);

    // check (true, {
    //     'true is true': (value) => value === true
    // });

    check (response, {                                                                                 //Validating Response
        'status is 200': (res) => res.status === 200,  //equal to
        'page is startpage': (res) => res.body.includes('RememberMe')  //contains
    });
    sleep(2);
}