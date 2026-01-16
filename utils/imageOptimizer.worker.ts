/// <reference lib="webworker" />
// Image Optimization Worker using OffscreenCanvas
// Handles resizing and conversion to WebP in a background thread

self.onmessage = async (e: MessageEvent) => {
    const { file, maxWidth, maxHeight, quality } = e.data;

    try {
        // Create ImageBitmap from File (efficient decoding)
        const bitmap = await self.createImageBitmap(file);

        // Calculate new dimensions
        let width = bitmap.width;
        let height = bitmap.height;

        if (width > maxWidth || height > maxHeight) {
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width * (maxHeight / height));
                    height = maxHeight;
                }
            }
        }

        // Use OffscreenCanvas if available (Standard in modern Workers)
        if (typeof OffscreenCanvas !== 'undefined') {
            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext('2d');

            if (!ctx) throw new Error('Could not get canvas context');

            // High quality scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(bitmap, 0, 0, width, height);

            // Convert to WebP
            // @ts-ignore - convertToBlob is standard on OffscreenCanvas but TS might complain depending on env lib
            const blob = await canvas.convertToBlob({
                type: 'image/webp',
                quality: quality || 0.8
            });

            // Send back result
            self.postMessage({ success: true, blob });
        } else {
            // Fallback for environments without OffscreenCanvas (unlikely in modern browsers but safe to handle)
            // We effectively fail or strictly return original if we can't process
            // OR we could try other methods, but OffscreenCanvas is the requirement for Worker canvas.
            throw new Error('OffscreenCanvas not supported in this browser.');
        }

        // Cleanup
        bitmap.close();

    } catch (error: any) {
        self.postMessage({ success: false, error: error.message });
    }
};
