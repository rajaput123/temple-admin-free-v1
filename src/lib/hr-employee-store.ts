import type { Employee } from '@/types/erp';
import { employees as initialEmployees } from '@/data/hr-dummy-data';

const STORAGE_KEY = 'hr_employees_v1';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getEmployees(): Employee[] {
  const fromStorage = safeParse<Employee[]>(sessionStorage.getItem(STORAGE_KEY));
  if (fromStorage && Array.isArray(fromStorage)) return fromStorage;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initialEmployees));
  return initialEmployees;
}

export function setEmployees(next: Employee[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function addEmployee(employee: Employee) {
  const current = getEmployees();
  const next = [...current, employee];
  setEmployees(next);
  return employee;
}

