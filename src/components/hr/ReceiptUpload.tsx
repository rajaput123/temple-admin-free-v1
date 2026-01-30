import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReceiptUploadProps {
  onUpload: (receipt: {
    file: File;
    category?: string;
    amount?: number;
    date?: string;
    vendor?: string;
    ocrData?: {
      amount: number;
      date: string;
      vendor: string;
    };
  }) => void;
}

export function ReceiptUpload({ onUpload }: ReceiptUploadProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState<string>('');
  const [ocrData, setOcrData] = useState<{ amount: number; date: string; vendor: string } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }

      // Simulate OCR processing (no validation)
      setTimeout(() => {
        // Mock OCR data
        setOcrData({
          amount: Math.floor(Math.random() * 5000) + 100,
          date: new Date().toISOString().split('T')[0],
          vendor: 'Sample Vendor',
        });
        toast({
          title: 'OCR Processing Complete',
          description: 'Receipt information extracted (no validation performed)',
        });
      }, 1000);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        title: 'No File Selected',
        description: 'Please select a receipt file to upload',
        variant: 'destructive',
      });
      return;
    }

    onUpload({
      file,
      category: category || undefined,
      amount: amount || ocrData?.amount,
      date: date || ocrData?.date,
      vendor: vendor || ocrData?.vendor,
      ocrData: ocrData || undefined,
    });

    // Reset form
    setFile(null);
    setPreview(null);
    setCategory('');
    setAmount(0);
    setDate(new Date().toISOString().split('T')[0]);
    setVendor('');
    setOcrData(null);

    toast({
      title: 'Receipt Uploaded',
      description: 'Receipt has been uploaded successfully',
    });
  };

  const categories = [
    'travel',
    'office_supplies',
    'meals',
    'accommodation',
    'other',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Receipt Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm font-medium text-foreground mb-1">
            {file ? file.name : 'Drag & drop your receipt here or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Supported formats: JPG, PNG, PDF
          </p>
          <Input
            id="receipt-upload"
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Label htmlFor="receipt-upload">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Browse File
              </span>
            </Button>
          </Label>
        </div>

        {preview && (
          <div className="relative">
            <img src={preview} alt="Receipt preview" className="w-full max-h-64 object-contain rounded-lg border" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {ocrData && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-medium text-foreground">OCR Extracted Data (No Validation)</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Amount: </span>
                <span className="font-medium">₹{ocrData.amount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Date: </span>
                <span className="font-medium">{ocrData.date}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Vendor: </span>
                <span className="font-medium">{ocrData.vendor}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              value={amount || ocrData?.amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={date || ocrData?.date || ''}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Vendor</Label>
            <Input
              value={vendor || ocrData?.vendor || ''}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="Enter vendor name"
            />
          </div>
        </div>

        <Button onClick={handleUpload} disabled={!file} className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          Upload Receipt
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          OCR processing extracts receipt information automatically. No validation is performed.
        </p>
      </CardContent>
    </Card>
  );
}
