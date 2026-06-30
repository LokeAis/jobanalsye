import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * Minimal Markdown renderer for our own legal docs (docs/*.md), imported as raw
 * strings. Single source of truth — no duplicated copy. Strips editorial
 * blockquotes (lines starting with ">") and anything after the first horizontal
 * rule ("---"), where internal checklists live.
 * Supports: #/##/### headings, "- " lists, paragraphs, **bold**, `code`, [text](url).
 */

function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/;
  let rest = text;
  let key = 0;
  while (rest) {
    const m = rest.match(regex);
    if (!m || m.index === undefined) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    if (m[1]) out.push(<strong key={key++}>{m[2]}</strong>);
    else if (m[3])
      out.push(
        <code key={key++} className="text-[0.85em] bg-slate-100 px-1 py-0.5 rounded">
          {m[4]}
        </code>
      );
    else if (m[5])
      out.push(
        <a
          key={key++}
          href={m[7]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-700 underline hover:text-teal-800"
        >
          {m[6]}
        </a>
      );
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}

export default function LegalView({
  source,
  onBack,
}: {
  source: string;
  onBack: () => void;
}) {
  const body = source.split(/\n---\n/)[0];
  const lines = body.split('\n');
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let para: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      blocks.push(
        <p key={key++} className="text-slate-600 text-sm leading-relaxed mb-3">
          {renderInline(para.join(' '))}
        </p>
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={key++} className="list-disc pl-5 space-y-1 mb-3 text-slate-600 text-sm">
          {list.map((li, i) => (
            <li key={i}>{renderInline(li)}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('>')) continue; // editorial note, not for users
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    if (line.startsWith('### ')) {
      flushPara();
      flushList();
      blocks.push(
        <h3 key={key++} className="font-semibold text-slate-900 mt-4 mb-1">
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      flushPara();
      flushList();
      blocks.push(
        <h2 key={key++} className="text-lg font-bold text-slate-900 mt-6 mb-2">
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      flushPara();
      flushList();
      blocks.push(
        <h1 key={key++} className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
          {renderInline(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith('- ')) {
      flushPara();
      list.push(line.slice(2));
    } else {
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-5 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Tilbake
      </button>
      {blocks}
    </div>
  );
}
