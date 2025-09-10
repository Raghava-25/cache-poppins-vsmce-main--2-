import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeDisplayProps {
    upiId: string;
    amount: number;
    transactionNote: string;
    onCopyDetails: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
    upiId,
    amount,
    transactionNote,
    onCopyDetails
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const { toast } = useToast();

    useEffect(() => {
        const generateQR = async () => {
            if (!canvasRef.current) return;

            try {
                // Create UPI payment string
                const upiString = `upi://pay?pa=${upiId}&pn=Raghava P&am=${amount.toFixed(2)}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;

                // Generate QR code
                const dataUrl = await QRCode.toDataURL(upiString, {
                    width: 256,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });

                setQrDataUrl(dataUrl);

                // Draw on canvas
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const img = new Image();
                    img.onload = () => {
                        canvas.width = 256;
                        canvas.height = 256;
                        ctx.drawImage(img, 0, 0);
                    };
                    img.src = dataUrl;
                }
            } catch (error) {
                console.error('Error generating QR code:', error);
                toast({
                    title: "Error",
                    description: "Failed to generate QR code",
                    variant: "destructive",
                });
            }
        };

        generateQR();
    }, [upiId, amount, transactionNote, toast]);

    const downloadQR = () => {
        if (qrDataUrl) {
            const link = document.createElement('a');
            link.download = `cache-2025-payment-qr-${amount}.png`;
            link.href = qrDataUrl;
            link.click();
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-lg">Scan QR Code to Pay</CardTitle>
                <CardDescription>
                    Scan with any UPI app to make payment
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-center">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                        <canvas
                            ref={canvasRef}
                            className="w-64 h-64 max-w-full"
                        />
                    </div>
                </div>

                <div className="space-y-2 text-center">
                    <p className="text-sm font-medium">UPI ID: {upiId}</p>
                    <p className="text-sm text-muted-foreground">Amount: ₹{amount}</p>
                    <p className="text-xs text-muted-foreground break-words">{transactionNote}</p>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={onCopyDetails}
                        variant="outline"
                        className="flex-1"
                    >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Details
                    </Button>
                    <Button
                        onClick={downloadQR}
                        variant="outline"
                        className="flex-1"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download QR
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default QRCodeDisplay;
