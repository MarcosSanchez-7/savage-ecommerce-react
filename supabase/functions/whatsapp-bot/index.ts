import { createClient } from "@supabase/supabase-js";

// ============================================================
// SAVAGE STORE - WhatsApp Bot (Supabase Edge Function)
// Webhook handler for WhatsApp Cloud API
// ============================================================

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- Configuration from Environment ---
const SUPABASE_URL = Deno.env.get("DB_URL") ?? "";
const SUPABASE_KEY = Deno.env.get("PRIVATE_KEY") ?? "";
const WA_VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") ?? "savage_verify_2026";
const WA_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN") ?? "";
const WA_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") ?? "https://www.savageeepy.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// TYPES
// ============================================================

interface BotSession {
    id: string;
    phone_number: string;
    state: "welcome" | "category_browse" | "human";
    current_category_id: string | null;
    last_message_at: string;
}

interface CategoryRow {
    id: string;
    name: string;
    parent_id: string | null;
}

interface ProductRow {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    slug: string;
    images: string[];
    is_offer: boolean;
    is_new: boolean;
    is_active: boolean;
}

// ============================================================
// WHATSAPP API HELPER
// ============================================================

async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
    const url = `https://graph.facebook.com/v21.0/${WA_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${WA_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "text",
            text: { body: body },
        }),
    });

    if (!response.ok) {
        const errData = await response.text();
        console.error("WhatsApp API Error:", errData);
    }
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================

async function getSession(phone: string): Promise<BotSession | null> {
    const { data, error } = await supabase
        .from("bot_sessions")
        .select("*")
        .eq("phone_number", phone)
        .single();

    if (error || !data) return null;
    return data as BotSession;
}

async function upsertSession(
    phone: string,
    state: string,
    categoryId: string | null = null
): Promise<void> {
    await supabase
        .from("bot_sessions")
        .upsert(
            {
                phone_number: phone,
                state: state,
                current_category_id: categoryId,
                last_message_at: new Date().toISOString(),
            },
            { onConflict: "phone_number" }
        );
}

// ============================================================
// DATA FETCHERS
// ============================================================

async function getRootCategories(): Promise<CategoryRow[]> {
    const { data, error } = await supabase
        .from("categories")
        .select("id, name, parent_id")
        .is("parent_id", null)
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }

    // Filter out orphan category
    return (data || []).filter(
        (c: CategoryRow) => !["HUÉRFANOS", "HUERFANOS"].includes(c.name.toUpperCase())
    );
}

async function getProductsByCategory(
    categoryId: string
): Promise<ProductRow[]> {
    // Get subcategory IDs too
    const { data: children } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", categoryId);

    const categoryIds = [categoryId, ...(children || []).map((c: { id: string }) => c.id)];

    const { data, error } = await supabase
        .from("products")
        .select("id, name, price, original_price, slug, images, is_offer, is_new, is_active")
        .eq("is_active", true)
        .in("category", categoryIds)
        .order("created_at", { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    return (data || []) as ProductRow[];
}

// ============================================================
// MESSAGE BUILDERS
// ============================================================

async function buildWelcomeMessage(): Promise<string> {
    const categories = await getRootCategories();

    let menu = `🏆 *SAVAGE STORE* 🏆\n`;
    menu += `━━━━━━━━━━━━━━━\n`;
    menu += `¡Hola! Bienvenido a *Savage*, tu tienda de camisetas premium ⚽🔥\n\n`;
    menu += `Elegí una categoría escribiendo el *número*:\n\n`;

    categories.forEach((cat, index) => {
        const emoji = getCategoryEmoji(cat.name);
        menu += `*${index + 1}.* ${emoji} ${cat.name}\n`;
    });

    menu += `\n*0.* 💬 Hablar con un asesor\n`;
    menu += `\n━━━━━━━━━━━━━━━\n`;
    menu += `🌐 Catálogo completo: ${FRONTEND_URL}`;

    return menu;
}

function getCategoryEmoji(name: string): string {
    const upper = name.toUpperCase();
    if (upper.includes("PLAYER")) return "⭐";
    if (upper.includes("FAN")) return "⚽";
    if (upper.includes("CALZADO") || upper.includes("ZAPATILLA")) return "👟";
    if (upper.includes("RETRO")) return "🏛️";
    if (upper.includes("SUBLIMADO")) return "🎨";
    if (upper.includes("RELOJ")) return "⌚";
    if (upper.includes("ACCESORIO")) return "🎒";
    return "🔹";
}

function buildProductListMessage(
    categoryName: string,
    products: ProductRow[]
): string {
    if (products.length === 0) {
        return `😅 No hay productos disponibles en *${categoryName}* en este momento.\n\nEscribí *menu* para volver al menú principal.`;
    }

    let msg = `⚽ *${categoryName}*\n`;
    msg += `━━━━━━━━━━━━━━━\n\n`;

    products.forEach((p, i) => {
        const numberEmoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"][i] || `${i + 1}.`;
        const priceFormatted = `Gs. ${Number(p.price).toLocaleString("es-PY")}`;

        msg += `${numberEmoji} *${p.name}*\n`;

        // Show offer price
        if (p.is_offer && p.original_price) {
            const originalFormatted = `Gs. ${Number(p.original_price).toLocaleString("es-PY")}`;
            const discount = Math.round(
                ((p.original_price - p.price) / p.original_price) * 100
            );
            msg += `💰 ~${originalFormatted}~ → *${priceFormatted}* (-${discount}%)\n`;
        } else {
            msg += `💰 ${priceFormatted}\n`;
        }

        if (p.is_new) msg += `🆕 ¡Recién llegado!\n`;

        const productSlug = p.slug || p.id;
        msg += `🔗 Ver: ${FRONTEND_URL}/product/${productSlug}\n\n`;
    });

    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `Escribí *menu* para volver al menú principal\n`;
    msg += `Escribí *0* para hablar con un asesor`;

    return msg;
}

function buildHumanHandoffMessage(): string {
    return (
        `💬 *Atención personalizada*\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `Un asesor de *Savage* te atenderá a la brevedad 🙌\n\n` +
        `⏰ Horario de atención:\n` +
        `Lunes a Sábado: 9:00 - 20:00\n\n` +
        `Mientras tanto, podés explorar nuestro catálogo:\n` +
        `🌐 ${FRONTEND_URL}\n\n` +
        `_Escribí *menu* en cualquier momento para volver al bot._`
    );
}

