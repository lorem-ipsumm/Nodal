import { useRef, useState } from "react";
import { Bold, Code, Italic, List, Paperclip, X, File } from "lucide-react";
import { Button } from "../ui/button";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { MarkdownEditor, MarkdownEditorHandle } from "./markdown-editor";

const isImageDataUrl = (dataUrl: string) => dataUrl.startsWith("data:image/");

export const NotesInput = () => {
  const { notesDirectory, activeFolder, addNote } = useAppStore();
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const [content, setContent] = useState("");
  const [pendingFiles, setPendingFiles] = useState<
    { filePath: string; dataUrl: string }[]
  >([]);

  const createNote = async () => {
    if (!notesDirectory || !activeFolder) return;

    const folderPath = `${notesDirectory}/${activeFolder}`;
    const folderName = `${Date.now()}`;
    const timestamp = parseInt(folderName, 10);
    const notePath = `${folderPath}/${folderName}`;

    const filesToAttach = pendingFiles.map((f) => f.filePath);
    if (content.length === 0 && filesToAttach.length === 0) return;

    setContent("");
    setPendingFiles([]);

    addNote({
      folderName,
      content,
      timestamp,
      attachments: filesToAttach.map((p) => p.split("/").pop()!),
      resolvedAttachments: pendingFiles.map(({ filePath, dataUrl }) => ({
        fileName: filePath.split("/").pop()!,
        dataUrl,
      })),
    });

    await window.ipcRenderer.invoke(
      "create-note",
      folderPath,
      folderName,
      content,
    );

    if (filesToAttach.length > 0) {
      await window.ipcRenderer.invoke(
        "copy-attachments",
        notePath,
        filesToAttach,
      );
    }
  };

  const handleSelectFiles = async () => {
    const selected: { filePath: string; dataUrl: string }[] =
      await window.ipcRenderer.invoke("select-files");
    if (selected.length > 0) {
      setPendingFiles((prev) => [...prev, ...selected]);
    }
  };

  const removePendingFile = (filePath: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.filePath !== filePath));
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const imageItems = Array.from(e.clipboardData.items).filter((item) =>
      item.type.startsWith("image/"),
    );
    if (imageItems.length === 0) return;

    for (const item of imageItems) {
      const blob = item.getAsFile();
      if (!blob) continue;

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const ext = item.type.split("/")[1] || "png";
      const fileName = `paste-${Date.now()}.${ext}`;

      const tempPath: string = await window.ipcRenderer.invoke(
        "write-temp-file",
        dataUrl,
        fileName,
      );

      setPendingFiles((prev) => [...prev, { filePath: tempPath, dataUrl }]);
    }
  };

  return (
    <section className="p-4 -translate-x-1">
      <div
        className="bg-popover rounded-lg h-full w-full flex flex-col border"
        onPaste={handlePaste}
      >
        {pendingFiles.length > 0 && (
          <section className="flex flex-wrap gap-2 p-3 border-b">
            {pendingFiles.map(({ filePath, dataUrl }) => {
              const fileName = filePath.split("/").pop()!;
              return isImageDataUrl(dataUrl) ? (
                <div key={filePath} className="relative group/img w-16 h-16">
                  <img
                    src={dataUrl}
                    alt={fileName}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    onClick={() => removePendingFile(filePath)}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div
                  key={filePath}
                  className="relative group/file flex items-center gap-2 pl-2 pr-7 py-1.5 rounded-md bg-muted text-sm max-w-48"
                >
                  <File size={14} className="shrink-0 text-muted-foreground" />
                  <span className="truncate text-xs">{fileName}</span>
                  <button
                    onClick={() => removePendingFile(filePath)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover/file:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
          </section>
        )}
        <section className="border-b">
          <Button
            variant={"ghost"}
            onClick={() => editorRef.current?.wrapSelection("**", "**")}
          >
            <Bold />
          </Button>
          <Button
            variant={"ghost"}
            onClick={() => editorRef.current?.wrapSelection("*", "*")}
          >
            <Italic />
          </Button>
          <Button
            variant={"ghost"}
            onClick={() => editorRef.current?.wrapSelection("`", "`")}
          >
            <Code />
          </Button>
          <Button
            variant={"ghost"}
            onClick={() => editorRef.current?.insertLinePrefix("- ")}
          >
            <List />
          </Button>
          <Button variant={"ghost"} onClick={handleSelectFiles}>
            <Paperclip />
          </Button>
        </section>
        <section className="flex">
          <MarkdownEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            onSubmit={createNote}
            placeholder="Write a note..."
            className="flex-1 min-w-0 px-3 min-h-16"
          />
        </section>
      </div>
    </section>
  );
};
