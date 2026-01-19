
import { supabase } from './supabase';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * Assumes a bucket named 'products' exists.
 * @param file The file to upload.
 * @returns The public URL of the uploaded file, or null if failed.
 */
/**
 * Compresses an image file using Canvas.
 * Max dimension: 1920px
 * Quality: 0.8 (JPEG)
 */
export const uploadProductImage = async (file: File, folder?: string): Promise<string | null> => {
    try {
        if (!file) return null;

        // Force Universal WebP Conversion + Compression (80%)
        // We use the same Canvas logic but force type 'image/webp' and quality 0.8
        const compressedFile = await new Promise<File>((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => { img.src = e.target?.result as string; };
            reader.onerror = (e) => reject(e);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) { resolve(file); return; }

                const MAX_DIMENSION = 1920;
                let width = img.width;
                let height = img.height;

                // Resize logic
                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // EXPORT AS WEBP @ 80% QUALITY
                canvas.toBlob((blob) => {
                    if (blob) {
                        // Create new file with .webp extension
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                        const webpFile = new File([blob], newName, { type: 'image/webp', lastModified: Date.now() });
                        resolve(webpFile);
                    } else {
                        resolve(file); // Fallback to original if conversion fails
                    }
                }, 'image/webp', 0.80);
            };
            reader.readAsDataURL(file);
        });

        // Debug log
        console.log(`[Upload] Original: ${(file.size / 1024).toFixed(2)} KB | WebP: ${(compressedFile.size / 1024).toFixed(2)} KB`);

        // Generate unique filename safely
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const cleanName = compressedFile.name.toLowerCase().replace(/[^a-z0-9-.]/g, '-'); // Sanitize chars
        // Ensure final name ends in .webp
        const finalName = cleanName.endsWith('.webp') ? cleanName : `${cleanName.split('.')[0]}-${uniqueSuffix}.webp`;
        // Double check uniqueness injecting timestamp if not present
        const storageName = finalName.includes(uniqueSuffix) ? finalName : `${finalName.replace('.webp', '')}-${uniqueSuffix}.webp`;

        const cleanFolder = folder ? folder.toLowerCase().replace(/[^a-z0-9-_]/g, '-') : 'general';
        const filePath = `${cleanFolder}/${storageName}`;

        // Upload to NEW 'savage-storage' bucket
        const { error: uploadError } = await supabase.storage
            .from('savage-storage')
            .upload(filePath, compressedFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading image to savage-storage:', uploadError);
            alert(`Error al subir imagen (Storage): ${uploadError.message}`);
            return null;
        }

        // Get Public URL
        const { data } = supabase.storage
            .from('savage-storage')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Upload exception:', error);
        return null;
    }
};
