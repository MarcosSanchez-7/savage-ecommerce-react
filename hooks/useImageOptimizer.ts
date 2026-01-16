import { useState, useEffect, useCallback, useRef } from 'react';

interface OptimizeOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0 to 1
}

interface UseImageOptimizerReturn {
    optimizeImage: (file: File, options?: OptimizeOptions) => Promise<File>;
    isProcessing: boolean;
    error: string | null;
}

export const useImageOptimizer = (): UseImageOptimizerReturn => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // Initialize Worker
        // Vite handles this syntax to compile the worker appropriately
        workerRef.current = new Worker(new URL('../utils/imageOptimizer.worker.ts', import.meta.url), {
            type: 'module'
        });

        return () => {
            // Cleanup worker on unmount
            workerRef.current?.terminate();
        };
    }, []);

    const optimizeImage = useCallback((file: File, options: OptimizeOptions = {}) => {
        return new Promise<File>((resolve, reject) => {
            if (!workerRef.current) {
                reject(new Error('Worker not initialized'));
                return;
            }

            // Reset state
            setIsProcessing(true);
            setError(null);

            const { maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = options;

            // Handle worker messages
            const handleMessage = (e: MessageEvent) => {
                const { success, blob, error: workerError } = e.data;

                if (success && blob) {
                    // Create a new File from the Blob
                    // Change extension to .webp
                    const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    const newFile = new File([blob], newName, {
                        type: 'image/webp',
                        lastModified: Date.now()
                    });

                    setIsProcessing(false);
                    cleanup();
                    resolve(newFile);
                } else {
                    const errorMsg = workerError || 'Validation failed';
                    setError(errorMsg);
                    setIsProcessing(false);
                    cleanup();
                    reject(new Error(errorMsg));
                }
            };

            const cleanup = () => {
                workerRef.current?.removeEventListener('message', handleMessage);
                // We don't remove error listener usually for single-use logic per logic block, 
                // but since we reuse the worker, we must remove *this specific* listener.
                // NOTE: This simple implementation assumes sequential processing. 
                // If parallel processing is needed, we need IDs to match requests to responses.
            };

            workerRef.current.addEventListener('message', handleMessage);

            // Send data to worker
            workerRef.current.postMessage({
                file,
                maxWidth,
                maxHeight,
                quality
            });
        });
    }, []);

    return { optimizeImage, isProcessing, error };
};
