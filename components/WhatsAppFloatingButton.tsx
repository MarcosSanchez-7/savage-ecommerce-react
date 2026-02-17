
import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { MessageCircle } from 'lucide-react';

/**
 * WhatsAppFloatingButton Component
 * Designed for SAVAGE E-commerce to maximize Meta Ads conversions.
 * Minimalist version: Only the animated button without the floating tooltip.
 * Smart Hide: Disappears during cart/checkout flow, admin panel, and search overlay.
 */
const WhatsAppFloatingButton: React.FC = () => {
    const { products, socialConfig, isCartOpen } = useShop();
    const location = useLocation();
    const { slug } = useParams<{ slug: string }>();

    // Detect mobile search overlay
    const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const searchOverlay = document.querySelector('[data-search-overlay]');
            setIsSearchOverlayOpen(!!searchOverlay);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
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
     * Hide button on specific routes (admin, checkout, profile)
     */
    const shouldHideOnRoute = useMemo(() => {
        const hiddenRoutes = ['/checkout', '/admin', '/profile'];
        return hiddenRoutes.some(route => location.pathname.startsWith(route));
    }, [location.pathname]);

    /**
     * Placeholder for Analytics Tracking (Meta Pixel / GA4 / GTM)
     */
    const trackConversionEvent = (context: string, label: string) => {
        console.log(`[SAVAGE ANALYTICS] WhatsApp Button Clicked: ${context} | Label: ${label}`);
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

    // Hide button when cart is open, search overlay is open, or on hidden routes
    if (isCartOpen || shouldHideOnRoute || isSearchOverlayOpen) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end pointer-events-none sm:bottom-10 sm:right-10 animate-in fade-in duration-300">
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
