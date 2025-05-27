
'use client';

interface EditGameHeaderProps {
  title: string;
  subtitle?: string;
}

export default function EditGameHeader({ title, subtitle }: EditGameHeaderProps) {
  return (
    <header className="bg-library-header text-library-header-foreground py-8 px-4 sm:px-8 text-center shadow-md">
      <h1 className="text-5xl font-bold">{title}</h1>
      {subtitle && <p className="text-xl mt-2">{subtitle}</p>}
    </header>
  );
}
