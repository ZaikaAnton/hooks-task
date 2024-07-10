import { useState, useEffect, useCallback, useRef } from "react";

type VisibilityChangeHandler = (isVisible: boolean) => void;

export function useDocumentVisibility() {
  const isSSR = typeof document === "undefined";

  const [visible, setVisible] = useState(() => {
    return isSSR || document.visibilityState === "visible";
  });

  const [count, setCount] = useState(0);
  const handlersRef = useRef<VisibilityChangeHandler[]>([]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";

      setVisible(isVisible);

      if (!isVisible) {
        setCount((prevCount) => prevCount + 1);
      }

      handlersRef.current.forEach((handler) => handler(isVisible));
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const onVisibilityChange = useCallback((handler: VisibilityChangeHandler) => {
    handlersRef.current.push(handler);

    return () => {
      handlersRef.current = handlersRef.current.filter((h) => h !== handler);
    };
  }, []);

  return { visible, count, onVisibilityChange };
}
