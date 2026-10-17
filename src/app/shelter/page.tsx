import PageShell, { ComingSoon } from "@/components/PageShell";

export default function Page() {
  return (
    <PageShell title="Shelter Desk" subtitle="Track beds, supplies and arrivals.">
      <ComingSoon what="Bed counts and arrivals" />
    </PageShell>
  );
}
