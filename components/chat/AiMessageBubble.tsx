import React from "react";

/** Renders inline markdown: **bold**, *italic*, `code`, and [links](url) */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Split on bold (**), italic (*), inline code (`), and markdown links
  const parts = text.split(/(\*\*[\s\S]+?\*\*|\*[^*]+?\*|`[^`]+?`|\[[\s\S]*?\]\(https?:\/\/\S+?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-[#f4f4f4]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-white/10 rounded px-1 font-mono text-xs text-[#e2e8f0]">{part.slice(1, -1)}</code>;
    }
    const linkMatch = part.match(/\[([\s\S]*?)\]\((https?:\/\/\S+?)\)/);
    if (linkMatch) {
      return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-[#c4b5fd] font-semibold underline break-all">{linkMatch[1]}</a>;
    }
    return <span key={i}>{part}</span>;
  });
}

/** Renders a block of AI text, splitting on blank lines into paragraphs */
function renderMarkdownBlock(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/);
  if (paragraphs.length === 1) {
    // Single paragraph — render lines
    const lines = text.split('\n');
    return lines.map((line, i) => (
      <span key={i}>
        {renderInlineMarkdown(line)}
        {i < lines.length - 1 && <br />}
      </span>
    ));
  }
  return paragraphs.map((para, i) => (
    <p key={i} className="m-0 mb-1 last:mb-0">
      {renderInlineMarkdown(para)}
    </p>
  ));
}

export function AiTextBlock({ text }: { text: string }) {
  const trimmed = text.trim();
  return (
    <div className="max-w-[324px] w-full ml-0 mr-auto flex flex-col gap-[6px] self-start">
      <div className="m-0 font-inter font-normal text-base leading-[145%] text-[#d5d5d5] overflow-anywhere wrap-break-word">
        {renderMarkdownBlock(trimmed)}
      </div>
    </div>
  );
}

export function ThinkingRow() {
  return (
    <div className="mb-4 flex flex-row items-end gap-2 ml-0 mr-auto self-start">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes thinking-dots {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .thinking-dot {
          animation: thinking-dots 1.2s infinite ease-in-out;
        }
      `}} />

      {/* Avatar (Left) */}
      <div className="w-8 h-8 rounded-full bg-[#3ec6c6] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(62,198,198,0.2)]">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>

      {/* Thought Bubble (Right) */}
      <div className="relative">
        <div className="bg-[#18181b]/85 backdrop-blur-md border border-[#7c5cfc]/20 px-4 py-3 rounded-2xl flex flex-row gap-1.5 items-center justify-center min-w-[70px] h-[38px] box-border shadow-lg">
          <span className="thinking-dot w-2 h-2 rounded-full bg-[#a78bfa]" style={{ animationDelay: "0s" }} />
          <span className="thinking-dot w-2 h-2 rounded-full bg-[#a78bfa]" style={{ animationDelay: "0.2s" }} />
          <span className="thinking-dot w-2 h-2 rounded-full bg-[#a78bfa]" style={{ animationDelay: "0.4s" }} />
        </div>
        
        {/* Thought bubble trail dots */}
        <div className="w-2 h-2 rounded-full bg-[#18181b]/85 border border-[#7c5cfc]/20 absolute -bottom-1 -left-1 box-border" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#18181b]/85 border border-[#7c5cfc]/20 absolute -bottom-2 -left-2 box-border" />
      </div>
    </div>
  );
}
