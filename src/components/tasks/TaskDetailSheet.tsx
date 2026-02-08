import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, User, Tag, MessageSquare, FileText, Clock, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '@/types/tasks';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';
import { updateTask, addTaskComment, updateSubtask } from '@/lib/task-store';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getEmployees } from '@/lib/hr-employee-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TaskDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onTaskUpdate?: () => void;
}

export function TaskDetailSheet({ open, onOpenChange, task, onTaskUpdate }: TaskDetailSheetProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  
  // Get employees from HR module
  const employees = useMemo(() => getEmployees().filter(emp => emp.status === 'active'), []);
  
  // Get current assignee employee details
  const currentAssignee = useMemo(() => {
    if (!task?.assigneeId) return null;
    return employees.find(emp => emp.id === task.assigneeId);
  }, [employees, task?.assigneeId]);

  if (!task) return null;

  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { status }, user?.email || 'admin', user?.name || 'Admin');
    toast.success('Status updated');
    onTaskUpdate?.();
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    updateTask(task.id, { priority }, user?.email || 'admin', user?.name || 'Admin');
    toast.success('Priority updated');
    onTaskUpdate?.();
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addTaskComment(task.id, commentText, user?.email || 'admin', user?.name || 'Admin');
    setCommentText('');
    toast.success('Comment added');
    onTaskUpdate?.();
  };

  const handleSubtaskToggle = (subtaskId: string, completed: boolean) => {
    updateSubtask(task.id, subtaskId, completed, user?.email || 'admin', user?.name || 'Admin');
    onTaskUpdate?.();
  };

  const dueDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = dueDate < today && task.status !== 'completed' && task.status !== 'cancelled';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{task.title}</SheetTitle>
          <SheetDescription className="flex items-center gap-2 mt-2">
            <Tag className="h-4 w-4" />
            {task.module.toUpperCase()} • {task.branchName || 'No Branch'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1">Status</Label>
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1">Priority</Label>
              <Select value={task.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Task Summary */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Assignee
                </div>
                {!isEditingAssignee ? (
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">{task.assigneeName}</span>
                    {task.assigneeId && (
                      <>
                        <ExternalLink 
                          className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer"
                          onClick={() => navigate(`/hr/employees/${task.assigneeId}`)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setIsEditingAssignee(true)}
                        >
                          Change
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Select
                      value={task.assigneeId}
                      onValueChange={(newAssigneeId) => {
                        const newAssignee = employees.find(emp => emp.id === newAssigneeId);
                        if (newAssignee) {
                          updateTask(
                            task.id,
                            {
                              assigneeId: newAssigneeId,
                              assigneeName: newAssignee.name,
                              departmentId: newAssignee.department,
                              departmentName: newAssignee.department,
                            },
                            user?.email || 'admin',
                            user?.name || 'Admin'
                          );
                          toast.success('Assignee updated');
                          setIsEditingAssignee(false);
                          onTaskUpdate?.();
                        }
                      }}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setIsEditingAssignee(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {currentAssignee && (
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    {currentAssignee.designation && (
                      <div>Designation: {currentAssignee.designation}</div>
                    )}
                    {currentAssignee.department && (
                      <div>Department: {currentAssignee.department}</div>
                    )}
                    {currentAssignee.email && (
                      <div>Email: {currentAssignee.email}</div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due Date
                </div>
                <div className={`text-foreground font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {format(dueDate, 'MMM dd, yyyy')}
                  {isOverdue && <AlertCircle className="h-4 w-4 inline ml-1" />}
                </div>
              </div>
              {currentAssignee?.department && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Department</div>
                  <div className="text-foreground font-medium">{currentAssignee.department}</div>
                  <p className="text-xs text-muted-foreground mt-1">From employee record</p>
                </div>
              )}
              <div>
                <div className="text-xs text-muted-foreground mb-1">Created</div>
                <div className="text-foreground font-medium">
                  {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
          </Card>

          {/* Description */}
          {task.description && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
            </Card>
          )}

          {/* Accordion Sections */}
          <Accordion type="multiple" className="w-full">
            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <AccordionItem value="subtasks">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Subtasks ({task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={(checked) => handleSubtaskToggle(subtask.id, checked === true)}
                        />
                        <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <AccordionItem value="attachments">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Attachments ({task.attachments.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {task.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{attachment.fileName}</span>
                        <Button variant="ghost" size="sm">Download</Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Activity Log */}
            {task.activityLog && task.activityLog.length > 0 && (
              <AccordionItem value="activity">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Activity Log ({task.activityLog.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {task.activityLog.map((activity) => (
                      <div key={activity.id} className="flex gap-3 text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{activity.action}</div>
                          <div className="text-xs text-muted-foreground">
                            {activity.userName} • {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Comments */}
            <AccordionItem value="comments">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Comments ({task.comments?.length || 0})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {task.comments && task.comments.length > 0 && (
                    <div className="space-y-3">
                      {task.comments.map((comment) => (
                        <div key={comment.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{comment.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                    />
                    <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                      Add Comment
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Approval Controls */}
            {task.approvalRequired && task.status === 'pending_approval' && (
              <AccordionItem value="approval">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Approval Controls</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      This task requires approval before it can be completed.
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          handleStatusChange('completed');
                          toast.success('Task approved');
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleStatusChange('cancelled');
                          toast.success('Task rejected');
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
