"use client";

import { Download, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RecordingActions({
  downloadHref,
  sessionId,
  recordingId,
  isLastFile,
}: {
  downloadHref: string;
  sessionId: string;
  recordingId: string;
  isLastFile: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this recording? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/zoom/recordings?sessionId=${sessionId}&recordingId=${recordingId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Delete failed", res.status, body);
        return;
      }
      if (isLastFile) {
        await fetch(`/api/zoom/sessions/${sessionId}`, { method: "DELETE" });
      }
      router.refresh();
    } catch (err) {
      console.error("Delete error", err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 justify-end">
      <a href={downloadHref} title="Download" className="text-muted-foreground hover:text-foreground transition-colors">
        <Download className="w-4 h-4" />
      </a>
      <button
        onClick={() => void handleDelete()}
        disabled={deleting}
        title="Delete"
        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
