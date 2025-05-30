import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

type GlobalPortalProps = {
  children: React.ReactNode;
};

export default function GlobalPortal({ children }: GlobalPortalProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.querySelector("body"));
  }, []);

  if (!portalRoot) return null;

  return ReactDOM.createPortal(children, portalRoot);
}
