import React from 'react';
import { useShop } from '../context/ShopContext';

const AnnouncementBar: React.FC = () => {
    const { socialConfig } = useShop();

    if (!socialConfig.topHeaderText) return null;

    return (
        <div className="bg-white text-black text-[10px] sm:text-xs font-bold text-center py-2 px-4 uppercase tracking-widest">
            {socialConfig.topHeaderText}
        </div>
    );
};

export default AnnouncementBar;
