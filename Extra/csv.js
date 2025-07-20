import { SharedArray } from 'k6/data';

// Load and parse CSV data
const users = new SharedArray('users', function () {
    return open('./users.csv')  // no import needed for open()
        .split('\n')
        .slice(1)  // skip header
        .filter(line => line.trim() !== '')
        .map(line => {
            const [username, password] = line.trim().split(',');
            return { username, password };
        });
});

// Print all users during initialization
users.forEach(user => {
    console.log(`Username: ${user.username}, Password: ${user.password}`);
});

export default function () {
    // Nothing to do in default
}
