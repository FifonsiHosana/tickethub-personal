import DOMPurify from "dompurify";

interface RichTextProps {
  html: string;
  className?: string;
}

export const RichText: React.FC<RichTextProps> = ({ html, className }) => {
  const clean = DOMPurify.sanitize(html);

  return (
    <div
      className={`prose max-w-none ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};
