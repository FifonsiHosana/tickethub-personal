import { EditorContent, useEditor } from "@tiptap/react";
import { MenuBar } from "./editor-header";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

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
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="editor-page">
      <div className="toolbar">
        <MenuBar editor={editor} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
