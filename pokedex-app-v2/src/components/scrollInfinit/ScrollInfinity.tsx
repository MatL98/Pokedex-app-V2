import { useEffect, useRef } from "react";

type Options = {
  key?: string;
  offset?: number;
  onBottomReach?: () => void;
  isLoading?: boolean;
};

export function useScrollMemoryWithInfiniteScroll({
  key = location.pathname,
  offset = 100,
  onBottomReach,
  isLoading = false,
}: Options) {
  const restoring = useRef(true);
  const saveThrottle = useRef(false);
  const loadingRef = useRef(isLoading);

  useEffect(() => {
    loadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    const store = sessionStorage;

    const restoreScroll = () => {
      const saved = store.getItem(`scroll:${key}`);
      if (saved && !location.hash) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            window.scrollTo({ top: parseInt(saved, 10), behavior: "auto" });
            restoring.current = false;
          })
        );
      } else {
        restoring.current = false;
      }
    };

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    if (document.readyState === "complete") restoreScroll();
    else window.addEventListener("load", restoreScroll, { once: true });

    const onScroll = () => {
      if (!restoring.current) {
        if (!saveThrottle.current) {
          saveThrottle.current = true;
          setTimeout(() => {
            store.setItem(`scroll:${key}`, String(window.scrollY));
            saveThrottle.current = false;
          }, 150);
        }

        const bottomReached =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - offset;

        if (bottomReached && !loadingRef.current && onBottomReach) {
          onBottomReach();
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("beforeunload", () =>
      store.setItem(`scroll:${key}`, String(window.scrollY))
    );

    return () => {
      window.removeEventListener("scroll", onScroll);
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
    };
  }, [key, offset, onBottomReach]);
}
