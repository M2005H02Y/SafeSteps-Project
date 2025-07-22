
"use client";

import React, { useState, useRef, useEffect } from 'react';
import ContentEditable from 'react-contenteditable';
import sanitizeHtml from 'sanitize-html';
import { Bold, Underline, Pilcrow, Highlighter } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface RichTextEditorProps {
  initialValue: string;
  onChange: (html: string) => void;
}

const ToolbarButton = ({ cmd, arg, icon, children }: { cmd: string; arg?: string; icon?: React.ReactNode; children?: React.ReactNode }) => {
  const { toast } = useToast();

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent editor from losing focus
    if (document.queryCommandSupported(cmd)) {
      document.execCommand(cmd, false, arg);
    } else {
        toast({
            title: "Fonction non supportée",
            description: `La commande de formatage "${cmd}" n'est pas supportée par votre navigateur.`,
            variant: "destructive"
        })
    }
    // Manually trigger a re-render/update if needed
    const event = new Event('input', { bubbles: true });
    e.currentTarget.closest('.rich-text-editor-container')?.querySelector('[contenteditable]')?.dispatchEvent(event);
  };
  
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 px-2"
      onMouseDown={handleMouseDown}
      aria-label={cmd}
    >
      {icon || children}
    </Button>
  );
};


export default function RichTextEditor({ initialValue, onChange }: RichTextEditorProps) {
  const [html, setHtml] = useState(initialValue);
  const text = useRef(initialValue);

  const sanitizeConf = {
    allowedTags: ["b", "i", "u", "br", "p", "strong", "em", "div", "h3"],
    allowedAttributes: { 'div': ['style'], 'h3': ['style'] }
  };
  
  const handleChange = (e: any) => {
    const newHtml = e.target.value;
    text.current = newHtml;
    onChange(sanitizeHtml(newHtml, sanitizeConf));
  };
  
  useEffect(() => {
    // Keep internal state in sync if initialValue changes from outside
    setHtml(initialValue);
    text.current = initialValue;
  }, [initialValue]);


  return (
    <div className="border rounded-md rich-text-editor-container">
      <div className="flex items-center gap-2 p-2 border-b bg-slate-50">
        <ToolbarButton cmd="bold" icon={<Bold />} />
        <ToolbarButton cmd="underline" icon={<Underline />} />
        <ToolbarButton cmd="formatBlock" arg="h3" icon={<Pilcrow />} />
      </div>
      <ContentEditable
        tagName="div"
        className="p-3 min-h-[150px] text-sm focus:outline-none prose prose-sm max-w-none"
        html={text.current}
        onChange={handleChange}
      />
    </div>
  );
}
