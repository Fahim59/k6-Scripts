import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// Load and parse CSV data
const users = new SharedArray('users', function () {
    return open('./users.csv')                   // Loads the CSV file as a string.
        .split('\n')                            // Splits the file into lines.
        .slice(1)                              // Skips the header row (first line).
        .filter(line => line.trim() !== '')   // Removes any empty lines.
        .map(line => {                       // Splits each line into username and password.
            const [username, password] = line.trim().split(',');
            return { username, password };
        });
});

export default function () {
    // Randomly picks one user from the loaded CSV for each iteration.
    const user = users[Math.floor(Math.random() * users.length)];

    // Sends a POST request to the authentication API.
    let res = http.post('https://restful-booker.herokuapp.com/auth', JSON.stringify({
        username: user.username,
        password: user.password,
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
        console.log(`✅ Token for ${user.username}: ${token}`);
    } 
    else {
        console.log(`❌ Login failed for ${user.username}`);
    }

    sleep(1);
}