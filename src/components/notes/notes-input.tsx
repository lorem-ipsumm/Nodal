import { useState } from "react";
import { Bold, Code, ImageIcon, Italic, List, X } from "lucide-react";
import { Button } from "../ui/button";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { MarkdownEditor } from "./markdown-editor";

export const NotesInput = () => {
  const { notesDirectory, activeFolder, addNote } = useAppStore();
  const [content, setContent] = useState("");
  const [pendingImages, setPendingImages] = useState<
    { filePath: string; dataUrl: string }[]
  >([]);

  const createNote = async () => {
    const trimmed = content.trim();
    if (!trimmed || !notesDirectory || !activeFolder) return;

    const folderPath = `${notesDirectory}/${activeFolder}`;
    const folderName = `${Date.now()}`;
    const timestamp = parseInt(folderName, 10);
    const notePath = `${folderPath}/${folderName}`;

    const imagesToAttach = pendingImages.map((img) => img.filePath);
    setContent("");
    setPendingImages([]);
    addNote({
      folderName,
      content: trimmed,
      timestamp,
      attachments: imagesToAttach.map((p) => p.split("/").pop()!),
      resolvedAttachments: pendingImages.map(({ filePath, dataUrl }) => ({
        fileName: filePath.split("/").pop()!,
        dataUrl,
      })),
    });

    await window.ipcRenderer.invoke(
      "create-note",
      folderPath,
      folderName,
      trimmed,
    );

    if (imagesToAttach.length > 0) {
      await window.ipcRenderer.invoke(
        "copy-attachments",
        notePath,
        imagesToAttach,
      );
    }
  };

  const handleSelectImages = async () => {
    const selected: { filePath: string; dataUrl: string }[] =
      await window.ipcRenderer.invoke("select-images");
    if (selected.length > 0) {
      setPendingImages((prev) => [...prev, ...selected]);
    }
  };

  const removePendingImage = (filePath: string) => {
    setPendingImages((prev) => prev.filter((p) => p.filePath !== filePath));
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
        "write-temp-image",
        dataUrl,
        fileName,
      );

      setPendingImages((prev) => [...prev, { filePath: tempPath, dataUrl }]);
    }
  };

  return (
    <section className="p-4 -translate-x-1">
      <div
        className="bg-popover rounded-lg h-full w-full flex flex-col"
        onPaste={handlePaste}
      >
        {pendingImages.length > 0 && (
          <section className="flex flex-wrap gap-2 p-3 border-b">
            {pendingImages.map(({ filePath, dataUrl }) => (
              <div key={filePath} className="relative group/img w-16 h-16">
                <img
                  src={dataUrl}
                  alt={filePath.split("/").pop()}
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  onClick={() => removePendingImage(filePath)}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </section>
        )}
        <section className="border-b">
          <Button variant={"ghost"}>
            <Bold />
          </Button>
          <Button variant={"ghost"}>
            <Italic />
          </Button>
          <Button variant={"ghost"}>
            <Code />
          </Button>
          <Button variant={"ghost"}>
            <List />
          </Button>
          <Button variant={"ghost"} onClick={handleSelectImages}>
            <ImageIcon />
          </Button>
        </section>
        <section className="flex">
          <MarkdownEditor
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
