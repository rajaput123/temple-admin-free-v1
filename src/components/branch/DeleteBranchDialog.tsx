import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import type { Branch } from '@/types/branch';

interface DeleteBranchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    branch: Branch | null;
    onConfirm: () => void;
}

export function DeleteBranchDialog({ open, onOpenChange, branch, onConfirm }: DeleteBranchDialogProps) {
    if (!branch) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <AlertDialogTitle>Delete Branch?</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="pt-2">
                        This will permanently delete <strong className="text-foreground">{branch.branchName}</strong> ({branch.branchCode}).
                        This action cannot be undone.
                        {branch.status === 'active' && (
                            <div className="mt-2 p-2 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                                <strong>Warning:</strong> This is an active branch. Deleting it may affect ongoing operations.
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                            onOpenChange(false);
                        }}
                    >
                        Delete Branch
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
