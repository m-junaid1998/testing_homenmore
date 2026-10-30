// Components call toast.error("Title", "optional description"). sonner is loaded on first use (and its <Toaster> is mounted
// lazily in app/providers.tsx), so it stays out of the JavaScript every page has to download first.
type Kind = "success" | "error" | "info" | "warning";
const show = (kind: Kind) => (title: string, description?: string) => {
  void import("sonner").then(({ toast }) => toast[kind](title, description ? { description } : undefined));
};

export const toast = { success: show("success"), error: show("error"), info: show("info"), warning: show("warning") };
