import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  type LucideIcon,
} from "lucide-react";

export type EditorState = {
  isBold: boolean;
  isItalic: boolean;
  isStrike: boolean;
  isHighlight: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isAlignLeft: boolean;
  isAlignCenter: boolean;
  isAlignRight: boolean;
  isAlignJustify: boolean;
};

export type ToolbarAction = {
  title: string;
  icon: LucideIcon;
  isActive: keyof EditorState;
  run: (editor: Editor) => void;
};

export const toolbarGroups: ToolbarAction[][] = [
  [
    { title: "Bold", icon: Bold, isActive: "isBold", run: (editor) => editor.chain().focus().toggleBold().run() },
    { title: "Italic", icon: Italic, isActive: "isItalic", run: (editor) => editor.chain().focus().toggleItalic().run() },
    { title: "Strikethrough", icon: Strikethrough, isActive: "isStrike", run: (editor) => editor.chain().focus().toggleStrike().run() },
    { title: "Highlight", icon: Highlighter, isActive: "isHighlight", run: (editor) => editor.chain().focus().toggleHighlight().run() },
  ],
  [
    { title: "Bullet List", icon: List, isActive: "isBulletList", run: (editor) => editor.chain().focus().toggleBulletList().run() },
    { title: "Ordered List", icon: ListOrdered, isActive: "isOrderedList", run: (editor) => editor.chain().focus().toggleOrderedList().run() },
  ],
  [
    { title: "Align Left", icon: AlignLeft, isActive: "isAlignLeft", run: (editor) => editor.chain().focus().setTextAlign("left").run() },
    { title: "Align Center", icon: AlignCenter, isActive: "isAlignCenter", run: (editor) => editor.chain().focus().setTextAlign("center").run() },
    { title: "Align Right", icon: AlignRight, isActive: "isAlignRight", run: (editor) => editor.chain().focus().setTextAlign("right").run() },
    { title: "Justify", icon: AlignJustify, isActive: "isAlignJustify", run: (editor) => editor.chain().focus().setTextAlign("justify").run() },
  ],
];
