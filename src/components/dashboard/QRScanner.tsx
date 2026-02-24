import { useEffect, useRef, useId } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (error: any) => void;
}

/**
 * QRScanner Component
 * Uses html5-qrcode to scan QR codes with device camera
 * Refactored to handle unmounting gracefully and avoid infinite re-renders
 */
const QRScanner = ({ onScanSuccess, onScanError }: QRScannerProps) => {
    const id = useId();
    const containerId = `qr-reader-${id.replace(/:/g, '')}`;

    // 1️⃣ Use refs for callbacks to prevent effect re-triggering
    const onScanSuccessRef = useRef(onScanSuccess);
    const onScanErrorRef = useRef(onScanError);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    // Update refs when props change
    useEffect(() => {
        onScanSuccessRef.current = onScanSuccess;
        onScanErrorRef.current = onScanError;
    }, [onScanSuccess, onScanError]);

    useEffect(() => {
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
        };

        // Initialize scanner with unique ID
        console.log(`🚀 Initializing QR Scanner on: ${containerId}`);
        html5QrCodeRef.current = new Html5Qrcode(containerId);

        const startScanner = async () => {
            try {
                // Request camera permission and start scanning
                await html5QrCodeRef.current!.start(
                    { facingMode: 'environment' }, // Use back camera on mobile
                    config,
                    (decodedText: string) => {
                        // Successfully scanned QR code
                        console.log('✅ QR Code scanned:', decodedText);
                        if (onScanSuccessRef.current) {
                            onScanSuccessRef.current(decodedText);
                        }
                    },
                    (errorMessage: string) => {
                        // Scanning errors (not found, etc.) - can be ignored
                        if (!errorMessage.includes('No') && !errorMessage.includes('NotFoundException')) {
                            console.warn('QR Scanner error:', errorMessage);
                        }
                    }
                );
            } catch (err) {
                console.error('❌ Failed to start QR scanner:', err);
                if (onScanErrorRef.current) {
                    onScanErrorRef.current(err);
                }
            }
        };

        startScanner();

        // Cleanup on unmount
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current
                    .stop()
                    .then(() => {
                        console.log(`QR Scanner stopped on: ${containerId}`);
                        try {
                            // 🛡️ Robust Cleanup:
                            // only clear if element exists to avoid "Node not found" error
                            if (document.getElementById(containerId)) {
                                html5QrCodeRef.current!.clear();
                            }
                        } catch (e) {
                            console.warn('UI cleanup skipped (element likely removed):', e);
                        }
                    })
                    .catch((err) => {
                        // Ignore standard cleanup errors like "NotFoundError" or "Element not found"
                        const errorMessage = err?.message || err?.toString() || '';
                        if (errorMessage.includes('NotFoundError') || errorMessage.includes('removeChild') || errorMessage.includes('node to be removed')) {
                            console.log('🧹 Scanner cleanup complete (benign DOM error ignored)');
                            return;
                        }
                        console.error('Error stopping QR scanner:', err);
                    });
            }
        };
    }, [containerId]); // ⚡ Mount when ID is stable

    return (
        <div className="w-full">
            {/* QR Scanner container */}
            <div
                id={containerId}
                className="rounded-lg overflow-hidden border-2 border-blue-500"
                style={{ width: '100%' }}
            />
        </div>
    );
};

export default QRScanner;
