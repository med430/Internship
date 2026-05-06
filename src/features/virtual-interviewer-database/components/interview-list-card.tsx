interface InterviewListCardProps {
  title: string;
  items: string[];
  bulletClassName: string;
}

export function InterviewListCard({
  title,
  items,
  bulletClassName,
}: InterviewListCardProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-6 backdrop-blur-md">
      <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={`${title}-${index}`}
            className="flex items-start gap-2 text-sm text-foreground"
          >
            <span className={`${bulletClassName} mt-1`}>●</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
