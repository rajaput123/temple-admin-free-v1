import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Download, Trash2, Calendar } from 'lucide-react';
import { EmployeeDocument } from '@/types/hr';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface EmployeeDocumentsProps {
  employeeId: string;
  documents: EmployeeDocument[];
  onUpload: (document: Omit<EmployeeDocument, 'id' | 'uploadedOn' | 'uploadedBy'>) => void;
  onDelete: (documentId: string) => void;
  currentUserId: string;
}

export function EmployeeDocuments({
  employeeId,
  documents,
  onUpload,
  onDelete,
  currentUserId,
}: EmployeeDocumentsProps) {
  const { toast } = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    category: '' as EmployeeDocument['category'],
    name: '',
    file: null as File | null,
    expiryDate: '',
  });

  const documentCategories: { value: EmployeeDocument['category']; label: string }[] = [
    { value: 'id_proof', label: 'ID Proof' },
    { value: 'bank_details', label: 'Bank Details' },
    { value: 'certifications', label: 'Certifications' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'performance_reviews', label: 'Performance Reviews' },
    { value: 'disciplinary_records', label: 'Disciplinary Records' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData({ ...uploadData, file, name: file.name });
    }
  };

  const handleUpload = () => {
    if (!uploadData.category || !uploadData.file) {
      toast({
        title: 'Missing information',
        description: 'Please select category and file',
        variant: 'destructive',
      });
      return;
    }

    // Create a URL for the file (in real app, upload to server)
    const fileUrl = URL.createObjectURL(uploadData.file);

    onUpload({
      employeeId,
      category: uploadData.category,
      name: uploadData.name || uploadData.file.name,
      url: fileUrl,
      expiryDate: uploadData.expiryDate || undefined,
    });

    toast({
      title: 'Document uploaded',
      description: 'Document has been uploaded successfully',
    });

    setUploadData({
      category: '' as EmployeeDocument['category'],
      name: '',
      file: null,
      expiryDate: '',
    });
    setUploadOpen(false);
  };

  const handleDelete = (documentId: string) => {
    onDelete(documentId);
    toast({
      title: 'Document deleted',
      description: 'Document has been deleted',
    });
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<EmployeeDocument['category'], EmployeeDocument[]>);

  const getCategoryLabel = (category: EmployeeDocument['category']) => {
    return documentCategories.find(c => c.value === category)?.label || category;
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Documents</h3>
        <Button onClick={() => setUploadOpen(true)} size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Upload Dialog */}
      {uploadOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select
                value={uploadData.category}
                onValueChange={(value) => setUploadData({ ...uploadData, category: value as EmployeeDocument['category'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Document Name</Label>
              <Input
                value={uploadData.name}
                onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                placeholder="Enter document name"
              />
            </div>
            <div>
              <Label>File</Label>
              <Input
                type="file"
                onChange={handleFileSelect}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Expiry Date (Optional)</Label>
              <Input
                type="date"
                value={uploadData.expiryDate}
                onChange={(e) => setUploadData({ ...uploadData, expiryDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpload}>Upload</Button>
              <Button variant="outline" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      {Object.keys(groupedDocuments).length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No documents uploaded yet
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedDocuments).map(([category, docs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-base">{getCategoryLabel(category as EmployeeDocument['category'])}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>Uploaded: {format(new Date(doc.uploadedOn), 'dd MMM yyyy')}</span>
                            {doc.expiryDate && (
                              <span className={`flex items-center gap-1 ${
                                isExpired(doc.expiryDate) ? 'text-destructive' :
                                isExpiringSoon(doc.expiryDate) ? 'text-warning' : ''
                              }`}>
                                <Calendar className="h-3 w-3" />
                                Expires: {format(new Date(doc.expiryDate), 'dd MMM yyyy')}
                              </span>
                            )}
                            {doc.version && (
                              <span>Version: {doc.version}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
