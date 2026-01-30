import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, UserPlus, X, Upload, FileText, Trash2, Mail, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmployeeDocuments } from '@/components/hr/EmployeeDocuments';
import { EmployeeDocument } from '@/types/hr';
import { useAuth } from '@/contexts/AuthContext';

import { departments, designations, shifts, gradePays, leaveTypes } from '@/data/hr-dummy-data';

const departmentOptions = departments.map(d => ({ value: d.id, label: d.name }));
const designationOptions = designations.map(d => ({ value: d.id, label: d.name }));
const shiftOptions = shifts.map(s => ({ value: s.id, label: s.name }));
const gradePayOptions = gradePays.map(g => ({ value: g.id, label: g.name }));

export default function EmployeeOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<'draft' | 'pending_documents' | 'pending_contract' | 'active'>('draft');
  const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocument[]>([]);
  const [emailTemplates, setEmailTemplates] = useState({
    welcome: false,
    credentials: false,
    contract: false,
  });

  // Form state
  const [formData, setFormData] = useState({
    // Overview
    employeeCode: 'EMP-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    reportingTo: '',
    employmentType: 'full_time',

    // Joining
    joiningDate: '',
    probationEndDate: '',
    confirmationDate: '',
    noticePeriod: 30,

    // Address
    currentAddress: '',
    permanentAddress: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyRelation: '',

    // Shift
    shift: '',
    workLocation: 'Main Temple',
    biometricId: '',

    // Leave
    leavePolicy: 'standard',
    casualLeave: 12,
    sickLeave: 10,
    earnedLeave: 15,

    // Salary
    gradePay: '',
    basicSalary: 0,
    hra: 0,
    conveyance: 0,
    medical: 0,
    specialAllowance: 0,
    pf: 0,
    esi: 0,
    bankName: '',
    accountNumber: '',
    ifscCode: '',

    // Personal
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: '',
    maritalStatus: 'single',
    nationality: 'Indian',
    religion: '',
    aadharNumber: '',
    panNumber: '',

    // Documents
    documents: [] as { type: string; name: string; uploadedOn: string }[],
  });

  const updateForm = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Draft Saved',
        description: 'Employee data has been saved as draft.',
      });
    }, 500);
  };

  const handleCreate = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Employee Created',
        description: `${formData.firstName} ${formData.lastName} has been added to the system.`,
      });
      navigate('/hr/employees');
    }, 1000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'joining', label: 'Joining' },
    { id: 'address', label: 'Address & Contact' },
    { id: 'shift', label: 'Shift & Attendance' },
    { id: 'leave', label: 'Leave' },
    { id: 'salary', label: 'Salary' },
    { id: 'personal', label: 'Personal' },
    { id: 'documents', label: 'Documents' },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Employee Onboarding"
        description="Add a new employee to the system"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'People / HR', href: '/hr' },
          { label: 'Employees', href: '/hr/employees' },
          { label: 'New Employee' },
        ]}
      />

      <div className="flex flex-col h-[calc(100vh-180px)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 py-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="m-0 space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="form-field">
                  <Label className="form-label">Employee Code</Label>
                  <Input value={formData.employeeCode} disabled />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-field">
                  <Label className="form-label">
                    First Name <span className="form-required">*</span>
                  </Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => updateForm('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">
                    Last Name <span className="form-required">*</span>
                  </Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => updateForm('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-field">
                  <Label className="form-label">
                    Email <span className="form-required">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="employee@temple.org"
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-field">
                  <Label className="form-label">
                    Department <span className="form-required">*</span>
                  </Label>
                  <SearchableSelect
                    options={departmentOptions}
                    value={formData.department}
                    onChange={(value) => updateForm('department', value)}
                    placeholder="Select department"
                    addNewLabel="+ Add Department"
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">
                    Designation <span className="form-required">*</span>
                  </Label>
                  <SearchableSelect
                    options={designationOptions}
                    value={formData.designation}
                    onChange={(value) => updateForm('designation', value)}
                    placeholder="Select designation"
                    addNewLabel="+ Add Designation"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-field">
                  <Label className="form-label">Reporting To</Label>
                  <Input
                    value={formData.reportingTo}
                    onChange={(e) => updateForm('reportingTo', e.target.value)}
                    placeholder="Manager name"
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Employment Type</Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(value) => updateForm('employmentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Joining Tab */}
            <TabsContent value="joining" className="m-0 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="form-field">
                  <Label className="form-label">
                    Joining Date <span className="form-required">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => updateForm('joiningDate', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Probation End Date</Label>
                  <Input
                    type="date"
                    value={formData.probationEndDate}
                    onChange={(e) => updateForm('probationEndDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-field">
                  <Label className="form-label">Confirmation Date</Label>
                  <Input
                    type="date"
                    value={formData.confirmationDate}
                    onChange={(e) => updateForm('confirmationDate', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Notice Period (days)</Label>
                  <Input
                    type="number"
                    value={formData.noticePeriod}
                    onChange={(e) => updateForm('noticePeriod', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="m-0 space-y-6">
              <div className="form-field">
                <Label className="form-label">Current Address</Label>
                <Textarea
                  value={formData.currentAddress}
                  onChange={(e) => updateForm('currentAddress', e.target.value)}
                  placeholder="Enter current address"
                  rows={2}
                />
              </div>

              <div className="form-field">
                <Label className="form-label">Permanent Address</Label>
                <Textarea
                  value={formData.permanentAddress}
                  onChange={(e) => updateForm('permanentAddress', e.target.value)}
                  placeholder="Enter permanent address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="form-field">
                  <Label className="form-label">City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => updateForm('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Pincode</Label>
                  <Input
                    value={formData.pincode}
                    onChange={(e) => updateForm('pincode', e.target.value)}
                    placeholder="000000"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="section-header mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="form-field">
                    <Label className="form-label">Contact Name</Label>
                    <Input
                      value={formData.emergencyContact}
                      onChange={(e) => updateForm('emergencyContact', e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                  <div className="form-field">
                    <Label className="form-label">Phone</Label>
                    <Input
                      value={formData.emergencyPhone}
                      onChange={(e) => updateForm('emergencyPhone', e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="form-field">
                    <Label className="form-label">Relation</Label>
                    <Input
                      value={formData.emergencyRelation}
                      onChange={(e) => updateForm('emergencyRelation', e.target.value)}
                      placeholder="e.g., Spouse, Parent"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Shift Tab */}
            <TabsContent value="shift" className="m-0 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="form-field">
                  <Label className="form-label">Shift</Label>
                  <SearchableSelect
                    options={shiftOptions}
                    value={formData.shift}
                    onChange={(value) => updateForm('shift', value)}
                    placeholder="Select shift"
                    addNewLabel="+ Add Shift"
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Work Location</Label>
                  <Input
                    value={formData.workLocation}
                    onChange={(e) => updateForm('workLocation', e.target.value)}
                    placeholder="Location"
                  />
                </div>
              </div>

              <div className="form-field">
                <Label className="form-label">Biometric ID</Label>
                <Input
                  value={formData.biometricId}
                  onChange={(e) => updateForm('biometricId', e.target.value)}
                  placeholder="Enter biometric ID"
                />
              </div>
            </TabsContent>

            {/* Leave Tab */}
            <TabsContent value="leave" className="m-0 space-y-6">
              <div className="form-field">
                <Label className="form-label">Leave Policy</Label>
                <Select
                  value={formData.leavePolicy}
                  onValueChange={(value) => updateForm('leavePolicy', value)}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Policy</SelectItem>
                    <SelectItem value="probation">Probation Policy</SelectItem>
                    <SelectItem value="contract">Contract Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="form-field">
                  <Label className="form-label">Casual Leave</Label>
                  <Input
                    type="number"
                    value={formData.casualLeave}
                    onChange={(e) => updateForm('casualLeave', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Sick Leave</Label>
                  <Input
                    type="number"
                    value={formData.sickLeave}
                    onChange={(e) => updateForm('sickLeave', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Earned Leave</Label>
                  <Input
                    type="number"
                    value={formData.earnedLeave}
                    onChange={(e) => updateForm('earnedLeave', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Salary Tab */}
            <TabsContent value="salary" className="m-0 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="form-field">
                  <Label className="form-label">Grade Pay</Label>
                  <SearchableSelect
                    options={gradePayOptions}
                    value={formData.gradePay}
                    onChange={(value) => updateForm('gradePay', value)}
                    placeholder="Select grade"
                    addNewLabel="+ Add Grade Pay"
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Basic Salary</Label>
                  <Input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => updateForm('basicSalary', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6">
                <div className="form-field">
                  <Label className="form-label">HRA</Label>
                  <Input
                    type="number"
                    value={formData.hra}
                    onChange={(e) => updateForm('hra', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Conveyance</Label>
                  <Input
                    type="number"
                    value={formData.conveyance}
                    onChange={(e) => updateForm('conveyance', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Medical</Label>
                  <Input
                    type="number"
                    value={formData.medical}
                    onChange={(e) => updateForm('medical', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Special Allowance</Label>
                  <Input
                    type="number"
                    value={formData.specialAllowance}
                    onChange={(e) => updateForm('specialAllowance', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-field">
                  <Label className="form-label">PF Contribution</Label>
                  <Input
                    type="number"
                    value={formData.pf}
                    onChange={(e) => updateForm('pf', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">ESI Contribution</Label>
                  <Input
                    type="number"
                    value={formData.esi}
                    onChange={(e) => updateForm('esi', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="section-header mb-4">Bank Details</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="form-field">
                    <Label className="form-label">Bank Name</Label>
                    <Input
                      value={formData.bankName}
                      onChange={(e) => updateForm('bankName', e.target.value)}
                      placeholder="Bank name"
                    />
                  </div>
                  <div className="form-field">
                    <Label className="form-label">Account Number</Label>
                    <Input
                      value={formData.accountNumber}
                      onChange={(e) => updateForm('accountNumber', e.target.value)}
                      placeholder="Account number"
                    />
                  </div>
                  <div className="form-field">
                    <Label className="form-label">IFSC Code</Label>
                    <Input
                      value={formData.ifscCode}
                      onChange={(e) => updateForm('ifscCode', e.target.value.toUpperCase())}
                      placeholder="IFSC code"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Personal Tab */}
            <TabsContent value="personal" className="m-0 space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="form-field">
                  <Label className="form-label">Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => updateForm('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-field">
                  <Label className="form-label">Blood Group</Label>
                  <Select
                    value={formData.bloodGroup}
                    onValueChange={(value) => updateForm('bloodGroup', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="form-field">
                  <Label className="form-label">Marital Status</Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => updateForm('maritalStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-field">
                  <Label className="form-label">Nationality</Label>
                  <Input
                    value={formData.nationality}
                    onChange={(e) => updateForm('nationality', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Religion</Label>
                  <Input
                    value={formData.religion}
                    onChange={(e) => updateForm('religion', e.target.value)}
                    placeholder="Religion"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-field">
                  <Label className="form-label">Aadhar Number</Label>
                  <Input
                    value={formData.aadharNumber}
                    onChange={(e) => updateForm('aadharNumber', e.target.value)}
                    placeholder="0000 0000 0000"
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">PAN Number</Label>
                  <Input
                    value={formData.panNumber}
                    onChange={(e) => updateForm('panNumber', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="m-0 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Workflow Status</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: <span className="font-medium capitalize">{workflowStatus.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateEmail('welcome')}
                      disabled={emailTemplates.welcome}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {emailTemplates.welcome ? 'Welcome Sent' : 'Send Welcome Email'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateEmail('credentials')}
                      disabled={emailTemplates.credentials}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {emailTemplates.credentials ? 'Credentials Sent' : 'Send Credentials'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateEmail('contract')}
                      disabled={emailTemplates.contract}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {emailTemplates.contract ? 'Contract Sent' : 'Send Contract'}
                    </Button>
                  </div>
                </div>

                <EmployeeDocuments
                  employeeId={formData.employeeCode || 'new'}
                  documents={employeeDocuments}
                  onUpload={handleDocumentUpload}
                  onDelete={handleDocumentDelete}
                  currentUserId={user?.id || ''}
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between py-4 border-t border-border mt-auto">
          <Button variant="outline" onClick={() => navigate('/hr/employees')}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleCreate} disabled={isSaving || !formData.firstName || !formData.email}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Employee
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
