import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Neumorphism-styled "Instalar IrriX" button.
 * Only visible when the app is installable AND not already installed.
 * Captures the `beforeinstallprompt` event from the browser.
 */
export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed for this session
    const sessionDismissed = sessionStorage.getItem("irrix-install-dismissed");
    if (sessionDismissed) setDismissed(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful installation
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("irrix-install-dismissed", "true");
  };

  // Don't render if: already installed, no prompt available, or dismissed
  if (isInstalled || !deferredPrompt || dismissed) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
      style={{ animation: "slide-up 0.5s ease-out" }}
    >
      <button
        onClick={handleInstall}
        className="btn-shimmer flex items-center gap-2.5 px-5 py-3 rounded-2xl font-display font-semibold text-white text-sm shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: "var(--gradient-brand)",
          boxShadow: "var(--shadow-neu-sm)",
        }}
        id="install-irrix-button"
      >
        <Download className="w-5 h-5" />
        Instalar IrriX
      </button>

      <button
        onClick={handleDismiss}
        className="neu-button w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        title="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
