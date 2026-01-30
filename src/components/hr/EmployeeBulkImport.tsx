import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/types/erp';

interface EmployeeBulkImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (employees: Partial<Employee>[]) => void;
}

export function EmployeeBulkImport({ open, onOpenChange, onImport }: EmployeeBulkImportProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Partial<Employee>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file',
        description: 'Please select a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: 'Invalid CSV',
          description: 'CSV file must have at least a header row and one data row',
          variant: 'destructive',
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const defaultMapping: Record<string, string> = {
        'name': 'name',
        'email': 'email',
        'phone': 'phone',
        'department': 'department',
        'designation': 'designation',
      };

      const mapping: Record<string, string> = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (defaultMapping[lowerHeader]) {
          mapping[header] = defaultMapping[lowerHeader];
        }
      });
      setColumnMapping(mapping);

      const data: Partial<Employee>[] = [];
      for (let i = 1; i < Math.min(lines.length, 101); i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Partial<Employee> = {};
        
        headers.forEach((header, index) => {
          const mappedField = mapping[header];
          if (mappedField && values[index]) {
            (row as Record<string, unknown>)[mappedField] = values[index];
          }
        });

        if (row.email || row.phone) {
          data.push(row);
        }
      }

      setPreview(data);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (preview.length === 0) {
      toast({
        title: 'No data',
        description: 'Please select a valid CSV file with data',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      onImport(preview);
      toast({
        title: 'Import successful',
        description: `Imported ${preview.length} employees`,
      });
      setIsProcessing(false);
      handleClose();
    }, 1000);
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setColumnMapping({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Employees</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload */}
          <div>
            <Label>Upload CSV File</Label>
            <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                {file ? (
                  <div className="flex items-center gap-2 text-foreground">
                    <FileSpreadsheet className="h-5 w-5" />
                    <span>{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreview([]);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      CSV file only
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Column Mapping */}
          {file && Object.keys(columnMapping).length > 0 && (
            <div>
              <Label>Column Mapping</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Map CSV columns to employee fields (email and phone are primary identifiers)
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(columnMapping).map(([csvColumn, field]) => (
                  <div key={csvColumn} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{csvColumn}:</span>
                    <span className="font-medium text-foreground">{field}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <Label>Preview ({preview.length} rows)</Label>
              <div className="mt-2 border rounded-lg max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Phone</th>
                      <th className="p-2 text-left">Department</th>
                      <th className="p-2 text-left">Designation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{row.name || '-'}</td>
                        <td className="p-2">{row.email || '-'}</td>
                        <td className="p-2">{row.phone || '-'}</td>
                        <td className="p-2">{row.department || '-'}</td>
                        <td className="p-2">{row.designation || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 10 && (
                  <div className="p-2 text-xs text-muted-foreground text-center">
                    ... and {preview.length - 10} more rows
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={preview.length === 0 || isProcessing}>
            {isProcessing ? 'Importing...' : `Import ${preview.length} Employees`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
