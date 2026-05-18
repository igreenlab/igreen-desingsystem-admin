/**
 * Preview Doc Components — Building blocks para páginas de documentação.
 *
 * Uso:
 *   import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";
 */

export { DocLayout } from "./doc-layout";
export { DocHeader } from "./doc-header";
export { DocSeparator, SectionH2 } from "./doc-section";
export { ExampleSection } from "./doc-example";
export { PropsTable, type PropItem } from "./doc-props-table";
export { DocSidebar, type DocNavSection } from "./doc-sidebar";
export { TOC, type TocItem } from "./doc-toc";
export { EyeIcon, CodeIcon, CopyIcon, ExternalIcon, TocIcon } from "./doc-icons";
export { getDocNav, getDocNavByHref } from "./doc-nav-data";
export { DocNavProvider, useDocNav } from "./doc-context";
