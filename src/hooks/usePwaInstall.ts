import { useMemo } from "react";

export function usePwaInstall() {
  const isIOS = useMemo(
    () => /iPad|iPhone|iPod/.test(navigator.userAgent),
    []
  );

  const isInstalled = useMemo(
    () =>
      (navigator as unknown as { standalone?: boolean }).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches,
    []
  );

  return { isInstalled, isIOS };
}
