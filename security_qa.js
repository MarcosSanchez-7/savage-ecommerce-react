const SUPABASE_URL = "https://cwlaqfjqgrtyhyscwpnq.supabase.co";
const ANON_KEY = "sb_publishable_GZGe0BUDYzuAEf_Yvtl4xQ_cohvbKD6";
const HEADERS = {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json'
};

async function testIntegrity() {
    console.log("\n🧪 TEST 1: Order Integrity (Negative Amount)");
    console.log("   Action: Attempting to force valid-looking order with amount -50000...");

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/order_requests`, {
            method: 'POST',
            headers: { ...HEADERS, 'Prefer': 'return=representation' },
            body: JSON.stringify({
                total_amount: -50000,
                delivery_cost: 0,
                status: 'Pendiente',
                items: [{ id: 1, name: "Test Item", quantity: 1, price: -50000 }], // Malicious item
                customer_info: { name: "QA Tester" }
            })
        });

        if (response.status === 201) {
            console.log(`❌ FAILED: Order created successfully! (Status 201). ID: ${(await response.json())[0]?.id}`);
        } else {
            const errorData = await response.json();
            console.log(`✅ PASSED: Blocked with Status ${response.status}.`);
            console.log(`   Reason: ${errorData.message || 'Constraint Violation'}`);
        }
    } catch (e) {
        console.log(`✅ PASSED: Request failed (${e.message})`);
    }
}

async function testRLS() {
    console.log("\n🧪 TEST 2: RLS Bypass (Orders & Store Config)");

    // Orders
    console.log("   Action: Fetching 'orders' table without admin session...");
    const ordersRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, { headers: HEADERS });
    const ordersData = await ordersRes.json();

    if (ordersRes.status === 403 || (Array.isArray(ordersData) && ordersData.length === 0)) {
        console.log(`✅ PASSED: Orders access denied or empty (Count: ${ordersData.length || 0}).`);
    } else {
        console.log(`❌ FAILED: Orders data accessed! (Count: ${ordersData.length})`);
    }

    // Store Config (Should be public but read-only)
    console.log("   Action: Fetching 'store_config'...");
    const configRes = await fetch(`${SUPABASE_URL}/rest/v1/store_config`, { headers: HEADERS });
    if (configRes.ok) {
        console.log(`ℹ️ INFO: Store config is public (Status ${configRes.status}). This is expected for UI text.`);
    } else {
        console.log(`ℹ️ INFO: Store config restricted (Status ${configRes.status}).`);
    }
}

async function testEditProtection() {
    console.log("\n🧪 TEST 3: Edit Verification (Negative Price Update)");
    // 1. Get a public product ID
    let pid = null;
    try {
        const list = await (await fetch(`${SUPABASE_URL}/rest/v1/products?limit=1`, { headers: HEADERS })).json();
        if (list.length) pid = list[0].id;
    } catch (e) { }

    if (!pid) {
        console.log("⚠️ SKIP: No public products found to test against.");
        return;
    }

    console.log(`   Target: Product ID ${pid}`);
    console.log("   Action: PATCH price = -100");

    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${pid}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({ price: -100 })
    });

    if (response.status === 401 || response.status === 403) {
        console.log(`✅ PASSED: Update blocked by RLS (Status ${response.status}). User is Anon.`);
    } else if (response.status >= 400) {
        console.log(`✅ PASSED: Update blocked by DB Check (Status ${response.status}).`);
    } else {
        // If 200/204, check if it actually changed
        // RLS might silently ignore updates if policy doesn't match
        console.log(`❓ CHECK: API returned ${response.status}. Verifying...`);
        const check = await (await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${pid}`, { headers: HEADERS })).json();
        if (check[0].price === -100) {
            console.log("❌ FAILED: Price successfully changed to -100!");
        } else {
            console.log("✅ PASSED: Price NOT changed (Silent RLS Rejection).");
        }
    }
}

async function runQA() {
    console.log("🛡️ STARTING SECURITY QA REPORT 🛡️");
    console.log("===================================");
    await testIntegrity();
    await testRLS();
    await testEditProtection();
    console.log("===================================");
    console.log("🏁 QA COMPLETED");
}

runQA();
