const SUPABASE_URL = "https://cwlaqfjqgrtyhyscwpnq.supabase.co";
const ANON_KEY = "sb_publishable_GZGe0BUDYzuAEf_Yvtl4xQ_cohvbKD6";

async function testIdentityBypass() {
    console.log("\n--- TEST 1: Identity Bypass (POST Product) ---");
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
            method: 'POST',
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                name: "HACKED PRODUCT",
                price: 999999,
                description: "This should not exist",
                category: "HACK",
                stock_quantity: 100
            })
        });

        if (response.status === 401 || response.status === 403) {
            console.log(`✅ SUCCESS: Request blocked with status ${response.status}`);
        } else {
            const data = await response.json();
            console.log(`❌ FAILURE: Request allowed with status ${response.status}`);
            console.log("Response:", data);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

async function testNegativeAmount() {
    console.log("\n--- TEST 2: Negative Amount Injection (Order Request) ---");
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/order_requests`, {
            method: 'POST',
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                total_amount: -50000,
                delivery_cost: 0,
                status: 'Pendiente',
                items: [],
                customer_info: { name: "Hacker" }
            })
        });

        if (response.status >= 400) {
            const data = await response.json();
            console.log(`✅ SUCCESS: Request rejected with status ${response.status}`);
            console.log("Error details:", data);
        } else {
            console.log(`❌ FAILURE: Negative order accepted with status ${response.status}`);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

async function testDataExposure() {
    console.log("\n--- TEST 3: Sensitive Data Exposure (GET Orders) ---");
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
            method: 'GET',
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401 || response.status === 403) {
            console.log(`✅ SUCCESS: Access denied with status ${response.status}`);
        } else {
            const data = await response.json();
            if (Array.isArray(data) && data.length === 0) {
                console.log(`✅ SUCCESS: Returned empty array (RLS filtered).`);
            } else {
                console.log(`❌ FAILURE: Data leaked. Count: ${data.length}`);
            }
        }

        console.log("\n--- TEST 3.1: Sensitive Data Exposure (GET Store Config) ---");
        const configResponse = await fetch(`${SUPABASE_URL}/rest/v1/store_config`, {
            method: 'GET',
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const configData = await configResponse.json();
        // This might be public, but let's check what returns.
        console.log(`Store Config Status: ${configResponse.status}`);
        // console.log("Config Data (Sample):", configData); 

    } catch (e) {
        console.error("Error:", e.message);
    }
}

async function run() {
    await testIdentityBypass();
    await testNegativeAmount();
    await testDataExposure();
}

run();
