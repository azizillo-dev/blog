import { cn } from "@/lib/utils";

type Props = { children: React.ReactNode; className?: string; size?: "prose" | "default" | "wide" };

const WIDTH = { prose: "max-w-2xl", default: "max-w-4xl", wide: "max-w-6xl" } as const;

export function Container({ children, className, size = "default" }: Props) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6", WIDTH[size], className)}>{children}</div>;
}
