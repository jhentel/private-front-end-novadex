// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

export default function ScrollLayout({
  children,
  withPadding = true,
  className,
}: {
  children: React.ReactNode;
  withPadding?: boolean;
  className?: string;
}) {
  // <TestSnapLayout scrollable>
  return (
    <main
      className={cn(
        "flex min-h-screen w-full flex-col px-4",
        !withPadding && "px-0",
        className,
      )}
    >
      {children}
    </main>
  );
  {
    /* </TestSnapLayout> */
  }
}
