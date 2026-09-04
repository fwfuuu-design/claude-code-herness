interface DocRendererProps {
  html: string;
  translationFallback: boolean;
  translationMissingLabel: string;
}

export function DocRenderer({
  html,
  translationFallback,
  translationMissingLabel,
}: DocRendererProps) {
  return (
    <div className="py-4">
      {translationFallback && (
        <p role="status" className="mb-6 border border-[var(--color-border)] bg-[var(--color-carbon)] p-4 text-sm text-[var(--color-ash)]">
          {translationMissingLabel}
        </p>
      )}
      <div className="prose-custom" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
