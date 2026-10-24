"use client";

export default function ConfirmButton({ children, message, className = "a-btn a-btn-danger" }: { children: React.ReactNode; message: string; className?: string }) {
  return (
    <button className={className} onClick={(e) => !confirm(message) && e.preventDefault()}>
      {children}
    </button>
  );
}
