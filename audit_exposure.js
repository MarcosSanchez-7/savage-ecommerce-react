const SUPABASE_URL = "https://cwlaqfjqgrtyhyscwpnq.supabase.co";
const ANON_KEY = "sb_publishable_GZGe0BUDYzuAEf_Yvtl4xQ_cohvbKD6";

async function testConfigExposure() {
    console.log("\n--- TEST 1: Configuration Exposure (Sniffing) ---");
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/store_config?select=*`, {
            method: 'GET',
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const sensitiveKeys = ['secret', 'key', 'token', 'password', 'private'];
            let foundSensitive = false;

            data.forEach(item => {
                const key = item.key.toLowerCase();
                const value = JSON.stringify(item.value).toLowerCase();

                // Allow specific safe keys (like 'navbar_links', 'hero_slides')
                if (sensitiveKeys.some(sk => key.includes(sk) || value.includes(sk))) {
                    // Filter out known safe instances like "anon_key" in env vars (not here usually)
                    // But here we check store_config specifically.
                    // If 'value' contains a long random string, it might be a token.
                    console.warn(`WARNING: Potential sensitive data found in key: ${item.key}`);
                    try {
                        console.log(`Value preview: ${JSON.stringify(item.value).substring(0, 50)}...`);
                    } catch (e) { }
                    foundSensitive = true;
                }
            });

            if (!foundSensitive) {
                console.log("✅ SUCCESS: No obvious sensitive keywords found in store_config.");
            } else {
                console.log("⚠️ WARNING: Manual review required for identified items.");
            }
        } else {
            console.log(`Error accessing store_config: ${response.status}`);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

async function testSchemaEnumeration() {
    console.log("\n--- TEST 2: Schema Enumeration (Introspection) ---");
    try {
        const tables = ['information_schema/tables', 'pg_catalog/pg_tables'];
        for (const table of tables) {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
                method: 'GET',
                headers: {
                    'apikey': ANON_KEY,
                    'Authorization': `Bearer ${ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 404) {
                console.log(`✅ SUCCESS: ${table} not found (API route likely disabled or hidden).`);
            } else if (response.status === 401 || response.status === 403) {
                console.log(`✅ SUCCESS: Access denied to ${table}.`);
            } else {
                console.log(`❌ FAILURE: Accessible ${table} with status ${response.status}`);
            }
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

async function testIDSpoofing() {
    console.log("\n--- TEST 4: ID Spoofing (Leaked UID Bypass) ---");
    // Simulate a request where we pretend to be an admin by just sending their ID in a header or body.
    // Real RLS checks JWT (auth.uid()), not user input.
    const fakeAdminUUID = "00000000-0000-0000-0000-000000000000"; // Typical zero UUID often used for system

    try {
        // Try to update a product (requires admin)
        // We'll try to update product with ID 1 (or any existing ID logic)
        // Since we don't know a valid ID easily without fetching, let's try to fetch one first publicly?
        // Actually, we just want to see if write access is granted.

        // Let's rely on the previous pen_test result that showed 401 for unauthorized write.
        // Here we add the spoofing headers.

        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.1`, {
            method: 'PATCH',
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`, // Valid Anon Token (User is "Introvert/Public")
                'Content-Type': 'application/json',
                'Prefer': 'return=representation',
                // SPOOFING ATTEMPTS
                'X-User-Id': fakeAdminUUID,
                'X-Hasura-User-Id': fakeAdminUUID,
                'role': 'service_role'
            },
            body: JSON.stringify({
                name: "HACKED_BY_SPOOF"
            })
        });

        if (response.status === 401 || response.status === 403) {
            console.log(`✅ SUCCESS: Spoofing attempt blocked. Status: ${response.status}`);
        } else {
            console.log(`❌ FAILURE: Spoofing attempt accepted! Status: ${response.status}`);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

async function run() {
    await testConfigExposure();
    await testSchemaEnumeration();
    await testIDSpoofing();
}

run();
