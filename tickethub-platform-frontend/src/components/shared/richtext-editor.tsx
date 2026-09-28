import { EditorContent, useEditor } from "@tiptap/react";
import { MenuBar } from "./editor-header";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEffect } from "react";

export const DescriptionField = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      Placeholder.configure({
        placeholder: "Tell attendees what to expect...",
      }),
    ],
    content: value ?? "",
    editorProps: {
      attributes: {
        class:
          "tiptap-content p-2 min-h-50 border rounded-sm data-[state=active]:border-primary",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // Sync external changes (form.reset, async defaults) into the editor
  useEffect(() => {
    if (!editor) return;
    const incoming = value ?? "";
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (incoming !== current) {
      // Tiptap v3:
      editor.commands.setContent(incoming, { emitUpdate: false });
      // Tiptap v2: editor.commands.setContent(incoming, false);
    }
  }, [value, editor]);

  return (
    <div className="editor-page">
      <div className="toolbar">
        <MenuBar editor={editor} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
