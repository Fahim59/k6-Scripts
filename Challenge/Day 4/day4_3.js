import http from 'k6/http';
import { check } from 'k6';

export default function () {
    try {
        let res = http.get('https://restful-booker.herokuapp.com/booking');

        check(res, {
            'status is 200': (r) => r.status === 200,
        });

        let data = JSON.parse(res.body);

        if (data.length > 0) {
            console.log(`First Booking ID: ${data[0].bookingid}`);
        } 
        else {
            console.log('No bookings found');
        }

    } 
    catch (err) {
        console.error(`❌ Error occurred: ${err.message}`);
    }
}