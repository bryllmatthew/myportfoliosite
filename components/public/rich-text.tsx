import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils/cn";

/**
 * Safe Markdown rendering for CMS long-form fields.
 * - Raw HTML in content is NOT rendered (no rehype-raw), so script/style/event
 *   attributes can never reach the page.
 * - react-markdown's default urlTransform strips javascript:/data: URLs.
 * - Headings are shifted down so content never introduces a second <h1>.
 */
const components: Components = {
  h1: ({ children }) => <h2>{children}</h2>,
  h2: ({ children }) => <h3>{children}</h3>,
  h3: ({ children }) => <h4>{children}</h4>,
  img: () => null,
  a: ({ href, children }) => {
    const external = href ? /^https?:\/\//i.test(href) : false;
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>
        {children}
        {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </a>
    );
  },
};

export function RichText({ content, className }: { content: string | null | undefined; className?: string }) {
  if (!content?.trim()) return null;
  return (
    <div className={cn("prose-cms", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {content}
      </ReactMarkdown>
    </div>
  );
}
