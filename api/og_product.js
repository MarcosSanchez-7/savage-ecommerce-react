import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const { slug } = req.query;

    // Configuration via Env Vars or Hardcoded Fallback
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cwlaqfjqgrtyhyscwpnq.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bGFxZmpxZ3J0eWh5c2N3cG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMDM3NTcsImV4cCI6MjA4MTY3OTc1N30.qt20ysweHhOMO81o6snFuBf3z5QDL-M1E0jN-ifQC4I';

    // Default metadata using Production Domain
    let title = 'SAVAGE STORE | Camisetas de Fútbol Premium';
    let description = 'Las mejores camisetas de fútbol en Paraguay: Retro, internacionales y ediciones especiales.';
    let image = 'https://www.savageeepy.com/crown.png';
    const siteUrl = 'https://www.savageeepy.com';
    let currentUrl = `${siteUrl}/product/${slug}`;

    // Redirect to home if no slug
    if (!slug) {
        return res.redirect(307, '/');
    }

    try {
        // Direct Supabase REST call to avoid dependency issues or heavy client init if not needed
        // but using supabase-js checks connection better usually. Let's use fetch for speed/lightness like before.

        // 1. Try finding by Slug
        const params = new URLSearchParams({
            slug: `eq.${slug}`,
            select: 'name,description,images,id'
        });

        let response = await fetch(`${supabaseUrl}/rest/v1/products?${params}`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        let data = await response.json();
        let product = null;

        if (data && data.length > 0) {
            product = data[0];
        } else {
            // 2. Fallback: Try ID (if slug was actually an ID)
            const idParams = new URLSearchParams({
                id: `eq.${slug}`,
                select: 'name,description,images,id'
            });
            const res2 = await fetch(`${supabaseUrl}/rest/v1/products?${idParams}`, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                }
            });
            const data2 = await res2.json();
            if (data2 && data2.length > 0) {
                product = data2[0];
            }
        }

        if (product) {
            title = `${product.name} | Savage Store`;
            if (product.description) {
                // Strip HTML tags if any and truncate
                const cleanDesc = product.description.replace(/<[^>]*>?/gm, '');
                description = cleanDesc.replace(/\s+/g, ' ').substring(0, 160) + '...';
            }
            if (product.images && product.images.length > 0) {
                if (typeof product.images[0] === 'string') {
                    image = product.images[0];
                }
            }
        }

    } catch (error) {
        console.error('OG API Error:', error);
        // Continue with default metadata on error
    }

    // Generate HTML with Open Graph Tags
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="product">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="${currentUrl}">
    <meta property="og:site_name" content="Savage Store">
    
    <!-- WhatsApp specific hint for image size -->
    <meta property="og:image:width" content="800">
    <meta property="og:image:height" content="800">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
</head>
<body>
    <h1>${title}</h1>
    <img src="${image}" alt="${title}" style="max-width: 600px;" />
    <p>${description}</p>
    <script>window.location.href = "${currentUrl}";</script>
</body>
</html>`;

    res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
}
