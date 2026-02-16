import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('DB_URL') ?? '';
        const supabaseKey = Deno.env.get('PRIVATE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: products, error } = await supabase
            .from('products')
            .select('id, savage_id, name, description, price, images, stock_quantity, slug, is_active, is_imported')
            .eq('is_active', true);

        if (error) {
            throw error;
        }

        const xmlItems = products
            .filter(p => p.price && (p.savage_id || p.id) && p.name) // Filter invalid items
            .map((product) => {
                const stock = product.stock_quantity || 0;
                // Availability Rule
                const isImported = product.is_imported === true;
                const availability = (isImported || stock > 0) ? 'in stock' : 'out of stock';

                const condition = 'new';
                const brand = 'Savage Store';
                const price = `${Number(product.price).toFixed(0)} PYG`;

                // Link construction: Encode slug/id to ensure valid URL
                const urlKey = product.slug || product.id;
                const link = `https://www.savageeepy.com/product/${encodeURIComponent(urlKey)}`;

                // Image
                const image_link = (product.images && product.images.length > 0) ? product.images[0] : '';

                const description = product.description || product.name || 'Sin descripción';
                const title = product.name;
                const finalId = product.savage_id || product.id; // Fallback to UUID

                // Escape special XML chars (basic)
                const escape = (str: string | number) => String(str || '')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');

                return `
    <item>
      <g:id>${escape(finalId)}</g:id>
      <g:title>${escape(title)}</g:title>
      <g:description>${escape(description)}</g:description>
      <g:link>${escape(link)}</g:link>
      <g:image_link>${escape(image_link)}</g:image_link>
      <g:brand>${escape(brand)}</g:brand>
      <g:condition>${escape(condition)}</g:condition>
      <g:availability>${escape(availability)}</g:availability>
      <g:price>${escape(price)}</g:price>
      <g:item_group_id>${escape(finalId)}</g:item_group_id>
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>
    </item>`;
            }).join('');

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Savage Store Meta Catalog</title>
    <link>https://www.savageeepy.com</link>
    <description>Catálogo de productos de Savage Store</description>
    ${xmlItems}
  </channel>
</rss>`;

        return new Response(rss, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/xml; charset=utf-8',
            },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
