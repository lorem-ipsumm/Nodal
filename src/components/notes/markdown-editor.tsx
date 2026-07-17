import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  forwardRef,
} from "react";
import { markdown } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { GFM } from "@lezer/markdown";
import { keymap, EditorView } from "@codemirror/view";
import { Prec } from "@codemirror/state";

const markdownHighlight = HighlightStyle.define([
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.monospace, fontFamily: "var(--font-mono)", fontSize: "0.85em" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.heading1, fontWeight: "bold", fontSize: "1.4em" },
  { tag: tags.heading2, fontWeight: "bold", fontSize: "1.2em" },
  { tag: tags.heading3, fontWeight: "bold", fontSize: "1.1em" },
  { tag: tags.processingInstruction, opacity: "0.4" },
  { tag: tags.contentSeparator, opacity: "0.4" },
  { tag: tags.labelName, opacity: "0.4" },
  {
    tag: tags.url,
    color: "var(--primary)",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
]);

const editorTheme = EditorView.theme({
  "&": {
    background: "transparent !important",
    fontSize: "0.875rem",
    width: "100%",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-scroller": {
    fontFamily: "inherit",
    lineHeight: "1.6",
  },
  ".cm-content": {
    padding: "8px 0",
    caretColor: "var(--foreground)",
    color: "var(--popover-foreground)",
  },
  ".cm-line": {
    padding: "0 2px",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--foreground)",
  },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "var(--primary) !important",
    opacity: "0.3",
  },
  ".cm-gutters": {
    display: "none",
  },
  ".cm-activeLine": {
    backgroundColor: "transparent",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
  },
});

export interface MarkdownEditorHandle {
  wrapSelection: (before: string, after: string) => void;
  insertLinePrefix: (prefix: string) => void;
  focus: () => void;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  onArrowUp?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const MarkdownEditor = forwardRef<
  MarkdownEditorHandle,
  MarkdownEditorProps
>(
  (
    {
      value,
      onChange,
      onSubmit,
      onCancel,
      onArrowUp,
      placeholder,
      className,
      autoFocus,
    },
    ref,
  ) => {
    const editorRef = useRef<ReactCodeMirrorRef>(null);
    const onSubmitRef = useRef(onSubmit);
    const onCancelRef = useRef(onCancel);
    const onArrowUpRef = useRef(onArrowUp);

    useEffect(() => {
      onSubmitRef.current = onSubmit;
    }, [onSubmit]);

    useEffect(() => {
      onCancelRef.current = onCancel;
    }, [onCancel]);

    useEffect(() => {
      onArrowUpRef.current = onArrowUp;
    }, [onArrowUp]);

    useImperativeHandle(ref, () => ({
      wrapSelection(before: string, after: string) {
        const view = editorRef.current?.view;
        if (!view) return;
        const { state } = view;
        const { from, to } = state.selection.main;
        const selectedText = state.sliceDoc(from, to);
        if (from === to) {
          view.dispatch({
            changes: { from, to, insert: before + after },
            selection: { anchor: from + before.length },
          });
        } else {
          view.dispatch({
            changes: { from, to, insert: before + selectedText + after },
            selection: {
              anchor: from + before.length,
              head: from + before.length + selectedText.length,
            },
          });
        }
        view.focus();
      },
      insertLinePrefix(prefix: string) {
        const view = editorRef.current?.view;
        if (!view) return;
        const { state } = view;
        const { from } = state.selection.main;
        const line = state.doc.lineAt(from);
        view.dispatch({
          changes: { from: line.from, insert: prefix },
          selection: { anchor: from + prefix.length },
        });
        view.focus();
      },
      focus() {
        requestAnimationFrame(() => {
          editorRef.current?.view?.focus();
        });
      },
    }));

    useEffect(() => {
      if (autoFocus) {
        requestAnimationFrame(() => {
          editorRef.current?.view?.focus();
        });
      }
    }, [autoFocus]);

    const submitKeymap = useMemo(
      () =>
        Prec.highest(
          keymap.of([
            {
              key: "Enter",
              run: (view) => {
                view.dispatch({
                  changes: { from: 0, to: view.state.doc.length, insert: "" },
                });
                onSubmitRef.current();
                return true;
              },
            },
            {
              key: "Escape",
              run: () => {
                if (onCancelRef.current) {
                  onCancelRef.current();
                  return true;
                }
                return false;
              },
            },
            {
              key: "ArrowUp",
              run: (view) => {
                if (onArrowUpRef.current && view.state.doc.length === 0) {
                  onArrowUpRef.current();
                  return true;
                }
                return false;
              },
            },
          ]),
        ),
      [],
    );

    const extensions = useMemo(
      () => [
        markdown({ extensions: [GFM] }),
        syntaxHighlighting(markdownHighlight),
        editorTheme,
        submitKeymap,
        EditorView.lineWrapping,
      ],
      [submitKeymap],
    );

    return (
      <CodeMirror
        ref={editorRef}
        value={value}
        onChange={onChange}
        extensions={extensions}
        basicSetup={false}
        placeholder={placeholder}
        className={className}
      />
    );
  },
);

MarkdownEditor.displayName = "MarkdownEditor";
