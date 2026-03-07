import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    product?: boolean; // Type for OG
    noindex?: boolean; // Added for SEO cleaning
}

const SEO: React.FC<SEOProps> = ({
    title = 'SAVAGE STORE | Tienda de Ropa Urbana, Camisetas de Fútbol y Accesorios en Paraguay',
    description = 'Descubre en SAVAGE STORE las mejores remeras urbanas, camisetas de fútbol, zapatillas sneakers, relojes y accesorios exclusivos. Tu estilo al siguiente nivel.',
    image = 'https://www.savageeepy.com/crown.png',
    product = false,
    noindex = false
}) => {
    const location = useLocation();
    const url = `https://www.savageeepy.com${location.pathname}`;

    return (
        <Helmet>
            {/* Standard Metrics */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            {noindex && <meta name="robots" content="noindex, follow" />}

            {/* Open Graph */}
            <meta property="og:url" content={url} />
            <meta property="og:type" content={product ? 'product' : 'website'} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;
