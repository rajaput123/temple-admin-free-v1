export type ProjectStatus = 'proposed' | 'active' | 'on_hold' | 'delayed' | 'completed' | 'cancelled';

export interface ProjectActivity {
    id: string;
    projectId: string;
    title: string;
    description?: string;
    assignedTo?: string[];
    priority: 'low' | 'normal' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    dueDate: string;
    progress: number; // 0-100
}

export interface ProjectMilestone {
    id: string;
    projectId: string;
    title: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'delayed';
    isCritical: boolean;
}

export interface ProjectFinancialRecord {
    id: string;
    projectId: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
    recordedBy: string;
}

export interface ProjectDocument {
    id: string;
    projectId: string;
    name: string;
    type: string;
    category: 'plan' | 'contract' | 'report' | 'other';
    url: string;
    uploadedAt: string;
    size: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    category: 'infrastructure' | 'outreach' | 'ritual' | 'social';
    managerId: string;
    startDate: string;
    endDate: string;
    budget: {
        planned: number;
        actual: number;
        currency: string;
    };
    progress: number; // Overall progress
    lastUpdated: string;
}
