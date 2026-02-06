import type { KnowledgeActivityEvent } from '@/types/knowledge';

export function ActivityTimeline({ events }: { events: KnowledgeActivityEvent[] }) {
  if (!events.length) {
    return <div className="text-sm text-muted-foreground">No activity yet.</div>;
  }

  return (
    <div className="space-y-3">
      {events.slice(0, 10).map((evt) => (
        <div key={evt.id} className="flex items-start gap-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-muted-foreground/40" />
          <div className="flex-1">
            <div className="text-sm text-foreground">{evt.message}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {new Date(evt.timestamp).toLocaleString('en-IN')} • {evt.actor}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

