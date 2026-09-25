import { TextAlign } from "@tiptap/extension-text-align";
import {
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Bold,
  Italic,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import {
  Editor,
  EditorContent,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Highlight } from "@tiptap/extension-highlight";

export const MenuBar = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        // Text formatting
        isBold: ctx.editor.isActive("bold") ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        isHighlight: ctx.editor.isActive("highlight") ?? false,

        // Text alignment
        isAlignLeft: ctx.editor.isActive({ textAlign: "left" }) ?? false,
        isAlignCenter: ctx.editor.isActive({ textAlign: "center" }) ?? false,
        isAlignRight: ctx.editor.isActive({ textAlign: "right" }) ?? false,
        isAlignJustify: ctx.editor.isActive({ textAlign: "justify" }) ?? false,

        // Block types
        isParagraph: ctx.editor.isActive("paragraph") ?? false,
        isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
      };
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="control-group">
      <div className="inline-flex items-center mb-3 border border-slate-200 bg-white  shadow-sm dark:border-slate-800 dark:bg-slate-900">
       
        {/* Inline Styles Group */}
        <div
          title="Bold"
          aria-label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={` h-6 w-10 flex justify-center items-center ${
            editorState.isBold
              ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100"
              : ""
          }`}
        >
          <Bold className="h-4 w-4" />
        </div>

        <div
          title="Italic"
          aria-label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={` h-6 w-10 flex justify-center items-center ${
            editorState.isItalic
              ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100"
              : ""
          }`}
        >
          <Italic className="h-4 w-4" />
        </div>

        <div
          title="Strikethrough"
          aria-label="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={` h-6 w-10 flex justify-center items-center ${
            editorState.isStrike
              ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100"
              : ""
          }`}
        >
          <Strikethrough className="h-4 w-4" />
        </div>

        <div
          title="Highlight"
          aria-label="Highlight"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={` h-6 w-10 flex justify-center items-center ${
            editorState.isHighlight
              ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100"
              : ""
          }`}
        >
          <Highlighter className="h-4 w-4" />
        </div>

        <div className="mx-1 h-5 w-[1px] bg-slate-200 dark:bg-slate-800" />

        {/* Text Alignment Group */}
        <div
          title="Align Left"
          aria-label="Align Left"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={` h-6 w-10 flex justify-center items-center ${
            editorState.isAlignLeft
              ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100"
              : ""
          }`}
        >
          <AlignLeft className="h-4 w-4" />
        </div>

        <div
          title="Align Center"
          aria-label="Align Center"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={` h-6 w-10 flex justify-center items-center ${
            editorState.isAlignCenter
              ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100"
              : ""
          }`}
        >
          <AlignCenter className="h-4 w-4" />
        </div>

        <div
          title="Align Right"
          aria-label="Align Right"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={` h-6 w-10 flex justify-center items-center ${
            //   className={`p-2 rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 ${
            editorState.isAlignRight
              ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100"
              : ""
          }`}
        >
          <AlignRight className="h-4 w-4" />
        </div>

        <div
          title="Justify"
          aria-label="Justify"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={` h-6 w-10 flex justify-center items-center ${
            //   className={`p-2 rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 ${
            editorState.isAlignJustify
              ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100"
              : ""
          }`}
        >
          <AlignJustify className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
    ],
  });

  return (
    <>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </>
  );
};
