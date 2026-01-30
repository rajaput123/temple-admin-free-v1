import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileImage, FileText, FileSpreadsheet } from 'lucide-react';
import { Department } from '@/types/hr';
import { Employee } from '@/types/erp';
import { useToast } from '@/hooks/use-toast';

interface OrgChartExportProps {
  departments: Department[];
  employees: Employee[];
}

export function OrgChartExport({ departments, employees }: OrgChartExportProps) {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'pdf' | 'excel'>('png');
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeContactInfo, setIncludeContactInfo] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const handleExport = () => {
    // In a real app, this would generate the actual export
    // For now, we'll simulate it
    toast({
      title: 'Export Started',
      description: `Exporting org chart as ${exportFormat.toUpperCase()}...`,
    });

    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: `Org chart exported successfully as ${exportFormat.toUpperCase()}`,
      });
    }, 1500);
  };

  const buildOrgHierarchy = () => {
    const hierarchy: Record<string, { employee: Employee; reports: Employee[] }> = {};
    
    employees.forEach(emp => {
      if (!emp.reportingToId) {
        if (!hierarchy[emp.id]) {
          hierarchy[emp.id] = { employee: emp, reports: [] };
        }
      } else {
        if (!hierarchy[emp.reportingToId]) {
          const manager = employees.find(e => e.id === emp.reportingToId);
          if (manager) {
            hierarchy[emp.reportingToId] = { employee: manager, reports: [] };
          }
        }
        if (hierarchy[emp.reportingToId]) {
          hierarchy[emp.reportingToId].reports.push(emp);
        }
      }
    });

    return Object.values(hierarchy);
  };

  const filteredEmployees = selectedDepartment === 'all'
    ? employees
    : employees.filter(emp => emp.department === selectedDepartment);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Export Organization Chart</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Export organizational structure in various formats
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Export Format</Label>
          <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as typeof exportFormat)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  PNG (Image)
                </div>
              </SelectItem>
              <SelectItem value="svg">
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  SVG (Vector)
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF (Document)
                </div>
              </SelectItem>
              <SelectItem value="excel">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel (Data)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Department Filter</Label>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Export Options</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-photos"
              checked={includePhotos}
              onCheckedChange={setIncludePhotos}
            />
            <Label htmlFor="include-photos" className="text-sm font-normal cursor-pointer">
              Include Employee Photos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-contact"
              checked={includeContactInfo}
              onCheckedChange={setIncludeContactInfo}
            />
            <Label htmlFor="include-contact" className="text-sm font-normal cursor-pointer">
              Include Contact Information
            </Label>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button onClick={handleExport} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Export Org Chart
        </Button>
      </div>

      {/* Preview Info */}
      <div className="text-xs text-muted-foreground">
        <p>Preview: {filteredEmployees.length} employees will be included in the export</p>
        <p className="mt-1">
          Format: {exportFormat.toUpperCase()} | 
          Photos: {includePhotos ? 'Yes' : 'No'} | 
          Contact: {includeContactInfo ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  );
}
