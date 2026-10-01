import DOMPurify from "dompurify";

interface RichTextProps {
  html: string;
  className?: string;
}

export const RichText: React.FC<RichTextProps> = ({ html, className }) => {
  const clean = DOMPurify.sanitize(html);

  return (
    <div
      // className=""
      // className={`prose max-w-none prose-p:my-4 ${className ?? ""}`}
      className="prose max-w-none
      prose-p:my-4
      prose-p:first:mt-0
      prose-p:last:mb-0"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};
