import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('Spawning backend test server...');
const serverProcess = spawn('npx', ['tsx', 'src/index.ts'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '5001', DATABASE_FILE: 'test_upload.db' },
    shell: true
});

serverProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    console.log(`[Server] ${msg.trim()}`);
});

serverProcess.stderr.on('data', (data) => {
    console.error(`[Server Error] ${data.toString().trim()}`);
});

// Wait for server to boot, then execute checks
setTimeout(async () => {
    let failed = false;
    try {
        const baseUrl = 'http://localhost:5001/api';

        // 1. Citizen Registration
        console.log('\n--- Registering Citizen ---');
        const email = `uploader_${Date.now()}@example.com`;
        const regRes = await fetch(`${baseUrl}/auth/register-citizen`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Photo Uploader Citizen',
                email,
                password: 'password123',
                phone: '555-555-5555',
                address: 'Test Sector 12'
            })
        });
        const regData = await regRes.json();
        if (regRes.status !== 201) throw new Error('Registration failed');
        const token = regData.token;

        // 2. Fetch Categories
        const catRes = await fetch(`${baseUrl}/categories`);
        const categories = await catRes.json();
        const roadCat = categories[0];

        // 3. Create Complaint with a Base64 attachment (small 1x1 simple PNG base64)
        console.log('\n--- Filing Complaint with 1x1 PNG Base64 Photo ---');
        const dummyBase64Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        const compRes = await fetch(`${baseUrl}/complaints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Water Leak with Photo',
                description: 'Puddle outside building with photo evidence',
                category_id: roadCat.id,
                priority: 'Medium',
                address: '777 Water St',
                latitude: 37.7749,
                longitude: -122.4194,
                imageUrls: [dummyBase64Png]
            })
        });
        const compData = await compRes.json();
        if (compRes.status !== 201) throw new Error('Failed to create complaint with photo');
        console.log('Filed complaint ID:', compData.id);

        // 4. Retrieve Complaint details and verify attachment paths
        console.log('\n--- Verifying Complaint details attachments output ---');
        const detailsRes = await fetch(`${baseUrl}/complaints/${compData.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const detailsData = await detailsRes.json();
        if (!detailsData.attachments || detailsData.attachments.length !== 1) {
            throw new Error(`Expected exactly 1 attachment, got: ${JSON.stringify(detailsData.attachments)}`);
        }

        const attachment = detailsData.attachments[0];
        console.log('Saved file path in database:', attachment.file_url);
        if (!attachment.file_url.startsWith('/uploads/')) {
            throw new Error(`Attachment url should start with /uploads/, got: ${attachment.file_url}`);
        }

        // 5. Verify file exists on disk
        const filename = attachment.file_url.replace('/uploads/', '');
        const diskPath = path.join(process.cwd(), 'uploads', filename);
        console.log('Checking physical file existence at:', diskPath);
        if (!fs.existsSync(diskPath)) {
            throw new Error(`Physical upload file not found on disk at ${diskPath}`);
        }
        console.log('✅ Physical file exists on disk!');

        // 6. Verify static file serving via HTTP request
        const staticUrl = `http://localhost:5001${attachment.file_url}`;
        console.log('Requesting statically served photo url:', staticUrl);
        const staticRes = await fetch(staticUrl);
        console.log('HTTP retrieval response status:', staticRes.status);
        if (staticRes.status !== 200) {
            throw new Error(`Statically served file got non-200 HTTP status: ${staticRes.status}`);
        }
        const imgBuffer = await staticRes.arrayBuffer();
        console.log(`Successfully fetched image buffer size: ${imgBuffer.byteLength} bytes.`);

        console.log('\n🌟 SUCCESS: All photo upload validations passed successfully!');

    } catch (err) {
        console.error('\n❌ Verification Failed! Error:', err.message);
        failed = true;
    } finally {
        console.log('\nTerminating test server...');
        serverProcess.kill('SIGTERM');
        process.exit(failed ? 1 : 0);
    }
}, 4000);
