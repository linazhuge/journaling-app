'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Minus, Plus } from 'lucide-react';
import { EDITOR_FONTS, INK_COLORS, MIN_SIZE, MAX_SIZE } from '@/lib/editor-config';

export interface EditorStyle {
  fontCss: string;
  fontLabel: string;
  color: string;
  sizePx: number;
}

interface EditorToolbarProps {
  style: EditorStyle;
  onChange: (style: EditorStyle) => void;
  activeEditor?: Editor | null;
}

export function EditorToolbar({ style, onChange, activeEditor }: EditorToolbarProps) {
  const [fontOpen, setFontOpen] = useState(false);

  const setColor = (color: string) => {
    onChange({ ...style, color });
    activeEditor?.chain().setColor(color).run();
  };
  const setFont = (fontCss: string, fontLabel: string) => {
    onChange({ ...style, fontCss, fontLabel });
    setFontOpen(false);
    activeEditor?.chain().setFontFamily(fontCss).run();
  };
  const setSize = (sizePx: number) => {
    const clamped = Math.max(MIN_SIZE, Math.min(MAX_SIZE, sizePx));
    onChange({ ...style, sizePx: clamped });
    activeEditor?.chain().setFontSize(`${clamped}px`).run();
  };

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className="flex flex-col items-center gap-5 py-5 px-2.5 rounded-lg select-none"
      style={{
        backgroundColor: 'rgba(245, 240, 232, 0.9)',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        minWidth: '44px',
      }}
    >
      {/* Ink colors */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[9px] text-stone-400 uppercase tracking-widest font-sans">Ink</span>
        <div className="flex flex-col gap-1.5">
          {INK_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => setColor(c.value)}
              className="w-5 h-5 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c.value,
                outline: style.color === c.value ? `2px solid ${c.value}` : 'none',
                outlineOffset: '2px',
                boxShadow: style.color === c.value ? '0 0 0 1px white inset' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div className="w-5 h-px bg-stone-200" />

      {/* Font picker */}
      <div className="flex flex-col items-center gap-2 relative">
        <span className="text-[9px] text-stone-400 uppercase tracking-widest font-sans">Font</span>
        <button
          onClick={() => setFontOpen(!fontOpen)}
          title={style.fontLabel}
          className="w-8 h-8 rounded flex items-center justify-center text-stone-600
            hover:bg-stone-200 transition-colors text-xs font-serif"
          style={{ fontFamily: style.fontCss }}
        >
          Aa
        </button>

        {fontOpen && (
          <div
            className="absolute left-full ml-2 top-0 z-50 rounded-lg shadow-xl border border-stone-100 overflow-hidden"
            style={{ backgroundColor: '#faf8f3', minWidth: '140px' }}
          >
            {EDITOR_FONTS.map((f) => (
              <button
                key={f.css}
                onClick={() => setFont(f.css, f.label)}
                className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-stone-100
                  ${style.fontCss === f.css ? 'bg-stone-100' : ''}`}
                style={{ fontFamily: f.css, color: style.color }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-5 h-px bg-stone-200" />

      {/* Font size */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[9px] text-stone-400 uppercase tracking-widest font-sans">Size</span>
        <button
          onClick={() => setSize(style.sizePx + 1)}
          disabled={style.sizePx >= MAX_SIZE}
          className="w-7 h-7 rounded flex items-center justify-center text-stone-500
            hover:bg-stone-200 transition-colors disabled:opacity-30"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <span
          className="text-xs font-mono text-stone-600 tabular-nums w-6 text-center"
        >
          {style.sizePx}
        </span>
        <button
          onClick={() => setSize(style.sizePx - 1)}
          disabled={style.sizePx <= MIN_SIZE}
          className="w-7 h-7 rounded flex items-center justify-center text-stone-500
            hover:bg-stone-200 transition-colors disabled:opacity-30"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
