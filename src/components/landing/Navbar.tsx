import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Lock, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#como-funciona", label: "Como Funciona" },
  { href: "#planos", label: "Planos" },
  { href: "#contato", label: "Contato" },
];

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 pt-3">
      <div className="neu mx-auto max-w-7xl flex items-center justify-between gap-4 px-4 md:px-6 py-3">
        <Link to="/landing" className="flex items-center gap-3">
          <Logo className="h-10 w-10 object-contain" />
          <div className="leading-tight">
            <div className="font-display font-bold text-lg text-gradient-brand">IrriX</div>
            <div className="text-[10px] text-muted-foreground tracking-wider uppercase">Irrigação de Precisão</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <a key={l.href} href={l.href}
              className="px-4 py-2 rounded-xl text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="neu-button px-4 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            <Lock className="w-4 h-4" /> Já sou cliente
          </Link>
          <Link to="/cadastro"
            className="btn-shimmer neu-button px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--gradient-brand)", boxShadow: "0 8px 24px rgba(16,185,129,0.35)" }}>
            Teste Grátis
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <button className="neu-button w-10 h-10 rounded-xl flex items-center justify-center">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-none">
            <div className="flex flex-col gap-3 mt-8">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="neu-button px-4 py-3 rounded-xl text-sm font-semibold">
                  {l.label}
                </a>
              ))}
              <Link to="/login" className="neu-button px-4 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                <Lock className="w-4 h-4" /> Já sou cliente
              </Link>
              <Link to="/cadastro" className="neu-button px-4 py-3 rounded-xl text-sm font-semibold text-white text-center"
                style={{ background: "var(--gradient-brand)" }}>
                Teste Grátis
              </Link>
            </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
