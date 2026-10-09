import DOMPurify from "dompurify";

interface RichTextProps {
  html: string;
  className?: string;
}

export const RichText: React.FC<RichTextProps> = ({ html, className }) => {
  const clean = DOMPurify.sanitize(html, {
    ADD_ATTR: ["style", "class"],
    ADD_TAGS: ["mark"],
  });

  return (
    <div
      className={`rich-text-content prose max-w-none prose-p:my-4 prose-p:first:mt-0 prose-p:last:mb-0 prose-ul:my-4 prose-ol:my-4 prose-li:my-1 ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};
