import { createClient } from "@supabase/supabase-js";

// ============================================================
// SAVAGE STORE - Social Redirect (Instagram / TikTok DM Auto-Reply)
// Responds to DMs with a redirect to WhatsApp + Website
// ============================================================

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("DB_URL") ?? "";
const SUPABASE_KEY = Deno.env.get("PRIVATE_KEY") ?? "";
const IG_ACCESS_TOKEN = Deno.env.get("INSTAGRAM_ACCESS_TOKEN") ?? "";
const WHATSAPP_LINK = Deno.env.get("WHATSAPP_LINK") ?? "https://wa.me/595XXXXXXXXX";
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") ?? "https://www.savageeepy.com";
const IG_VERIFY_TOKEN = Deno.env.get("INSTAGRAM_VERIFY_TOKEN") ?? "savage_ig_verify_2026";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// INSTAGRAM MESSAGING API HELPER
// ============================================================

async function sendInstagramDM(recipientId: string, message: string): Promise<void> {
    const url = `https://graph.facebook.com/v21.0/me/messages`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${IG_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: message },
        }),
    });

    if (!response.ok) {
        const errData = await response.text();
        console.error("Instagram API Error:", errData);
    }
}

// ============================================================
// RATE LIMITER (avoid spamming the same user)
// ============================================================

async function shouldReply(senderId: string): Promise<boolean> {
    // Check if we already replied to this user in the last 24 hours
    const { data } = await supabase
        .from("bot_sessions")
        .select("last_message_at")
        .eq("phone_number", `ig_${senderId}`)
        .single();

    if (data) {
        const lastMsg = new Date(data.last_message_at);
        const now = new Date();
        const hoursSinceLastReply = (now.getTime() - lastMsg.getTime()) / (1000 * 60 * 60);

        // Only reply once every 24 hours per user
        if (hoursSinceLastReply < 24) {
            console.log(`⏳ Skipping reply to ${senderId} (replied ${hoursSinceLastReply.toFixed(1)}h ago)`);
            return false;
        }
    }

    // Record this reply
    await supabase
        .from("bot_sessions")
        .upsert(
            {
                phone_number: `ig_${senderId}`,
                state: "welcome",
                last_message_at: new Date().toISOString(),
            },
            { onConflict: "phone_number" }
        );

    return true;
}

// ============================================================
// MESSAGE BUILDER
// ============================================================

function buildRedirectMessage(): string {
    return (
        `¡Hola! 👋 Gracias por escribirnos a *Savage Store* 🏆\n\n` +
        `Para brindarte una atención más rápida y personalizada, ` +
        `te invitamos a contactarnos por WhatsApp:\n\n` +
        `📱 ${WHATSAPP_LINK}\n\n` +
        `Ahí podrás:\n` +
        `✅ Consultar disponibilidad y tallas\n` +
        `✅ Hacer tu pedido al instante\n` +
        `✅ Recibir asesoría personalizada\n\n` +
        `También podés explorar todo nuestro catálogo en:\n` +
        `🌐 ${FRONTEND_URL}\n\n` +
        `¡Te esperamos! ⚽🔥`
    );
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req: Request) => {
    // --- CORS ---
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    // --- GET: Webhook Verification (Instagram / Meta) ---
    if (req.method === "GET") {
        const url = new URL(req.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        if (mode === "subscribe" && token === IG_VERIFY_TOKEN) {
            console.log("✅ Instagram Webhook verified");
            return new Response(challenge || "", {
                status: 200,
                headers: { "Content-Type": "text/plain" },
            });
        }

        return new Response("Forbidden", { status: 403 });
    }

    // --- POST: Incoming DM Webhook ---
    if (req.method === "POST") {
        try {
            const body = await req.json();

            // Instagram Messaging Webhook structure
            const entry = body?.entry?.[0];

            if (!entry?.messaging) {
                return new Response(JSON.stringify({ status: "no_messaging" }), {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            for (const event of entry.messaging) {
                // Only handle message events (not reads, deliveries, etc.)
                if (!event.message) continue;

                const senderId = event.sender?.id;
                if (!senderId) continue;

                // Don't reply to echoes (messages sent BY us)
                if (event.message.is_echo) continue;

                console.log(`📩 Instagram DM from ${senderId}: "${event.message.text || "[media]"}"`);

                // Rate limit: only reply once every 24h
                const shouldSend = await shouldReply(senderId);
                if (!shouldSend) continue;

                await sendInstagramDM(senderId, buildRedirectMessage());
                console.log(`✅ Redirect message sent to ${senderId}`);
            }

            return new Response(JSON.stringify({ status: "processed" }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("❌ Social Redirect Error:", (error as Error).message);
            return new Response(
                JSON.stringify({ error: (error as Error).message }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }
    }

    return new Response("Method not allowed", { status: 405 });
});
