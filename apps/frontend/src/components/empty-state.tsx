export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      <p className="text-lg font-medium">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
