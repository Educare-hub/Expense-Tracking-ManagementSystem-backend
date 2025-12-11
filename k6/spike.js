import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8081';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY3LCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NjUyMzQ1ODMsImV4cCI6MTc2NTgzOTM4M30.3DxyNDYQdb17S_vlPODZG-rKQkKsylIEhpnYIvayXfw';

export const options = {
    stages: [
        { duration: '5s', target: 10 },
        { duration: '3s', target: 200 },  // this is how my spike workload look like
        { duration: '5s', target: 200 },
        { duration: '5s', target: 0 }
    ]
};

export default function () {
    const headers = { Authorization: `Bearer ${TOKEN}` };

    let r1 = http.get(`${BASE_URL}/api/admin/users`, { headers });
    check(r1, { 'GET admin/users 200': (r) => r.status === 200 });

    let r2 = http.get(`${BASE_URL}/api/expenses`, { headers });
    check(r2, { 'GET expenses 200': (r) => r.status === 200 });

    let expense = {
        user_id: 67,
        amount: "100.00",
        currency: "KES",
        note: "Spike test",
        is_recurring: false,
        expense_date: new Date().toISOString().split("T")[0]
    };

    let r3 = http.post(`${BASE_URL}/api/expenses`, JSON.stringify(expense), {
        headers: { ...headers, 'Content-Type': 'application/json' }
    });
    check(r3, { 'POST expense 201': (r) => r.status === 201 });

    sleep(1);
}
