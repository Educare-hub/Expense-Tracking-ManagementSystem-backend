import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY3LCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NjUyMzQ1ODMsImV4cCI6MTc2NTgzOTM4M30.3DxyNDYQdb17S_vlPODZG-rKQkKsylIEhpnYIvayXfw';

export const options = {
    vus: 57,           
    duration: '20s',  
};

export default function () {
    // GET all users
    const usersRes = http.get(`${BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    check(usersRes, { 'GET admin/users 200': (r) => r.status === 200 });

    // GET all expenses
    const expensesRes = http.get(`${BASE_URL}/api/expenses`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    check(expensesRes, { 'GET /expenses 200': (r) => r.status === 200 });

    // POST a new expense
    const expenseData = {
        user_id: 67, 
        amount: (Math.random() * 5000).toFixed(2),
        currency: 'KES',
        note: `Test expense note ${Math.floor(Math.random() * 10000)}`,
        is_recurring: false,
        expense_date: new Date().toISOString().split('T')[0], 
        receipt_url: null, 
        
    };

    const postRes = http.post(
        `${BASE_URL}/api/expenses`,
        JSON.stringify(expenseData),
        {
            headers: {
                Authorization: `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json',
            },
        }
    );

    check(postRes, { 'POST /expenses 201': (r) => r.status === 201 });

    sleep(1); 
}
