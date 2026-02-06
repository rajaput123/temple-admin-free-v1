import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { KnowledgeDocument } from '@/types/knowledge';

function retrieve(question: string, publishedDocs: KnowledgeDocument[]) {
  const q = question.toLowerCase();
  const scored = publishedDocs
    .map((d) => {
      const hay = `${d.title} ${d.aiSummary || ''} ${(d.chunks || []).map((c) => c.text).join(' ')}`.toLowerCase();
      const score = q.split(/\s+/).filter(Boolean).reduce((s, term) => (hay.includes(term) ? s + 1 : s), 0);
      return { d, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0]?.d || null;
}

export function DevoteeChatPanel({ documents }: { documents: KnowledgeDocument[] }) {
  const publishedDocs = useMemo(() => documents.filter((d) => d.status === 'published'), [documents]);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; sources?: string[] }>>(
    [],
  );

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: 'user', content: q }]);

    const hit = retrieve(q, publishedDocs);
    if (!hit) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I could not find an answer in published knowledge yet. Please try a different question.' },
      ]);
      setInput('');
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `From published knowledge, here is a concise answer: ${hit.aiSummary || 'Please refer to the source document.'}`,
        sources: [hit.title],
      },
    ]);
    setInput('');
  };

  return (
    <Card className="p-4 flex flex-col min-h-[560px]">
      <div className="text-sm font-semibold text-foreground">Ask about published knowledge</div>
      <div className="text-xs text-muted-foreground mt-1">
        Only published documents are used as sources.
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto border rounded-md p-3 bg-background">
        {messages.map((m, idx) => (
          <div key={idx} className="text-sm">
            <div className="text-xs text-muted-foreground">{m.role === 'user' ? 'You' : 'Assistant'}</div>
            <div className="text-foreground whitespace-pre-wrap">{m.content}</div>
            {m.sources?.length ? (
              <div className="text-xs text-muted-foreground mt-1">Source: {m.sources.join(', ')}</div>
            ) : null}
          </div>
        ))}
        {messages.length === 0 ? (
          <div className="text-sm text-muted-foreground">Ask a question to get started.</div>
        ) : null}
      </div>

      <div className="mt-3 flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question…" />
        <Button onClick={send}>Send</Button>
      </div>
    </Card>
  );
}

