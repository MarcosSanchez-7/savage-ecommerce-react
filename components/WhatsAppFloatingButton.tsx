
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { MessageCircle } from 'lucide-react';

/**
 * WhatsAppFloatingButton Component
 * Designed for SAVAGE E-commerce to maximize Meta Ads conversions.
 * Features: Dynamic messaging based on URL, Tooltip Persuasion, and Tracking.
 */
const WhatsAppFloatingButton: React.FC = () => {
    const { products, socialConfig } = useShop();
    const location = useLocation();
    const { slug } = useParams<{ slug: string }>();

    const [showTooltip, setShowTooltip] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Persuasive Tooltip Logic (Hide after 5s of being shown or on user scroll if preferred)
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowTooltip(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

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
        // if (typeof window.gtag === 'function') {
        //   window.gtag('event', 'whatsapp_lead', { 'item_name': label });
        // }
    };

    const handleWhatsAppRedirect = () => {
        const phone = socialConfig.whatsapp || '595983840235';
        const context = productName ? 'ProductPage' : 'General';
        const label = productName || location.pathname;

        const baseMessage = productName
            ? `Hola! Estoy viendo el ${productName} y me gustaría recibir más información.`
            : 'Hola! Vengo de la web y tengo una consulta sobre el catálogo.';

        trackConversionEvent(context, label);

        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(baseMessage)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none sm:bottom-10 sm:right-10">

            {/* Persuasive Tooltip GLOBE */}
            <div
                className={`
                    transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform
                    ${(showTooltip || isHovered) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90'}
                    bg-white text-black px-5 py-2.5 rounded-2xl rounded-br-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] 
                    border border-gray-100 relative pointer-events-auto
                `}
            >
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] leading-tight">
                    ¿Dudas con tu talla? <span className="text-[#25D366]">Escríbenos</span>
                </p>
                {/* Tooltip Tail */}
                <div className="absolute -bottom-1.5 right-0 w-4 h-4 bg-white rotate-45 rounded-sm" />
            </div>

            {/* SAVAGE WhatsApp Button */}
            <button
                onClick={handleWhatsAppRedirect}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    group relative flex items-center justify-center 
                    size-14 md:size-16 rounded-full 
                    bg-[#25D366] text-white
                    shadow-[0_15px_35px_rgba(37,211,102,0.4)] 
                    hover:shadow-[0_20px_45px_rgba(37,211,102,0.6)]
                    transition-all duration-300 active:scale-95 pointer-events-auto
                    overflow-visible
                `}
                aria-label="Contactar por WhatsApp"
            >
                {/* Pulsating Attention Circle */}
                <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping group-hover:animate-none group-hover:opacity-0 transition-opacity" />

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
