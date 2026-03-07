import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load .env variables locally
try {
  const envContent = fs.readFileSync('.env', 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value && key.trim() && !key.startsWith('#')) {
      process.env[key.trim()] = value.join('=').trim().replace(/['"]/g, '');
    }
  });
} catch (error) {
  console.warn("⚠️  Could not read .env file, assuming environment variables are injected natively by the hosting provider.");
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase URL or Key in environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const generateSitemap = async () => {
  console.log('⏳ Fetching products and categories from Supabase...');

  // get active products
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, created_at, category, slug');

  // get categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name');

  if (prodError || catError) {
    console.error("❌ Error fetching data from Supabase", prodError || catError);
    return;
  }

  const domain = 'https://www.savageeepy.com';
  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Static Pages -->
  <url>
    <loc>${domain}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/offers</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/nuevos-ingresos</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/destacados</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${domain}/temporada</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/blog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${domain}/contact</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
`;

  // Add Categories
  if (categories && categories.length > 0) {
    xml += `\n  <!-- Categories -->\n`;
    for (const cat of categories) {
      xml += `  <url>
    <loc>${domain}/category/${encodeURIComponent(cat.id)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }
  }

  // Add Products
  if (products && products.length > 0) {
    xml += `\n  <!-- Products -->\n`;
    for (const prod of products) {
      // we'll just use created_at as lastmod or 'now' if created_at is missing
      const lastMod = prod.created_at ? new Date(prod.created_at).toISOString() : now;
      xml += `  <url>
    <loc>${domain}/product/${encodeURIComponent(prod.slug || prod.id)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
    }
  }

  xml += `</urlset>`;

  try {
    fs.writeFileSync('public/sitemap.xml', xml, 'utf8');
    console.log(`✅ Sitemap created successfully at public/sitemap.xml`);
    console.log(`🤖 Total Indexed: ${products?.length || 0} products & ${categories?.length || 0} categories.`);
  } catch (err) {
    console.error("❌ Error writing sitemap.xml to public folder:", err);
    process.exit(1);
  }
};

generateSitemap();
