import http from 'k6/http';
import { check, sleep, fail } from 'k6';

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
        fail('❌ Booking creation failed. Stopping iteration.');
    }

    console.log(`✅ Created booking with ID: ${bookingId}`);

    // Step 2: Fetch the created booking
    const fetchRes = http.get(`https://restful-booker.herokuapp.com/booking/${bookingId}`);

    const userCheck = check(fetchRes, {
        '✅ Fetch booking success (200)': (r) => r.status === 200,
    });

    if (userCheck) {
        const bookingData = fetchRes.json();
        console.log(`✅ Booking ID: ${bookingId}, Name: ${bookingData.firstname} ${bookingData.lastname}`);
    } 
    else {
        fail('❌ Failed to fetch booking. Stopping iteration.');
    }

    sleep(1);
}