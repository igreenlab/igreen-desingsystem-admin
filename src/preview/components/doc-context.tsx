import { createContext, useContext } from "react";

type DocNavContext = {
  onNavigate: (pageId: string) => void;
};

const DocNavCtx = createContext<DocNavContext>({ onNavigate: () => {} });

export function DocNavProvider({ onNavigate, children }: { onNavigate: (pageId: string) => void; children: React.ReactNode }) {
  return <DocNavCtx.Provider value={{ onNavigate }}>{children}</DocNavCtx.Provider>;
}

export function useDocNav() {
  return useContext(DocNavCtx);
}
