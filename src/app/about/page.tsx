import PageShell, { ComingSoon } from "@/components/PageShell";

export default function Page() {
  return (
    <PageShell title="About and trade-offs" subtitle="What we chose, what we left out, and how we handle wrong or missing data.">
      <ComingSoon what="Trade-offs write-up" />
    </PageShell>
  );
}
