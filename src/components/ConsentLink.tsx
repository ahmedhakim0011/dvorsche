"use client";

export default function ConsentLink() {
  return (
    <button className="link-btn" onClick={() => window.dispatchEvent(new Event("dv:open-consent"))}>
      Analytics preferences
    </button>
  );
}
