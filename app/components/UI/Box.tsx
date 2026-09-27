interface BoxProps {
  children: React.ReactNode;
  theme: {
    bg: string;
    border: string;
  };
  className?: string;
}

export default function Box({ children, theme, className }: BoxProps) {
  return (
    <div
      className={`
        ${theme.bg}
        ${theme.border}
        border
        rounded-xl
        p-6
        shadow-lg
        backdrop-blur
        ${className ?? ""}
      `}
    >
      {children}
    </div>
  );
}
