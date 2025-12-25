
import { supabase } from './supabase';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * Assumes a bucket named 'products' exists.
 * @param file The file to upload.
 * @returns The public URL of the uploaded file, or null if failed.
 */
export const uploadProductImage = async (file: File): Promise<string | null> => {
    try {
        if (!file) return null;

        // Create a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to 'products' bucket
        // If the user hasn't created the bucket yet, this will fail.
        // Sadly we can't create buckets from the client-side easily without admin rights,
        // but often 'public' buckets are used. Let's try 'products'.
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image to Supabase:', uploadError);
            // If bucket doesn't exist, we might want to alert the user, but for now just log
            alert(`Error al subir imagen: ${uploadError.message}. Asegúrate de que el bucket 'products' exista y sea público.`);
            return null;
        }

        // Get Public URL
        const { data } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Upload exception:', error);
        return null;
    }
};
