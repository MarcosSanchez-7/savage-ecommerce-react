
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
            : '¡Hola! Estoy escribiendo desde el sitio Web 💻😁 Quiero hacer un pedido 🛒';

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
                <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 md:w-8 md:h-8 relative z-10 transition-transform group-hover:scale-110 duration-300 fill-current"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>

                {/* Ambient Glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
            </button>
        </div>
    );
};

export default WhatsAppFloatingButton;
