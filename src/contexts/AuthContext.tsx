import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types/erp';
import { mockPlatformUsers } from '@/data/platform-users';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo users for different roles
const demoUsers: Record<string, User> = {
  'admin@temple.org': {
    id: '1',
    name: 'Ramesh Sharma',
    email: 'admin@temple.org',
    role: 'super_admin',
    templeName: 'Sringeri Sharadamba Temple',
    subscriptionTier: 'premium',
  },
  'hr@temple.org': {
    id: '2',
    name: 'Lakshmi Devi',
    email: 'hr@temple.org',
    role: 'hr_manager',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'depthead@temple.org': {
    id: '4',
    name: 'Suresh Kumar',
    email: 'depthead@temple.org',
    role: 'department_head',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'finance@temple.org': {
    id: '5',
    name: 'Priya Menon',
    email: 'finance@temple.org',
    role: 'finance',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'audit@temple.org': {
    id: '6',
    name: 'Rajesh Nair',
    email: 'audit@temple.org',
    role: 'audit',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'priest@temple.org': {
    id: '3',
    name: 'Pandit Subramaniam',
    email: 'priest@temple.org',
    role: 'priest',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'inventory@temple.org': {
    id: '7',
    name: 'Vikram Singh',
    email: 'inventory@temple.org',
    role: 'inventory_admin',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'storekeeper@temple.org': {
    id: '8',
    name: 'Ramesh Kumar',
    email: 'storekeeper@temple.org',
    role: 'store_keeper',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'purchase@temple.org': {
    id: '9',
    name: 'Anita Desai',
    email: 'purchase@temple.org',
    role: 'purchase_manager',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'kitchen@temple.org': {
    id: '10',
    name: 'Meena Singh',
    email: 'kitchen@temple.org',
    role: 'kitchen_supervisor',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'kitchenadmin@temple.org': {
    id: '14',
    name: 'Arjun Kitchen',
    email: 'kitchenadmin@temple.org',
    role: 'kitchen_admin',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'productionsupervisor@temple.org': {
    id: '15',
    name: 'Ravi Production',
    email: 'productionsupervisor@temple.org',
    role: 'production_supervisor',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'quality@temple.org': {
    id: '16',
    name: 'Sita Quality',
    email: 'quality@temple.org',
    role: 'quality_incharge',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'assetadmin@temple.org': {
    id: '17',
    name: 'Kiran Asset',
    email: 'assetadmin@temple.org',
    role: 'asset_admin',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'assetmanager@temple.org': {
    id: '18',
    name: 'Ravi Manager',
    email: 'assetmanager@temple.org',
    role: 'asset_manager',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'trustee@temple.org': {
    id: '19',
    name: 'Trustee Member',
    email: 'trustee@temple.org',
    role: 'trustee',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'projectadmin@temple.org': {
    id: '26',
    name: 'Project Admin',
    email: 'projectadmin@temple.org',
    role: 'project_admin',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'projectmanager@temple.org': {
    id: '27',
    name: 'Project Manager',
    email: 'projectmanager@temple.org',
    role: 'project_manager',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'siteengineer@temple.org': {
    id: '28',
    name: 'Site Engineer',
    email: 'siteengineer@temple.org',
    role: 'site_engineer',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'pradmin@temple.org': {
    id: '29',
    name: 'PR Admin',
    email: 'pradmin@temple.org',
    role: 'pr_admin',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'prmanager@temple.org': {
    id: '30',
    name: 'PR Manager',
    email: 'prmanager@temple.org',
    role: 'pr_manager',
    templeName: 'Sringeri Sharadamba Temple',
  },
  'contenteditor@temple.org': {
    id: '31',
    name: 'Content Editor',
    email: 'contenteditor@temple.org',
    role: 'content_editor',
    templeName: 'Sringeri Sharadamba Temple',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, _password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // First check demo users, then platform users
    let foundUser = demoUsers[email.toLowerCase()];
    if (!foundUser) {
      foundUser = mockPlatformUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
    
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    
    // Default to super admin for demo
    setUser(demoUsers['admin@temple.org']);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const hasPermission = useCallback((roles: UserRole[]) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
