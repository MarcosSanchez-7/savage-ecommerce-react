const SUPABASE_URL = "https://cwlaqfjqgrtyhyscwpnq.supabase.co";
const ANON_KEY = "sb_publishable_GZGe0BUDYzuAEf_Yvtl4xQ_cohvbKD6";

async function testIDSpoofing() {
    console.log("\n--- TEST 4: ID Spoofing (Leaked UID Bypass - Refined) ---");
    // 1. Fetch a valid product ID to test against
    let targetId = null;
    try {
        const listResp = await fetch(`${SUPABASE_URL}/rest/v1/products?limit=1`, {
            headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
        });
        const list = await listResp.json();
        if (list.length > 0) targetId = list[0].id;
    } catch (e) { }

    if (!targetId) {
        console.log("⚠️ SKIPPED: Could not fetch a public product to test update against.");
        return;
    }

    // 2. Try to update it with spoofed headers
    console.log(`Targeting Product ID: ${targetId}`);

    // Some headers that bad proxies sometimes respect, but Supabase (GoTrue) should ignore.
    const fakeAdminUUID = "00000000-0000-0000-0000-000000000000";

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${targetId}`, {
            method: 'PATCH',
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation', // ask for response to verify
                'X-User-Id': fakeAdminUUID,
                'X-Hasura-User-Id': fakeAdminUUID,
                // 'role': 'service_role' // This would be ignored by Supabase without the secret key
            },
            body: JSON.stringify({
                name: "HACKED_NAME_TEST" // harmless change if it works, we should revert or it shouldn't work
            })
        });

        if (response.status === 401 || response.status === 403) {
            console.log(`✅ SUCCESS: Spoofing attempt blocked. Status: ${response.status}`);
        } else {
            console.log(`❌ FAILURE: Spoofing attempt returned status ${response.status}`);
            if (response.status === 200 || response.status === 204) {
                console.log("CRITICAL: The update appears to have succeeded!");
            }
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

async function run() {
    // Only run the spoof test again since others passed
    await testIDSpoofing();
}

run();
