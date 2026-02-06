import { Project, ProjectActivity, ProjectMilestone, ProjectFinancialRecord, ProjectDocument } from '@/types/projects';

export const dummyProjects: Project[] = [
    {
        id: 'prj-001',
        name: 'Main Temple Renovation',
        description: 'Multi-year structural restoration and gold gilding of the Gopuram.',
        status: 'delayed',
        category: 'infrastructure',
        managerId: 'EMP001',
        startDate: '2023-01-10',
        endDate: '2025-12-31',
        budget: {
            planned: 1500000,
            actual: 650000,
            currency: 'INR'
        },
        progress: 42,
        lastUpdated: '2024-02-01T10:00:00Z'
    },
    {
        id: 'prj-002',
        name: 'Annadana Hall Digitalization',
        description: 'Implementing smart queue management and automated billing for the kitchen.',
        status: 'active',
        category: 'infrastructure',
        managerId: 'EMP005',
        startDate: '2023-06-01',
        endDate: '2024-06-30',
        budget: {
            planned: 250000,
            actual: 180000,
            currency: 'INR'
        },
        progress: 75,
        lastUpdated: '2024-02-04T15:30:00Z'
    },
    {
        id: 'prj-003',
        name: 'Village Health Camp Series',
        description: 'Organizing 12 mobile health clinics for surrounding rural areas.',
        status: 'proposed',
        category: 'social',
        managerId: 'EMP012',
        startDate: '2024-05-01',
        endDate: '2025-05-01',
        budget: {
            planned: 500000,
            actual: 0,
            currency: 'INR'
        },
        progress: 10,
        lastUpdated: '2024-01-15T09:00:00Z'
    }
];

export const dummyActivities: ProjectActivity[] = [
    {
        id: 'act-1',
        projectId: 'prj-001',
        title: 'Foundation Reinforcement',
        status: 'completed',
        priority: 'urgent',
        progress: 100,
        dueDate: '2023-04-15',
        assignedTo: ['EMP001', 'EMP002']
    },
    {
        id: 'act-2',
        projectId: 'prj-001',
        title: 'Gopuram Scaffolding',
        status: 'in_progress',
        priority: 'high',
        progress: 60,
        dueDate: '2024-03-20',
        assignedTo: ['EMP005']
    },
    {
        id: 'act-3',
        projectId: 'prj-001',
        title: 'Procuring Gold Leaf',
        status: 'blocked',
        priority: 'urgent',
        progress: 20,
        dueDate: '2024-02-15',
        assignedTo: ['EMP001']
    }
];

export const dummyMilestones: ProjectMilestone[] = [
    { id: 'm1', projectId: 'prj-001', title: 'Phase 1: Structural Audit', status: 'completed', dueDate: '2023-03-01', isCritical: true },
    { id: 'm2', projectId: 'prj-001', title: 'Phase 2: External Cleaning', status: 'completed', dueDate: '2023-10-15', isCritical: false },
    { id: 'm3', projectId: 'prj-001', title: 'Phase 3: Gilding Start', status: 'delayed', dueDate: '2024-01-20', isCritical: true },
];

export const dummyProjectFinance: ProjectFinancialRecord[] = [
    { id: 'f1', projectId: 'prj-001', type: 'expense', category: 'Materials', amount: 450000, description: 'Cement and Steel procurement', date: '2023-05-10', recordedBy: 'EMP001' },
    { id: 'f2', projectId: 'prj-001', type: 'expense', category: 'Labor', amount: 120000, description: 'Monthly labor payments - Oct', date: '2023-11-01', recordedBy: 'EMP001' },
    { id: 'f3', projectId: 'prj-001', type: 'income', category: 'Donation', amount: 2000000, description: 'VIP Endowment for restoration', date: '2023-02-15', recordedBy: 'EMP003' },
];

export const dummyProjectDocs: ProjectDocument[] = [
    { id: 'd1', projectId: 'prj-001', name: 'Master_Plan.pdf', type: 'application/pdf', category: 'plan', url: '#', uploadedAt: '2023-01-12', size: '4.5 MB' },
    { id: 'd2', projectId: 'prj-001', name: 'Structural_Audit_Report.pdf', type: 'application/pdf', category: 'report', url: '#', uploadedAt: '2023-03-05', size: '12 MB' },
    { id: 'd3', projectId: 'prj-001', name: 'Contractor_Agreement.pdf', type: 'application/pdf', category: 'contract', url: '#', uploadedAt: '2023-01-20', size: '2.1 MB' },
];
