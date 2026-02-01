import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'edge', // Esto lo hace ultra rápido en Vercel
};

export default async function handler() {
    const supabase = createClient(
        process.env.VITE_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Traemos los productos de tu tabla 'products'
    const { data: products, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const baseUrl = "https://savage-ecommerce-react.vercel.app";

    let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Savage Essence Catalog</title>
    <link>${baseUrl}</link>
    <description>Catálogo automático Savage Essence</description>`;

    products?.forEach((p) => {
        const availability = p.stock_quantity > 0 ? 'in stock' : 'out of stock';

        xml += `
    <item>
      <g:id>${p.id}</g:id>
      <g:title><![CDATA[${p.name}]]></g:title>
      <g:description><![CDATA[${p.description || 'Streetwear Premium'}]]></g:description>
      <g:link>${baseUrl}/product/${p.slug || p.id}</g:link>
      <g:image_link>${p.images?.[0] || ''}</g:image_link>
      <g:brand>Savage</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${p.price} PYG</g:price>
    </item>`;
    });

    xml += `</channel></rss>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate', // Cache de 1 hora
        },
    });
}