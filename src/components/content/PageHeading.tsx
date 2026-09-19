type Props = { title: string; subtitle?: string; icon?: React.ReactNode };

export function PageHeading({ title, subtitle, icon }: Props) {
  return (
    <div className="animate-fade-up mb-10 pt-10 text-center sm:mb-14 sm:pt-16">
      <h1 className="inline-flex items-center gap-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
        {icon}
      </h1>
      {subtitle && <p className="mx-auto mt-3 max-w-xl text-muted">{subtitle}</p>}
    </div>
  );
}
