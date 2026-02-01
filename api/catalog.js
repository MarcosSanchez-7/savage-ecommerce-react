import { createClient } from '@supabase/supabase-js';

// No config export means Node.js runtime by default (serverless)

export default async function handler(req, res) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).send(`<?xml version="1.0"?><error>Faltan credenciales en Vercel (SUPABASE_URL / KEY)</error>`);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('id, name, description, price, slug, images, stock');

        if (error) throw error;

        const baseUrl = "https://savageeeepy.vercel.app";
        let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Savage Essence Catalog</title>
    <link>${baseUrl}</link>
    <description>Sincronización automática Savage</description>`;

        if (products) {
            products.forEach((p) => {
                const availability = (p.stock > 0) ? 'in stock' : 'out of stock';
                const imageUrl = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';

                // Sanitize basic XML chars
                const safeName = (p.name || 'Producto').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const safeDesc = (p.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

                xml += `
    <item>
      <g:id>${p.id}</g:id>
      <g:title><![CDATA[${safeName}]]></g:title>
      <g:description><![CDATA[${safeDesc}]]></g:description>
      <g:link>${baseUrl}/product/${p.slug || p.id}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:brand>Savage</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${p.price} PYG</g:price>
    </item>`;
            });
        }

        xml += `</channel></rss>`;

        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        return res.status(200).send(xml);

    } catch (err) {
        return res.status(500).send(`<?xml version="1.0"?><error>${err.message}</error>`);
    }
}
