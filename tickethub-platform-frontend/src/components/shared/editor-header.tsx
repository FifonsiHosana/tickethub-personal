import { TextAlign } from "@tiptap/extension-text-align";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Highlight } from "@tiptap/extension-highlight";
import { cn } from "@/lib/utils";
import { toolbarGroups, type EditorState } from "./editor-toolbar-actions";

const buttonBase =
  "flex h-8 w-9 items-center justify-center rounded-md border border-transparent text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
const buttonActive =
  "border-primary bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30 hover:bg-primary/90 hover:text-primary-foreground";

const inactiveEditorState: EditorState = {
  isBold: false,
  isItalic: false,
  isStrike: false,
  isHighlight: false,
  isBulletList: false,
  isOrderedList: false,
  isAlignLeft: false,
  isAlignCenter: false,
  isAlignRight: false,
  isAlignJustify: false,
};

export const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const editorState = useEditorState({
    editor,
    selector: ({ editor }): EditorState => {
      if (!editor) return inactiveEditorState;

      return {
        isBold: editor.isActive("bold"),
        isItalic: editor.isActive("italic"),
        isStrike: editor.isActive("strike"),
        isHighlight: editor.isActive("highlight"),
        isBulletList: editor.isActive("bulletList"),
        isOrderedList: editor.isActive("orderedList"),
        isAlignLeft: editor.isActive({ textAlign: "left" }),
        isAlignCenter: editor.isActive({ textAlign: "center" }),
        isAlignRight: editor.isActive({ textAlign: "right" }),
        isAlignJustify: editor.isActive({ textAlign: "justify" }),
      };
    },
  });

  if (!editor) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
      {toolbarGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-1">
          {groupIndex > 0 && <div className="mx-1 h-5 w-px bg-slate-200" />}
          {group.map((action) => {
            const Icon = action.icon;
            const active = editorState?.[action.isActive] ?? false;
            return (
              <button
                key={action.title}
                type="button"
                title={action.title}
                aria-label={action.title}
                aria-pressed={active}
                onClick={() => action.run(editor)}
                className={cn(buttonBase, active && buttonActive)}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default function RichTextEditorPreview() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
    ],
  });

  return (
    <>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </>
  );
}

