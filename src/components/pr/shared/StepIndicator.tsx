import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isPending = stepNumber > currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  'h-10 w-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors',
                  isCompleted
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : isCurrent
                      ? 'bg-amber-100 border-amber-500 text-amber-700'
                      : 'bg-white border-gray-300 text-gray-400'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  isCurrent ? 'text-amber-700' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4 transition-colors',
                  isCompleted ? 'bg-amber-500' : 'bg-gray-300'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
