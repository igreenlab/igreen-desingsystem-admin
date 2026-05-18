/* All-in-one */
export { Panel } from "./panel";

/* Composição manual */
export { PanelHeader } from "./panel-header";
export type { PanelHeaderProps } from "./panel-header";

export { PanelBody } from "./panel-body";
export type { PanelBodyProps } from "./panel-body";

export { PanelFooter } from "./panel-footer";
export type { PanelFooterProps } from "./panel-footer";

/* Re-export primitives shadcn pra composição manual avançada */
export {
  Sheet as PanelRoot,
  SheetTrigger as PanelTrigger,
  SheetClose as PanelCloseAction,
  SheetContent as PanelContent,
} from "../../shadcn/sheet";

/* Styles (pra override em casos custom) */
export { panelContainer } from "./panel.styles";

/* Types */
export type { PanelProps, PanelSide, PanelSize } from "./panel.types";
