import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

function headingSlug(value: string, fallback: string): string {
  const text = value.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ");
  const slug = text
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
  return slug || fallback;
}

/** Render trusted repository course Markdown during static generation. */
export function renderCourseMarkdown(markdown: string): string {
  let html = String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeHighlight, { detect: false, ignoreMissing: true })
      .use(rehypeStringify)
      .processSync(markdown)
  );

  const slugCounts = new Map<string, number>();
  html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, level, content) => {
    const base = headingSlug(content, `section-${slugCounts.size + 1}`);
    const count = slugCounts.get(base) ?? 0;
    slugCounts.set(base, count + 1);
    const id = count ? `${base}-${count + 1}` : base;
    return `<h${level} id="${id}">${content}</h${level}>`;
  });
  html = html.replace(
    /<pre><code class="hljs language-(\w+)">/g,
    '<pre class="code-block" data-language="$1"><code class="hljs language-$1">'
  );
  html = html.replace(
    /<pre><code(?! class="hljs)([^>]*)>/g,
    '<pre class="ascii-diagram"><code$1>'
  );
  html = html.replace(/<table>/g, '<div class="table-scroll"><table>');
  html = html.replace(/<\/table>/g, "</table></div>");
  html = html.replace(/<blockquote>/, '<blockquote class="hero-callout">');
  html = html.replace(/<h1>.*?<\/h1>\n?/, "");
  html = html.replace(
    /<ol start="(\d+)">/g,
    (_, start) => `<ol style="counter-reset:step-counter ${parseInt(start) - 1}">`
  );

  return html;
}
