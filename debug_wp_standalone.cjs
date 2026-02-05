
const https = require('https');
const fs = require('fs');

const TOKEN = 'v8Cb3LsCIPHijbPsBepZPsjBTHtQNdKNLT1t1Zt6LOZjGMy9UDiSZc7IZzfDCvpf';
const SITE = 'casadozander.wordpress.com';
const SITE_ID = '3718127';
const TEST_FILE = '/Users/zander/Library/CloudStorage/GoogleDrive-zander.cattapreta@zedicoes.com/My Drive/_ programação/_ smartwrite_publisher/_ test files/LOTE/20_The-Loop.md';

function request(method, url, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Accept': 'application/json',
                ...headers
            }
        };

        if (body) {
            options.headers['Content-Type'] = 'application/json';
        }

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', (e) => reject(e));
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log(`--- Testing WordPress.com Connectivity ---`);
    console.log(`Site: ${SITE} (ID: ${SITE_ID})`);
    console.log(`Token: ${TOKEN.substring(0, 5)}...`);

    const authHeader = { 'Authorization': `Bearer ${TOKEN}` };

    // Test 1: getMe on public-api v2
    console.log('\n[Test 1] GET /wp/v2/sites/{site}/users/me (Bearer)');
    const t1 = await request('GET', `https://public-api.wordpress.com/wp/v2/sites/${SITE}/users/me`, authHeader);
    console.log(`Status: ${t1.status}`);
    console.log(`Body: ${t1.body.substring(0, 200)}`);

    // Test 2: getMe on rest/v1.1/me
    console.log('\n[Test 2] GET /rest/v1.1/me (Bearer)');
    const t2 = await request('GET', `https://public-api.wordpress.com/rest/v1.1/me`, authHeader);
    console.log(`Status: ${t2.status}`);
    console.log(`Body: ${t2.body.substring(0, 200)}`);

    // Test 3: getMe check site details
    console.log('\n[Test 3] GET /rest/v1.1/sites/{site} (No Auth)');
    const t3 = await request('GET', `https://public-api.wordpress.com/rest/v1.1/sites/${SITE}`);
    console.log(`Status: ${t3.status}`);
    // console.log(`Body: ${t3.body}`);

    // Test 4: createPost on public-api v2
    console.log('\n[Test 4] POST /wp/v2/sites/{site}/posts (Bearer)');
    const content = fs.readFileSync(TEST_FILE, 'utf-8');
    const postData = {
        title: 'Test Post from Script - The Loop',
        content: `<!-- wp:paragraph -->\n<p>${content.substring(0, 200)}...</p>\n<!-- /wp:paragraph -->`,
        status: 'draft'
    };
    const t4 = await request('POST', `https://public-api.wordpress.com/wp/v2/sites/${SITE}/posts`, authHeader, postData);
    console.log(`Status: ${t4.status}`);
    console.log(`Body: ${t4.body.substring(0, 400)}`);

    if (t4.status >= 400) {
        console.log('\n--- Retrying with rest/v1.1/sites/{site}/posts/new ---');
        const t4b = await request('POST', `https://public-api.wordpress.com/rest/v1.1/sites/${SITE}/posts/new`, authHeader, postData);
        console.log(`Status: ${t4b.status}`);
        console.log(`Body: ${t4b.body.substring(0, 400)}`);
    }
}

runTests().catch(console.error);
