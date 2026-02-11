const SUPABASE_URL = "https://cwlaqfjqgrtyhyscwpnq.supabase.co";
const ANON_KEY = "sb_publishable_GZGe0BUDYzuAEf_Yvtl4xQ_cohvbKD6";
const TARGET_ID = "989c4d0b-9994-4fef-bb66-2154c38ceff8";

async function verify() {
    console.log("Verifying Product Name...");
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${TARGET_ID}`, {
        headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
    });
    const data = await response.json();
    if (data.length > 0) {
        console.log(`Product Name: "${data[0].name}"`);
        if (data[0].name === "HACKED_NAME_TEST") {
            console.log("🚨 CONFIRMED: Product was successfully hacked via PATCH.");
        } else {
            console.log("✅ FALSE POSITIVE: Product name was NOT changed.");
        }
    }
}
verify();
