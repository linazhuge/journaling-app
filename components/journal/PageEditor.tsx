'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { FontSize } from '@tiptap/extension-text-style/font-size';
import Placeholder from '@tiptap/extension-placeholder';
import type { EditorStyle } from './EditorToolbar';
import { LINE_HEIGHT_PX } from '@/lib/editor-config';
import { useActiveEditor } from '@/lib/active-editor-context';

interface PageEditorProps {
  pageNumber: number;
  content: string;
  onChange: (pageNumber: number, content: string) => void;
  pageCount: number;
  editorStyle: EditorStyle;
  autoFocus?: boolean;
}

export function PageEditor({
  pageNumber,
  content,
  onChange,
  pageCount,
  editorStyle,
  autoFocus = false,
}: PageEditorProps) {
  const isValid = pageNumber >= 1 && pageNumber <= pageCount;
  const lastContent = useRef(content);
  const { setActiveEditor } = useActiveEditor();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
    ],
    content: content ? JSON.parse(content) : '',
    autofocus: autoFocus ? 'start' : false,
    editorProps: {
      attributes: {
        class: 'outline-none w-full h-full',
        style: `font-family: ${editorStyle.fontCss}; color: ${editorStyle.color}; font-size: ${editorStyle.sizePx}px; line-height: ${LINE_HEIGHT_PX}px; background: transparent; user-select: text; -webkit-user-select: text;`,
        'data-page': String(pageNumber),
      },
    },
    onUpdate({ editor }) {
      const json = JSON.stringify(editor.getJSON());
      if (json !== lastContent.current) {
        lastContent.current = json;
        onChange(pageNumber, json);
      }
    },
    onFocus({ editor }) {
      setActiveEditor(editor);
    },
    onBlur() {
      setActiveEditor(null);
    },
    immediatelyRender: false,
  });

  // Sync style changes to editor attributes; also store editor ref on DOM
  // so JournalPage's padding-click handler can call focus('start')
  useEffect(() => {
    if (!editor) return;
    editor.view.dom.setAttribute(
      'style',
      `font-family: ${editorStyle.fontCss}; color: ${editorStyle.color}; font-size: ${editorStyle.sizePx}px; line-height: ${LINE_HEIGHT_PX}px; background: transparent; user-select: text; -webkit-user-select: text;`
    );
    (editor.view.dom as HTMLElement & { __editor?: typeof editor }).__editor = editor;
  }, [editor, editorStyle]);

  // Sync content if it changes externally (e.g. page jump)
  useEffect(() => {
    if (!editor || content === lastContent.current) return;
    lastContent.current = content;
    const parsed = content ? JSON.parse(content) : '';
    editor.commands.setContent(parsed, { emitUpdate: false });
  }, [editor, content]);

  if (!isValid) return null;

  return (
    <EditorContent
      editor={editor}
      className="w-full h-full [&_.tiptap]:w-full [&_.tiptap]:min-h-full"
    />
  );
}