function buildInvalidOptionMessage(): string {
    return `❌ Opción no válida. Por favor, escribí un *número* del menú o *menu* para ver las opciones.`;
}

// ============================================================
// BOT LOGIC (State Machine)
// ============================================================

async function handleIncomingMessage(
    phone: string,
    messageText: string
): Promise<void> {
    const text = messageText.trim().toLowerCase();
    const session = await getSession(phone);

    // --- STATE: human (bypass) ---
    if (session?.state === "human") {
        // If user types "menu" or "bot", re-activate the bot
        if (text === "menu" || text === "bot") {
            await upsertSession(phone, "welcome");
            const welcomeMsg = await buildWelcomeMessage();
            await sendWhatsAppMessage(phone, welcomeMsg);
            return;
        }
        // Otherwise, ignore — let the human agent reply manually
        return;
    }

    // --- "menu" keyword always resets to welcome ---
    if (text === "menu" || text === "hola" || text === "inicio" || text === "hi" || text === "hello") {
        await upsertSession(phone, "welcome");
        const welcomeMsg = await buildWelcomeMessage();
        await sendWhatsAppMessage(phone, welcomeMsg);
        return;
    }

    // --- "0" → Human handoff ---
    if (text === "0") {
        await upsertSession(phone, "human");
        await sendWhatsAppMessage(phone, buildHumanHandoffMessage());
        return;
    }

    // --- STATE: welcome or no session (number selection) ---
    if (!session || session.state === "welcome") {
        const num = parseInt(text);

        if (isNaN(num) || num < 0) {
            // First contact or invalid: show welcome
            await upsertSession(phone, "welcome");
            const welcomeMsg = await buildWelcomeMessage();
            await sendWhatsAppMessage(phone, welcomeMsg);
            return;
        }

        if (num === 0) {
            await upsertSession(phone, "human");
            await sendWhatsAppMessage(phone, buildHumanHandoffMessage());
            return;
        }

        // Category selection
        const categories = await getRootCategories();
        const selectedIndex = num - 1;

        if (selectedIndex < 0 || selectedIndex >= categories.length) {
            await sendWhatsAppMessage(phone, buildInvalidOptionMessage());
            return;
        }

        const selectedCategory = categories[selectedIndex];
        await upsertSession(phone, "category_browse", selectedCategory.id);

        const products = await getProductsByCategory(selectedCategory.id);
        const productMsg = buildProductListMessage(
            selectedCategory.name,
            products
        );
        await sendWhatsAppMessage(phone, productMsg);
        return;
    }

    // --- STATE: category_browse (browsing products) ---
    if (session.state === "category_browse") {
        const num = parseInt(text);

        if (!isNaN(num) && num > 0) {
            // User typed a number → treat as category selection
            const categories = await getRootCategories();
            const selectedIndex = num - 1;

            if (selectedIndex >= 0 && selectedIndex < categories.length) {
                const selectedCategory = categories[selectedIndex];
                await upsertSession(phone, "category_browse", selectedCategory.id);

                const products = await getProductsByCategory(selectedCategory.id);
                const productMsg = buildProductListMessage(
                    selectedCategory.name,
                    products
                );
                await sendWhatsAppMessage(phone, productMsg);
                return;
            }
        }

        // Invalid input while browsing → show menu hint
        await sendWhatsAppMessage(
            phone,
            buildInvalidOptionMessage()
        );
        return;
    }

    // --- Fallback: show welcome ---
    await upsertSession(phone, "welcome");
    const welcomeMsg = await buildWelcomeMessage();
    await sendWhatsAppMessage(phone, welcomeMsg);
}

