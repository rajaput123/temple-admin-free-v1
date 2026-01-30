import { ProjectTask } from '@/types/projects';

export interface CriticalPathResult {
  criticalTasks: string[]; // Task IDs on critical path
  totalDuration: number;
  float: Record<string, number>; // Task ID -> float days
}

/**
 * Mock critical path calculation algorithm
 * In a real implementation, this would use proper CPM (Critical Path Method) algorithm
 */
export function calculateCriticalPath(tasks: ProjectTask[]): CriticalPathResult {
  const criticalTasks: string[] = [];
  const float: Record<string, number> = {};

  // Simple mock: tasks with dependencies and longest duration are critical
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  
  // Calculate earliest start and finish times
  const earliestStart: Record<string, number> = {};
  const earliestFinish: Record<string, number> = {};
  
  // Topological sort (simplified)
  const processed = new Set<string>();
  const queue: string[] = tasks.filter(t => t.dependencies.length === 0).map(t => t.id);
  
  while (queue.length > 0) {
    const taskId = queue.shift()!;
    if (processed.has(taskId)) continue;
    
    const task = taskMap.get(taskId)!;
    const depFinishTimes = task.dependencies
      .map(depId => earliestFinish[depId] || 0)
      .filter(t => t > 0);
    
    earliestStart[taskId] = depFinishTimes.length > 0 ? Math.max(...depFinishTimes) : 0;
    earliestFinish[taskId] = earliestStart[taskId] + task.estimatedDuration;
    
    processed.add(taskId);
    
    // Add dependent tasks to queue
    tasks.forEach(t => {
      if (t.dependencies.includes(taskId) && !processed.has(t.id)) {
        queue.push(t.id);
      }
    });
  }
  
  // Calculate latest start and finish times
  const latestFinish: Record<string, number> = {};
  const latestStart: Record<string, number> = {};
  
  const projectEnd = Math.max(...Object.values(earliestFinish));
  
  // Reverse topological sort
  const reverseQueue: string[] = tasks.filter(t => {
    return !tasks.some(other => other.dependencies.includes(t.id));
  }).map(t => t.id);
  
  while (reverseQueue.length > 0) {
    const taskId = reverseQueue.shift()!;
    const task = taskMap.get(taskId)!;
    
    const dependentTasks = tasks.filter(t => t.dependencies.includes(taskId));
    if (dependentTasks.length === 0) {
      latestFinish[taskId] = projectEnd;
    } else {
      const depStartTimes = dependentTasks.map(t => latestStart[t.id] || projectEnd);
      latestFinish[taskId] = Math.min(...depStartTimes);
    }
    
    latestStart[taskId] = latestFinish[taskId] - task.estimatedDuration;
    
    // Add dependency tasks to queue
    task.dependencies.forEach(depId => {
      if (!reverseQueue.includes(depId)) {
        reverseQueue.push(depId);
      }
    });
  }
  
  // Calculate float and identify critical path
  tasks.forEach(task => {
    const taskFloat = latestStart[task.id] - earliestStart[task.id];
    float[task.id] = taskFloat;
    
    if (taskFloat === 0) {
      criticalTasks.push(task.id);
    }
  });
  
  return {
    criticalTasks,
    totalDuration: projectEnd,
    float,
  };
}
