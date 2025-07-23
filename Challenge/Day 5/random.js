import http from 'k6/http';
import { check, sleep } from 'k6';

// Helper to create random email
function randomEmail() {
    return `user${Math.floor(Math.random() * 10000)}@test.com`;
}
// Helper to generate password
function randomPassword(length = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}


export default function () {

    // Sends a POST request to the authentication API.
    let res = http.post('https://restful-booker.herokuapp.com/auth', JSON.stringify({
        username: randomEmail(),
        password: randomPassword(),
    }),

    { headers: { 'Content-Type': 'application/json' },});

    // Asserts that the login API returns HTTP 200 (successful login).
    check(res, { 
        'login status is 200': (r) => r.status === 200 
    });

    //Parses the token from the JSON response and logs success or failure per user.
    let token;
    const json = res.json();
    token = json.token;

    if (res.status === 200) {
        console.log(`✅ Token for ${randomEmail()}: ${token}`);
    } 
    else {
        console.log(`❌ Login failed for ${randomEmail()}`);
    }

    sleep(1);
}