// ============================================================
// MAIN HANDLER (Deno.serve)
// ============================================================

Deno.serve(async (req: Request) => {
    // --- CORS Preflight ---
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    // --- GET: Webhook Verification (Meta sends this on setup) ---
    if (req.method === "GET") {
        const url = new URL(req.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        if (mode === "subscribe" && token === WA_VERIFY_TOKEN) {
            console.log("✅ Webhook verified successfully");
            return new Response(challenge || "", {
                status: 200,
                headers: { "Content-Type": "text/plain" },
            });
        }

        return new Response("Forbidden", { status: 403 });
    }

    // --- POST: Incoming Webhook Events ---
    if (req.method === "POST") {
        try {
            const body = await req.json();

            // WhatsApp Cloud API structure
            const entry = body?.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;

            // Ignore status updates (delivered, read, etc.)
            if (!value?.messages || value.messages.length === 0) {
                return new Response(JSON.stringify({ status: "no_messages" }), {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            // Process each incoming message
            for (const message of value.messages) {
                // Only handle text messages for now
                if (message.type !== "text") {
                    const phone = message.from;
                    await sendWhatsAppMessage(
                        phone,
                        "🤖 Por ahora solo puedo leer mensajes de *texto*. Escribí *menu* para ver las opciones."
                    );
                    continue;
                }

                const phone = message.from; // e.g. "595981234567"
                const text = message.text?.body || "";

                console.log(`📩 Message from ${phone}: "${text}"`);

                await handleIncomingMessage(phone, text);
            }

            return new Response(JSON.stringify({ status: "processed" }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("❌ Webhook Error:", (error as Error).message);
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
