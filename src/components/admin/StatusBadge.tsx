export default function StatusBadge({ status }: { status: string }) {
  return <span className={`a-badge s-${status}`}>{status}</span>;
}
