'use client';

import { useState } from 'react';
import type { NpcResult } from '@/types/npc';

interface MarkdownOutputProps {
  npc: NpcResult | null;
}

export function MarkdownOutput({ npc }: MarkdownOutputProps) {
  const [copied, setCopied] = useState(false);

  const markdown = npc?.markdown ?? '// No output yet — configure the NPC on the left.';

  function handleCopy() {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleDownload() {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${npc?.name?.replace(/\s+/g, '_') ?? 'npc'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-surface">
        <span className="text-[11px] uppercase tracking-widest text-teal">Raw Markdown</span>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="text-[11px] font-mono border border-border/50 bg-surface-2 hover:border-accent hover:text-accent text-muted-foreground rounded px-2.5 py-1 transition-all"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="text-[11px] font-mono border border-accent/60 bg-accent/10 hover:bg-accent/20 text-accent rounded px-2.5 py-1 transition-all"
          >
            Download .md
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <pre className="text-[11.5px] font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {markdown}
        </pre>
      </div>
    </div>
  );
}
