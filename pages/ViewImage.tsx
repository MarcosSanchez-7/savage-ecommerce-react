import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ViewImage: React.FC = () => {
    const { fileName } = useParams<{ fileName: string }>();

    useEffect(() => {
        if (fileName) {
            // Base URL for Supabase Storage
            const baseUrl = "https://cwlaqfjqgrtyhyscwpnq.supabase.co/storage/v1/object/public/product-images";
            const fullUrl = `${baseUrl}/${fileName}`;

            // Redirect immediately
            window.location.replace(fullUrl);
        }
    }, [fileName]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto mb-4"></div>
                <p>Redireccionando a la imagen...</p>
            </div>
        </div>
    );
};

export default ViewImage;
