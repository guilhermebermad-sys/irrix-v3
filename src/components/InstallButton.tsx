import { useEffect, useState } from "react";
import { Download, X, Share, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Botão flutuante "Instalar IrriX".
 * - Em Chrome/Edge/Android: usa o evento nativo `beforeinstallprompt`.
 * - Em iOS Safari (onde o evento não existe): mostra instruções manuais
 *   ("Compartilhar → Adicionar à Tela de Início").
 */
export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    // Standalone? já instalado.
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detecta iOS (Safari/Chrome iOS — todos usam WebKit, sem beforeinstallprompt)
    const ua = window.navigator.userAgent;
    const iOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (ua.includes("Mac") && "ontouchend" in document);
    setIsIOS(iOS);

    const sessionDismissed = sessionStorage.getItem("irrix-install-dismissed");
    if (sessionDismissed) setDismissed(true);

    const handler = (e: Event) => {
      e.preventDefault();
      console.log("[PWA] beforeinstallprompt capturado");
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      console.log("[PWA] App instalado");
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
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowIOSHelp(false);
    sessionStorage.setItem("irrix-install-dismissed", "true");
  };

  if (isInstalled || dismissed) return null;
  // Mostra se: tem prompt nativo OU é iOS (instalação manual)
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      <div
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
        style={{ animation: "slide-up 0.5s ease-out" }}
      >
        <button
          onClick={isIOS ? () => setShowIOSHelp(true) : handleInstall}
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

      {showIOSHelp && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowIOSHelp(false)}
        >
          <div
            className="bg-card text-card-foreground rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">
                Instalar no iPhone/iPad
              </h3>
              <button
                onClick={() => setShowIOSHelp(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Para instalar o IrriX na tela inicial, siga estes passos no
              Safari:
            </p>

            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                  1
                </span>
                <span className="flex items-center gap-1.5 pt-0.5">
                  Toque no botão <Share className="w-4 h-4 inline" />
                  <strong>Compartilhar</strong> na barra do Safari.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                  2
                </span>
                <span className="flex items-center gap-1.5 pt-0.5">
                  Role e toque em <Plus className="w-4 h-4 inline" />
                  <strong>Adicionar à Tela de Início</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                  3
                </span>
                <span className="pt-0.5">
                  Toque em <strong>Adicionar</strong> no canto superior direito.
                </span>
              </li>
            </ol>

            <button
              onClick={handleDismiss}
              className="mt-6 w-full py-2.5 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 text-sm font-medium transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
