import React from 'react';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';

const AnnouncementBar: React.FC = () => {
    const { socialConfig } = useShop();
    const { theme } = useTheme();

    if (!socialConfig.topHeaderText) return null;

    return (
        <div className={`
            text-[10px] sm:text-xs font-bold text-center py-2 px-4 uppercase tracking-widest transition-colors duration-300
            ${theme === 'light' ? 'bg-primary text-white' : 'bg-white text-black'}
        `}>
            {socialConfig.topHeaderText}
        </div>
    );
};

export default AnnouncementBar;
