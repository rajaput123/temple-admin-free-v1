import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Link, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const formatBold = () => insertText('<strong>', '</strong>');
  const formatItalic = () => insertText('<em>', '</em>');
  const formatHeading = () => insertText('<h3>', '</h3>');
  const formatList = () => insertText('<ul>\n<li>', '</li>\n</ul>');
  const formatOrderedList = () => insertText('<ol>\n<li>', '</li>\n</ol>');
  const formatLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const text = textareaRef.current?.value.substring(
        textareaRef.current.selectionStart,
        textareaRef.current.selectionEnd
      ) || 'link';
      insertText(`<a href="${url}">${text}</a>`, '');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 p-1 border rounded-lg bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={formatBold}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={formatItalic}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={formatHeading}
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={formatList}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={formatOrderedList}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={formatLink}
          title="Link"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Enter announcement description...'}
        rows={10}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>HTML formatting supported</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}
