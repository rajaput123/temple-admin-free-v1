import { useMemo, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight, Send, FileText, MessageSquare, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import type { KnowledgeBetaChatMessage, KnowledgeBetaChatSession, KnowledgeCategory, KnowledgeDocument } from '@/types/knowledge';
import { addBetaMessage, createBetaSession, getKnowledgeState } from '@/lib/knowledge-store';
import { AnimatedCharacter } from './AnimatedCharacter';
import { LanguageSelector, type Language } from './LanguageSelector';
import { AudioConversation } from '@/lib/audio-conversation';

function mockAnswer(question: string, docs: KnowledgeDocument[]) {
  const q = question.toLowerCase();
  const candidates = docs.filter((d) => (d.aiSummary || '').toLowerCase().includes(q) || (d.title || '').toLowerCase().includes(q));
  const picked = candidates[0] || docs[0];
  if (!picked) {
    return { text: 'No knowledge found in the current scope.', sources: [] as Array<{ documentId: string; title: string }> };
  }
  return {
    text: `Based on "${picked.title}", here is a concise answer: ${picked.aiSummary || 'Refer to the document for details.'}`,
    sources: [{ documentId: picked.id, title: picked.title }],
  };
}

function getStatusBadge(status: KnowledgeDocument['status']) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-gray-500/10 text-gray-700 dark:text-gray-300' },
    uploaded: { label: 'Uploaded', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
    processing: { label: 'Processing', className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300' },
    pending_approval: { label: 'Pending', className: 'bg-orange-500/10 text-orange-700 dark:text-orange-300' },
    approved: { label: 'Approved', className: 'bg-green-500/10 text-green-700 dark:text-green-300' },
    published: { label: 'Published', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
    rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-700 dark:text-red-300' },
  };
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}

export function BetaChatPanel({
  categories,
  documents,
}: {
  categories: KnowledgeCategory[];
  documents: KnowledgeDocument[];
}) {
  const state = getKnowledgeState();
  const [activeSessionId, setActiveSessionId] = useState<string>(state.betaSessions[0]?.id || '');
  const [input, setInput] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories.map(c => c.id)));
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioConversationRef = useRef<AudioConversation | null>(null);

  // Initialize audio conversation
  useEffect(() => {
    audioConversationRef.current = new AudioConversation(selectedLanguage);
    return () => {
      audioConversationRef.current?.stopListening();
      audioConversationRef.current?.stopSpeaking();
    };
  }, []);

  // Update language when changed
  useEffect(() => {
    if (audioConversationRef.current) {
      audioConversationRef.current.setLanguage(selectedLanguage);
    }
  }, [selectedLanguage]);

  const sessions = state.betaSessions;
  const active = sessions.find((s) => s.id === activeSessionId) || null;

  // Group documents by category
  const docsByCategory = useMemo(() => {
    const map = new Map<string, KnowledgeDocument[]>();
    categories.forEach(cat => map.set(cat.id, []));
    documents.forEach(doc => {
      const docs = map.get(doc.categoryId) || [];
      docs.push(doc);
      map.set(doc.categoryId, docs);
    });
    return map;
  }, [categories, documents]);

  // Get selected documents for testing
  const selectedDocuments = useMemo(() => {
    return Array.from(selectedDocs).map(id => documents.find(d => d.id === id)).filter(Boolean) as KnowledgeDocument[];
  }, [selectedDocs, documents]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages]);

  const send = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;
    
    if (!active) {
      // Create new session if none exists
      const session = createBetaSession({ 
        documentIds: Array.from(selectedDocs),
        includeNonPublished: true 
      });
      setActiveSessionId(session.id);
      setTimeout(() => send(messageText), 100);
      return;
    }

    const userMsg: KnowledgeBetaChatMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString(),
    };
    addBetaMessage(active.id, userMsg);

    const ans = mockAnswer(messageText, selectedDocuments.length > 0 ? selectedDocuments : documents);
    const assistantMsg: KnowledgeBetaChatMessage = {
      id: `m-${Date.now()}-a`,
      role: 'assistant',
      content: ans.text,
      createdAt: new Date().toISOString(),
      sources: ans.sources,
    };
    addBetaMessage(active.id, assistantMsg);

    // Speak the response if audio is enabled
    if (audioEnabled && audioConversationRef.current) {
      setIsSpeaking(true);
      try {
        await audioConversationRef.current.speak(ans.text, selectedLanguage);
      } catch (error) {
        console.error('Speech synthesis error:', error);
      } finally {
        setIsSpeaking(false);
      }
    }

    if (!text) setInput('');
  };

  const startListening = async () => {
    if (!audioConversationRef.current) return;
    
    setIsListening(true);
    try {
      await audioConversationRef.current.startListening(
        (text) => {
          setInput(text);
          setIsListening(false);
          send(text);
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        }
      );
    } catch (error) {
      console.error('Failed to start listening:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    audioConversationRef.current?.stopListening();
    setIsListening(false);
  };

  const startNew = () => {
    const session = createBetaSession({ 
      documentIds: Array.from(selectedDocs),
      includeNonPublished: true 
    });
    setActiveSessionId(session.id);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const toggleDocument = (docId: string) => {
    setSelectedDocs(prev => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Left Sidebar - Categories and Documents */}
      <Card className="w-80 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-foreground mb-2">Select Documents to Test</h3>
          {selectedDocs.size > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              {selectedDocs.size} document{selectedDocs.size !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
            {categories.length === 0 ? (
              <div className="text-xs text-muted-foreground px-2 py-4 text-center">
                No categories available. Create categories in Categories Management.
              </div>
            ) : (
              categories.map((category) => {
              const categoryDocs = docsByCategory.get(category.id) || [];
              const isExpanded = expandedCategories.has(category.id);
              return (
                <div key={category.id} className="space-y-1">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm font-medium text-foreground"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="flex-1 text-left">{category.name}</span>
                    <span className="text-xs text-muted-foreground">({categoryDocs.length})</span>
                  </button>
                  {isExpanded && (
                    <div className="ml-6 space-y-1">
                      {categoryDocs.map((doc) => (
                        <label
                          key={doc.id}
                          className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer group"
                        >
                          <Checkbox
                            checked={selectedDocs.has(doc.id)}
                            onCheckedChange={() => toggleDocument(doc.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-foreground truncate">{doc.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(doc.status)}
                            </div>
                          </div>
                        </label>
                      ))}
                      {categoryDocs.length === 0 && (
                        <div className="text-xs text-muted-foreground px-2 py-1">No documents</div>
                      )}
                    </div>
                  )}
                </div>
              );
            }))}
            </div>
          </ScrollArea>
        </div>
      </Card>

      {/* Main Chat Area - Devotee App Style */}
      <Card className="flex-1 flex flex-col bg-gradient-to-b from-background to-muted/20">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center justify-between bg-background/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Temple Assistant</h3>
              <p className="text-xs text-muted-foreground">Ask me anything about the temple</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector 
              selectedLanguage={selectedLanguage} 
              onLanguageChange={setSelectedLanguage} 
            />
            <Button size="sm" variant="outline" onClick={startNew}>
              New Chat
            </Button>
          </div>
        </div>

        {/* Messages Area with Animated Character */}
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
            {!active?.messages?.length ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center py-12">
                <AnimatedCharacter isSpeaking={isSpeaking} isListening={isListening} />
                <p className="text-sm text-muted-foreground mt-4 mb-2">
                  Select documents and start a conversation
                </p>
                <p className="text-xs text-muted-foreground">
                  You can type or use voice to ask questions
                </p>
              </div>
            ) : (
              <>
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${
                      m.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border border-border text-foreground'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
                      {m.sources?.length ? (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="text-xs opacity-80 mb-1.5 font-medium">Sources:</div>
                          {m.sources.map((s, idx) => (
                            <div key={idx} className="text-xs opacity-80 flex items-center gap-1.5 mb-1">
                              <FileText className="h-3 w-3" />
                              {s.title}
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <div className="text-xs opacity-60 mt-2">
                        {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {m.role === 'user' && (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground text-sm font-medium shadow-md">
                        You
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area - Devotee App Style */}
        <div className="p-4 border-t bg-background/95 backdrop-blur">
          {selectedDocs.size > 0 && (
            <div className="mb-2 text-xs text-muted-foreground text-center">
              Testing {selectedDocs.size} selected document{selectedDocs.size !== 1 ? 's' : ''}
            </div>
          )}
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={`Type your question in ${selectedLanguage === 'en' ? 'English' : 'your language'}...`}
                className="pr-12 rounded-full h-12 text-base"
                disabled={isListening}
              />
              {isListening && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
              )}
            </div>
            
            {/* Audio Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? 'Disable audio' : 'Enable audio'}
            >
              {audioEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>

            {/* Voice Input Button */}
            <Button
              variant={isListening ? 'destructive' : 'default'}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={isListening ? stopListening : startListening}
              disabled={!audioConversationRef.current}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            {/* Send Button */}
            <Button
              onClick={() => send()}
              disabled={!input.trim() || isListening}
              className="h-12 w-12 rounded-full"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
