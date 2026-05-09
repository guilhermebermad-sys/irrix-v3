import logo from "@/assets/irrix-logo.png";

export function Logo({ className = "h-10 w-auto", alt = "IrriX" }: { className?: string; alt?: string }) {
  return <img src={logo} alt={alt} className={className} />;
}

export { logo as logoSrc };
