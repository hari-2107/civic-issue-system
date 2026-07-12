import { spawn } from 'child_process';
import path from 'path';

console.log('Spawning backend test server...');
const serverProcess = spawn('npx', ['tsx', 'src/index.ts'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '5000', DATABASE_FILE: 'test_civic.db' },
    shell: true
});

serverProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    console.log(`[Server] ${msg.trim()}`);
});

serverProcess.stderr.on('data', (data) => {
    console.error(`[Server Error] ${data.toString().trim()}`);
});

// Wait for server to start, then run tests
setTimeout(async () => {
    let failed = false;
    try {
        const baseUrl = 'https://civic-issue-system-gt2g.onrender.com/api';

        // 1. Health check
        console.log('\n--- Test 1: Health Check ---');
        const healthRes = await fetch(`${baseUrl}/health`);
        const healthData = await healthRes.json();
        console.log('Health check response:', healthData);
        if (healthData.status !== 'OK') throw new Error('Health check failed');

        // 2. Citizen Registration
        console.log('\n--- Test 2: Citizen Registration ---');
        const email = `test_citizen_${Date.now()}@example.com`;
        const regRes = await fetch(`${baseUrl}/auth/register-citizen`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Auto Verification Citizen',
                email,
                password: 'citizenPassword123',
                phone: '111-222-3333',
                address: 'Test Ward 9'
            })
        });
        const regData = await regRes.json();
        console.log('Register response status:', regRes.status);
        if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
        console.log('Register success. User ID:', regData.user.id);
        const citizenToken = regData.token;

        // 3. Citizen Login
        console.log('\n--- Test 3: Citizen Login ---');
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password: 'citizenPassword123'
            })
        });
        const loginData = await loginRes.json();
        console.log('Login status:', loginRes.status);
        if (loginRes.status !== 200) throw new Error('Citizen login failed');
        console.log('Citizen token acquired.');

        // 4. Fetch Categories
        console.log('\n--- Test 4: Fetch Categories ---');
        const catRes = await fetch(`${baseUrl}/categories`);
        const categories = await catRes.json();
        console.log(`Fetched ${categories.length} categories.`);
        const roadCat = categories.find(c => c.name === 'Road Damage');
        if (!roadCat) throw new Error('Road Damage category not found');

        // 5. Create Complaint
        console.log('\n--- Test 5: Create Complaint ---');
        const compRes = await fetch(`${baseUrl}/complaints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${citizenToken}`
            },
            body: JSON.stringify({
                title: 'Huge pothole on road',
                description: 'Vite test pothole is breaking car wheels on main street',
                category_id: roadCat.id,
                priority: 'High',
                address: '456 Main St',
                landmark: 'Near Shell Station',
                contact_number: '123-456-7890',
                latitude: 37.7749,
                longitude: -122.4194,
                state: 'Tamil Nadu',
                district: 'Chennai',
                taluk: 'Mylapore',
                revenue_division: 'South Chennai',
                firka: 'Mylapore',
                village_panchayat: 'Mylapore Ward 1',
                imageUrls: ['http://example.com/pothole.jpg']
            })
        });
        const complaint = await compRes.json();
        console.log('Create Complaint response status:', compRes.status);
        if (compRes.status !== 201) throw new Error('Complaint creation failed');
        console.log('Created Complaint ID:', complaint.id);

        // 6. Admin Login
        console.log('\n--- Test 6: Admin Login ---');
        const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@civic.gov',
                password: 'admin123' // default seeded admin
            })
        });
        const adminLoginData = await adminLoginRes.json();
        console.log('Admin login status:', adminLoginRes.status);
        if (adminLoginRes.status !== 200) throw new Error('Admin login failed');
        console.log('Admin token acquired.');
        const adminToken = adminLoginData.token;

        // 7. Admin View & Update complaint status to Assigned
        console.log('\n--- Test 7: Admin Assign Department ---');
        // Fetch departments
        const deptRes = await fetch(`${baseUrl}/departments`);
        const depts = await deptRes.json();
        const pwDept = depts.find(d => d.name.includes('Public Works'));
        const deptId = pwDept ? pwDept.id : depts[0].id;

        const assignRes = await fetch(`${baseUrl}/complaints/${complaint.id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                status: 'Assigned',
                departmentId: deptId,
                priority: 'Critical'
            })
        });
        const assignedResult = await assignRes.json();
        console.log('Admin assignment status:', assignRes.status);
        if (assignRes.status !== 200) throw new Error('Admin state transitions failed');
        console.log('Assigned complaint status:', assignedResult.status, 'assigned department:', assignedResult.department_name);

        // 8. Submit Feedback pre-resolution (Expected: ERROR status 400)
        console.log('\n--- Test 8: Submit Feedback Pre-Resolution (Succeeds if it FAILS) ---');
        const preFeedbackRes = await fetch(`${baseUrl}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${citizenToken}`
            },
            body: JSON.stringify({
                complaint_id: complaint.id,
                rating: 5,
                comment: 'Great work!'
            })
        });
        console.log('Feedback pre-resolution status (expecting 400):', preFeedbackRes.status);
        if (preFeedbackRes.status !== 400) throw new Error('Feedback was allowed on unresolved complaint');
        console.log('Successfully rejected pre-resolution feedback.');

        // 9. Admin Resolve Complaint
        console.log('\n--- Test 9: Admin Resolve Complaint ---');
        const resolveRes = await fetch(`${baseUrl}/complaints/${complaint.id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ status: 'Resolved' })
        });
        console.log('Resolve status:', resolveRes.status);
        if (resolveRes.status !== 200) throw new Error('Failed to resolve complaint');

        // 10. Submit Feedback post-resolution (Expected: SUCCESS status 201)
        console.log('\n--- Test 10: Submit Feedback Post-Resolution ---');
        const feedbackRes = await fetch(`${baseUrl}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${citizenToken}`
            },
            body: JSON.stringify({
                complaint_id: complaint.id,
                rating: 4,
                comment: 'Resolved quickly, thanks!'
            })
        });
        const feedbackData = await feedbackRes.json();
        console.log('Feedback post-resolution status (expecting 201):', feedbackRes.status);
        if (feedbackRes.status !== 201) throw new Error(`Feedback failed: ${JSON.stringify(feedbackData)}`);
        console.log('Feedback submitted. Rating:', feedbackData.rating);

        // 11. View Notifications
        console.log('\n--- Test 11: View Notifications ---');
        const notifRes = await fetch(`${baseUrl}/notifications`, {
            headers: { 'Authorization': `Bearer ${citizenToken}` }
        });
        const notifications = await notifRes.json();
        console.log(`Fetched ${notifications.length} notifications.`);
        notifications.forEach(n => console.log(`Notif: [${n.title}] - ${n.message}`));
        if (notifications.length < 3) throw new Error('Expected notifications (submit, assign, resolve) not present');

    } catch (err) {
        console.error('\n❌ Verification Failed! Error:', err.message);
        failed = true;
    } finally {
        console.log('\nTerminating test server...');
        serverProcess.kill('SIGTERM');
        process.exit(failed ? 1 : 0);
    }
}, 4000);
