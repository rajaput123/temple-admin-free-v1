import type { Branch, Region, BranchUserMapping, BranchAccessRule } from '@/types/branch';
import { mockBranches, mockRegions, mockBranchUserMappings, mockBranchAccessRules } from '@/data/branch-dummy-data';

const STORAGE_KEY = 'branch_store_v1';

interface BranchStoreState {
  branches: Branch[];
  regions: Region[];
  branchUserMappings: BranchUserMapping[];
  branchAccessRules: BranchAccessRule[];
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function initState(): BranchStoreState {
  return {
    branches: mockBranches,
    regions: mockRegions,
    branchUserMappings: mockBranchUserMappings,
    branchAccessRules: mockBranchAccessRules,
  };
}

export function getBranchState(): BranchStoreState {
  const stored = safeParse<BranchStoreState>(sessionStorage.getItem(STORAGE_KEY));
  if (stored) return stored;
  const initial = initState();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function setBranchState(state: BranchStoreState): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Branch operations
export function getBranches(): Branch[] {
  return getBranchState().branches.filter(b => !b.deletedAt);
}

export function getBranch(id: string): Branch | undefined {
  return getBranches().find(b => b.id === id);
}

export function createBranch(branch: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): Branch {
  const state = getBranchState();
  const newBranch: Branch = {
    ...branch,
    id: `BRN-${String(state.branches.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };
  state.branches.push(newBranch);
  setBranchState(state);
  return newBranch;
}

export function updateBranch(id: string, updates: Partial<Branch>): Branch | null {
  const state = getBranchState();
  const index = state.branches.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  state.branches[index] = {
    ...state.branches[index],
    ...updates,
    updatedAt: new Date().toISOString().split('T')[0],
  };
  setBranchState(state);
  return state.branches[index];
}

export function deleteBranch(id: string): boolean {
  const state = getBranchState();
  const index = state.branches.findIndex(b => b.id === id);
  if (index === -1) return false;
  
  // Soft delete
  state.branches[index].deletedAt = new Date().toISOString();
  state.branches[index].status = 'inactive';
  setBranchState(state);
  return true;
}

export function getBranchesByRegion(regionId: string): Branch[] {
  return getBranches().filter(b => b.regionId === regionId);
}

export function getBranchesByParent(parentId: string): Branch[] {
  return getBranches().filter(b => b.parentBranchId === parentId);
}

export function getBranchesByType(type: Branch['branchType']): Branch[] {
  return getBranches().filter(b => b.branchType === type);
}

export function getBranchesByStatus(status: Branch['status']): Branch[] {
  return getBranches().filter(b => b.status === status);
}

// Region operations
export function getRegions(): Region[] {
  return getBranchState().regions.filter(r => r.status === 'active');
}

export function getRegion(id: string): Region | undefined {
  return getRegions().find(r => r.id === id);
}

export function createRegion(region: Omit<Region, 'id' | 'createdAt' | 'updatedAt'>): Region {
  const state = getBranchState();
  const newRegion: Region = {
    ...region,
    id: `REG-${String(state.regions.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };
  state.regions.push(newRegion);
  setBranchState(state);
  return newRegion;
}

export function updateRegion(id: string, updates: Partial<Region>): Region | null {
  const state = getBranchState();
  const index = state.regions.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  state.regions[index] = {
    ...state.regions[index],
    ...updates,
    updatedAt: new Date().toISOString().split('T')[0],
  };
  setBranchState(state);
  return state.regions[index];
}

// Branch User Mapping operations
export function getBranchUserMappings(): BranchUserMapping[] {
  return getBranchState().branchUserMappings.filter(m => m.status === 'active');
}

export function getUserBranches(userId: string): BranchUserMapping[] {
  return getBranchUserMappings().filter(m => m.employeeId === userId);
}

export function getBranchUsers(branchId: string): BranchUserMapping[] {
  return getBranchUserMappings().filter(m => m.branchId === branchId);
}

export function createBranchUserMapping(mapping: Omit<BranchUserMapping, 'id' | 'createdAt' | 'updatedAt'>): BranchUserMapping {
  const state = getBranchState();
  const newMapping: BranchUserMapping = {
    ...mapping,
    id: `BUM-${String(state.branchUserMappings.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };
  state.branchUserMappings.push(newMapping);
  setBranchState(state);
  return newMapping;
}

export function updateBranchUserMapping(id: string, updates: Partial<BranchUserMapping>): BranchUserMapping | null {
  const state = getBranchState();
  const index = state.branchUserMappings.findIndex(m => m.id === id);
  if (index === -1) return null;
  
  state.branchUserMappings[index] = {
    ...state.branchUserMappings[index],
    ...updates,
    updatedAt: new Date().toISOString().split('T')[0],
  };
  setBranchState(state);
  return state.branchUserMappings[index];
}

// Branch Access Rules operations
export function getBranchAccessRules(): BranchAccessRule[] {
  return getBranchState().branchAccessRules;
}

export function getBranchAccessRule(moduleName: string): BranchAccessRule | undefined {
  return getBranchAccessRules().find(r => r.moduleName === moduleName);
}

export function updateBranchAccessRule(moduleName: string, updates: Partial<BranchAccessRule>): BranchAccessRule | null {
  const state = getBranchState();
  const index = state.branchAccessRules.findIndex(r => r.moduleName === moduleName);
  if (index === -1) return null;
  
  state.branchAccessRules[index] = {
    ...state.branchAccessRules[index],
    ...updates,
    updatedAt: new Date().toISOString().split('T')[0],
  };
  setBranchState(state);
  return state.branchAccessRules[index];
}
