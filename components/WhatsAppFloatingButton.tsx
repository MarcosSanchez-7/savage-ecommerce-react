
import React, { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { MessageCircle } from 'lucide-react';

/**
 * WhatsAppFloatingButton Component
 * Designed for SAVAGE E-commerce to maximize Meta Ads conversions.
 * Minimalist version: Only the animated button without the floating tooltip.
 */
const WhatsAppFloatingButton: React.FC = () => {
    const { products, socialConfig } = useShop();
    const location = useLocation();
    const { slug } = useParams<{ slug: string }>();

    // Extract Product Name for Contextual Messaging
    const productName = useMemo(() => {
        if (!location.pathname.startsWith('/product/') || !slug) return null;

        const cleanSlug = decodeURIComponent(slug).replace(/\/$/, '').toLowerCase();
        const foundProduct = products.find(p =>
            (p.slug && p.slug.toLowerCase() === cleanSlug) ||
            (p.id && p.id.toString().toLowerCase() === cleanSlug)
        );

        return foundProduct?.name || null;
    }, [location.pathname, slug, products]);

    /**
     * Placeholder for Analytics Tracking (Meta Pixel / GA4 / GTM)
     */
    const trackConversionEvent = (context: string, label: string) => {
        console.log(`[SAVAGE ANALYTICS] WhatsApp Button Clicked: ${context} | Label: ${label}`);

        // Example integration:
        // if (typeof window.fbq === 'function') {
        //   window.fbq('trackCustom', 'WhatsAppContact', { product: label });
        // }
    };

    const handleWhatsAppRedirect = () => {
        const phone = socialConfig.whatsapp || '595983840235';
        const context = productName ? 'ProductPage' : 'General';
        const label = productName || location.pathname;

        const baseMessage = productName
            ? `HOLA, ME GUSTARIA CONSULTARLES SOBRE LA DISPONIBILIDAD DEL PRODUCTO: ${productName.toUpperCase()} 😊`
            : 'HOLA, ME GUSTARIA CONSULTARLES SOBRE LA DISPONIBILIDAD DE UN PRODUCTO 😊';

        trackConversionEvent(context, label);

        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(baseMessage)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none sm:bottom-10 sm:right-10">
            {/* SAVAGE WhatsApp Button */}
            <button
                onClick={handleWhatsAppRedirect}
                className={`
                    group relative flex items-center justify-center 
                    size-14 md:size-16 rounded-full 
                    bg-[#25D366] text-white
                    shadow-[0_15px_35px_rgba(37,211,102,0.4)] 
                    hover:shadow-[0_20px_45px_rgba(37,211,102,0.6)]
                    hover:scale-105 transition-all duration-300 
                    active:scale-95 pointer-events-auto
                    overflow-visible
                `}
                aria-label="Contactar por WhatsApp"
            >
                {/* Pulsating Attention Circle */}
                <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping group-hover:opacity-0 transition-opacity" />

                {/* Icon with Savage Styling */}
                <MessageCircle
                    size={28}
                    className="relative z-10 transition-transform group-hover:scale-110 duration-300"
                    fill="currentColor"
                    strokeWidth={1.5}
                />

                {/* Ambient Glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
            </button>
        </div>
    );
};

export default WhatsAppFloatingButton;
