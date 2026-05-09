import { cn } from "@/lib/utils";
import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const NeuCard = ({ className, children, ...p }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) =>
  <div {...p} className={cn("neu p-5", className)}>{children}</div>;

export const NeuButton = ({ className, variant = "default", children, ...p }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "secondary" | "danger" | "ghost" }) => {
  const styles: Record<string, string> = {
    default: "text-foreground",
    primary: "text-white",
    secondary: "text-white",
    danger: "text-white",
    ghost: "text-muted-foreground",
  };
  const bg: Record<string, string> = {
    default: "",
    primary: "background:var(--gradient-brand)",
    secondary: "background-color:hsl(var(--secondary))",
    danger: "background-color:hsl(var(--destructive))",
    ghost: "",
  };
  const style = bg[variant] ? Object.fromEntries(bg[variant].split(";").filter(Boolean).map(s => {
    const [k, ...v] = s.split(":"); return [k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.join(":")];
  })) : {};
  return (
    <button {...p} style={{ ...(p.style ?? {}), ...style }}
      className={cn("neu-button px-4 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50", styles[variant], className)}>
      {children}
    </button>
  );
};

export const NeuInput = ({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) =>
  <input {...p} className={cn("neu-input w-full px-4 py-2.5 text-sm", className)} />;

export const NeuTextarea = ({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) =>
  <textarea {...p} className={cn("neu-input w-full px-4 py-2.5 text-sm", className)} />;

export const NeuSelect = ({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) =>
  <select {...p} className={cn("neu-input w-full px-4 py-2.5 text-sm appearance-none cursor-pointer pr-10 bg-no-repeat bg-right", className)}
    style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>\")", backgroundPosition: "right 12px center" }}>
    {children}
  </select>;

export const NeuLabel = ({ children, className }: { children: ReactNode; className?: string }) =>
  <label className={cn("text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block", className)}>{children}</label>;
