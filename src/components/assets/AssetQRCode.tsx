import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';

interface AssetQRCodeProps {
  assetCode: string;
  assetName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetQRCode({ assetCode, assetName, open, onOpenChange }: AssetQRCodeProps) {
  const qrValue = `${window.location.origin}/assets/${assetCode}`;

  const handleDownload = () => {
    // QR code download functionality - would generate actual QR code image
    console.log('Download QR code for', assetCode);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {assetCode}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 p-6">
          <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center w-48 h-48">
            <QrCode className="w-32 h-32 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="font-medium">{assetName}</p>
            <p className="text-sm text-muted-foreground">{assetCode}</p>
            <p className="text-xs text-muted-foreground mt-2">{qrValue}</p>
          </div>
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
