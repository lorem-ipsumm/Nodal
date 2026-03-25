import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
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

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
}

export const MarkdownEditor = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
}: MarkdownEditorProps) => {
  const submitKeymap = Prec.highest(
    keymap.of([
      {
        key: "Enter",
        run: () => {
          onSubmit();
          return true;
        },
      },
    ]),
  );

  const extensions = [
    markdown(),
    syntaxHighlighting(markdownHighlight),
    editorTheme,
    submitKeymap,
    EditorView.lineWrapping,
  ];

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      basicSetup={false}
      placeholder={placeholder}
      className={className}
    />
  );
};
