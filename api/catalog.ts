import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'edge',
};

export default async function handler() {
    try {
        // 1. Verificamos que las variables existan
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return new Response(
                JSON.stringify({ error: "Faltan variables de entorno en Vercel" }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 2. Consulta a la tabla 'products'
        const { data: products, error } = await supabase
            .from('products')
            .select('*');

        if (error) throw error;

        const baseUrl = "https://savageeeepy.vercel.app"; // URL actualizada según tu captura

        let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Savage Essence Catalog</title>
    <link>${baseUrl}</link>
    <description>Catálogo automático Savage Essence</description>`;

        products?.forEach((p) => {
            const availability = p.stock_quantity > 0 ? 'in stock' : 'out of stock';
            const image = Array.isArray(p.images) ? p.images[0] : '';

            xml += `
    <item>
      <g:id>${p.id}</g:id>
      <g:title><![CDATA[${p.name}]]></g:title>
      <g:description><![CDATA[${p.description || 'Streetwear Premium'}]]></g:description>
      <g:link>${baseUrl}/product/${p.slug || p.id}</g:link>
      <g:image_link>${image}</g:image_link>
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
                'Cache-Control': 's-maxage=3600, stale-while-revalidate',
            },
        });

    } catch (err: any) {
        return new Response(
            JSON.stringify({ error: err.message, detail: "Error en la lógica del catálogo" }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}