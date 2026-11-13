
import { useState, useEffect } from "react";
import { Download } from "lucide-react";

const InstallAppButton = ({ className = "" }) => {
    // Check installation status immediately to avoid button flickering
    const [isInstalled, setIsInstalled] = useState(() => {
        return (
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true
        );
    });

    const [installPrompt, setInstallPrompt] = useState(null);
    const [showInstructions, setShowInstructions] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

        const standaloneQuery = window.matchMedia(
            "(display-mode: standalone)"
        );

        const handleDisplayModeChange = (event) => {
            setIsInstalled(
                event.matches || window.navigator.standalone === true
            );
        };

        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setInstallPrompt(event);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setInstallPrompt(null);
            setShowInstructions(false);
        };

        standaloneQuery.addEventListener(
            "change",
            handleDisplayModeChange
        );

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        );

        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            standaloneQuery.removeEventListener(
                "change",
                handleDisplayModeChange
            );

            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );

            window.removeEventListener(
                "appinstalled",
                handleAppInstalled
            );
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) {
            setShowInstructions((prev) => !prev);
            return;
        }

        await installPrompt.prompt();

        const choice = await installPrompt.userChoice;

        console.log("Installation choice:", choice.outcome);

        setInstallPrompt(null);
    };

    // Never display inside an installed application
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
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border bg-white p-4 shadow-xl text-sm text-gray-800">
                    <h3 className="font-semibold mb-2">
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
                            Open this website in Chrome or another supported
                            browser. Open its menu and look for "Install app"
                            or "Add to Home Screen".
                        </p>
                    )}

                    <button
                        onClick={() => setShowInstructions(false)}
                        className="mt-3 text-pink-600 font-medium"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default InstallAppButton;
