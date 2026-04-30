interface HeaderProps {
  title: string;
  onBack?: () => void;
}

export default function Header({ title, onBack }: HeaderProps) {
  return (
    <header className="flex items-center px-4 py-3 bg-pink text-white sticky top-0 z-40">
      {onBack && (
        <button
          onClick={onBack}
          className="mr-3 text-2xl leading-none"
          aria-label="もどる"
        >
          ←
        </button>
      )}
      <h1 className="text-xl font-bold truncate">{title}</h1>
    </header>
  );
}
