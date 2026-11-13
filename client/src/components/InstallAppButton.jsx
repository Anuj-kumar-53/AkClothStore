
import { useState, useEffect } from "react";
import { Download } from "lucide-react";

// Module-level cache so we capture the event even before the component mounts
let globalDeferredPrompt = typeof window !== "undefined" ? window.deferredInstallPrompt || null : null;

if (typeof window !== "undefined") {
    // Catch existing prompt if index.html or another script already caught it
    if (window.deferredInstallPrompt) {
        globalDeferredPrompt = window.deferredInstallPrompt;
    }

    window.addEventListener("beforeinstallprompt", (e) => {
        // Prevent default mini-infobar or browser banner
        e.preventDefault();
        globalDeferredPrompt = e;
        window.deferredInstallPrompt = e;
        // Dispatch custom event to notify any mounted button instances
        window.dispatchEvent(new CustomEvent("pwa-prompt-available", { detail: e }));
    });

    window.addEventListener("appinstalled", () => {
        globalDeferredPrompt = null;
        window.deferredInstallPrompt = null;
        window.dispatchEvent(new Event("app-installed-state"));
    });
}

const InstallAppButton = ({ className = "" }) => {
    const [isInstalled, setIsInstalled] = useState(() => {
        if (typeof window === "undefined") return false;
        return (
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true
        );
    });

    const [installPrompt, setInstallPrompt] = useState(() => {
        return globalDeferredPrompt || (typeof window !== "undefined" ? window.deferredInstallPrompt : null);
    });

    const [showInstructions, setShowInstructions] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

        const standaloneQuery = window.matchMedia("(display-mode: standalone)");

        const handleDisplayModeChange = (event) => {
            setIsInstalled(event.matches || window.navigator.standalone === true);
        };

        const handlePromptAvailable = (e) => {
            const prompt = e?.detail || globalDeferredPrompt || window.deferredInstallPrompt || null;
            if (prompt) {
                setInstallPrompt(prompt);
            }
        };

        const handleNativePrompt = (e) => {
            e.preventDefault();
            globalDeferredPrompt = e;
            window.deferredInstallPrompt = e;
            setInstallPrompt(e);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setInstallPrompt(null);
            setShowInstructions(false);
        };

        // Sync immediately if prompt exists on window or module
        if (window.deferredInstallPrompt || globalDeferredPrompt) {
            setInstallPrompt(globalDeferredPrompt || window.deferredInstallPrompt);
        }

        window.addEventListener("pwa-prompt-available", handlePromptAvailable);
        window.addEventListener("beforeinstallprompt", handleNativePrompt);
        window.addEventListener("app-installed-state", handleAppInstalled);
        window.addEventListener("appinstalled", handleAppInstalled);
        standaloneQuery.addEventListener("change", handleDisplayModeChange);

        return () => {
            window.removeEventListener("pwa-prompt-available", handlePromptAvailable);
            window.removeEventListener("beforeinstallprompt", handleNativePrompt);
            window.removeEventListener("app-installed-state", handleAppInstalled);
            window.removeEventListener("appinstalled", handleAppInstalled);
            standaloneQuery.removeEventListener("change", handleDisplayModeChange);
        };
    }, []);

    const handleInstallClick = async () => {
        const promptToUse = installPrompt || globalDeferredPrompt || window.deferredInstallPrompt;

        if (!promptToUse) {
            setShowInstructions((prev) => !prev);
            return;
        }

        try {
            await promptToUse.prompt();
            const { outcome } = await promptToUse.userChoice;

            if (outcome === "accepted") {
                globalDeferredPrompt = null;
                window.deferredInstallPrompt = null;
                setInstallPrompt(null);
                setShowInstructions(false);
            }
        } catch (error) {
            console.error("Installation failed:", error);
            setShowInstructions(true);
        }
    };

    if (isInstalled) return null;

    return (
        <div className="relative">
            <button
                onClick={handleInstallClick}
                aria-label="Install app"
                className={`flex items-center gap-1.5 rounded-full bg-pink-600 px-3 py-2 text-sm font-medium text-white hover:bg-pink-700 transition-colors ${className}`}
            >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Install App</span>
            </button>

            {showInstructions && (
                <div className="fixed bottom-4 left-3 right-3 z-[9999] mx-auto w-auto max-w-sm rounded-lg border bg-white p-4 text-sm text-gray-800 shadow-xl sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72">
                    <h3 className="mb-2 font-semibold">
                        Install AK Cloth Store
                    </h3>

                    {isIOS ? (
                        <p>
                            1. Open this website in Safari.
                            <br />
                            2. Tap the Share button.
                            <br />
                            3. Select "Add to Home Screen".
                            <br />
                            4. Tap Add.
                        </p>
                    ) : (
                        <p>
                            Open this website in Chrome. Tap the three-dot
                            menu and select "Install and create shortcut".
                        </p>
                    )}

                    <button
                        onClick={() => setShowInstructions(false)}
                        className="mt-3 font-medium text-pink-600"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default InstallAppButton;
