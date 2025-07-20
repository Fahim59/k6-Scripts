import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
    // Step 1: Create a booking
    const createPayload = JSON.stringify({
        "firstname": "Jim",
        "lastname": "Brown",
        "totalprice": 111,
        "depositpaid": true,
        "bookingdates": {
            "checkin": "2018-01-01",
            "checkout": "2019-01-01"
        },
        "additionalneeds": "Breakfast"
    });

    const createRes = http.post('https://restful-booker.herokuapp.com/booking', createPayload, {
        headers: { 'Content-Type': 'application/json' }
    });

    check(createRes, {
        '✅ Booking created (201)': (r) => r.status === 201,
    });

    const createdUser = createRes.json();
    const bookingId = createdUser.bookingid;

    if (!bookingId) {
        console.error('❌ Booking ID not found in response');
        return;
    }

    console.log(`✅ Created booking with ID: ${bookingId}`);

    // Step 2: Fetch the created booking
    const fetchRes = http.get(`https://restful-booker.herokuapp.com/booking/${bookingId}`);

    check(fetchRes, {
        '✅ Fetch booking success (200)': (r) => r.status === 200,
    });

    if (fetchRes.status === 200) {
        console.log(`✅ Successfully fetched booking ID: ${bookingId}`);
    } else {
        console.error(`❌ Failed to fetch booking ID: ${bookingId}`);
    }

    sleep(1);
}