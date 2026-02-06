import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, canAccessModule, canWrite, Permission } from '@/lib/permissions';
import { useMemo } from 'react';

export function usePermissions() {
  const { user } = useAuth();

  const checkPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    };
  }, [user]);

  const checkModuleAccess = useMemo(() => {
    return (module: 'employees' | 'organization' | 'shifts' | 'leave' | 'attendance' | 'expenses' | 'payroll' | 'structure' | 'rituals' | 'inventory' | 'items' | 'stock_entries' | 'purchase_orders' | 'kitchen' | 'recipes' | 'production' | 'kitchen_stores' | 'prasad' | 'prasad_master' | 'prasad_distribution' | 'quality' | 'assets' | 'asset_master' | 'asset_movement' | 'asset_audit' | 'maintenance' | 'cv_evidence' | 'disposal' | 'projects' | 'project_master' | 'project_planning' | 'project_budget' | 'project_vendors' | 'project_execution' | 'project_compliance' | 'project_payments' | 'change_requests' | 'communications'): boolean => {
      if (!user) return false;
      return canAccessModule(user.role, module);
    };
  }, [user]);

  const checkWriteAccess = useMemo(() => {
    return (module: 'employees' | 'organization' | 'shifts' | 'leave' | 'attendance' | 'expenses' | 'structure' | 'rituals' | 'inventory' | 'items' | 'stock_entries' | 'purchase_orders' | 'kitchen' | 'recipes' | 'production' | 'kitchen_stores' | 'prasad' | 'prasad_master' | 'prasad_distribution' | 'quality' | 'assets' | 'asset_master' | 'asset_movement' | 'asset_audit' | 'maintenance' | 'cv_evidence' | 'disposal' | 'projects' | 'project_master' | 'project_planning' | 'project_budget' | 'project_vendors' | 'project_execution' | 'project_compliance' | 'project_payments' | 'change_requests' | 'communications', subModule?: string): boolean => {
      if (!user) return false;
      return canWrite(user.role, module);
    };
  }, [user]);

  const isDepartmentHead = useMemo(() => {
    return user?.role === 'department_head';
  }, [user]);

  const isFinance = useMemo(() => {
    return user?.role === 'finance';
  }, [user]);

  const isAudit = useMemo(() => {
    return user?.role === 'audit';
  }, [user]);

  const isReadOnly = useMemo(() => {
    return user?.role === 'audit';
  }, [user]);

  return {
    checkPermission,
    checkModuleAccess,
    checkWriteAccess,
    isDepartmentHead,
    isFinance,
    isAudit,
    isReadOnly,
    user,
  };
}
