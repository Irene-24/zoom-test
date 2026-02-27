import Link from "next/link";
import { zoomFetch } from "@/lib/zoom-api";
import { RecordingActions } from "@/components/RecordingActions";

type RecordingFile = {
  id: string;
  file_type: "MP4" | "M4A" | "TIMELINE" | "TRANSCRIPT" | "CHAT" | "CC" | "CSV";
  file_size: number;
  download_url: string;
  status: string;
  recording_type: string;
  recording_start: string;
  recording_end: string;
};

type RecordingSession = {
  session_id: string;
  session_name: string;
  start_time: string;
  duration: number;
  total_size: number;
  recording_count: number;
  recording_files: RecordingFile[];
  participant_video_files?: RecordingFile[];
  participant_audio_files?: RecordingFile[];
};

async function getRecordings(): Promise<RecordingSession[]> {
  const res = await zoomFetch("/videosdk/recordings?page_size=30");
  if (!res.ok) return [];
  const data = await res.json();
  return data.sessions ?? [];
}

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString();
}

export default async function RecordingsPage() {
  const sessions = await getRecordings();

  return (
    <main className="flex flex-col min-h-screen p-12 gap-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recordings</h1>
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Back
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="text-muted-foreground">No recordings found.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {sessions.map((session) => (
            <div key={session.session_id} className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-3">
                <h2 className="font-semibold">{session.session_name}</h2>
                <p className="text-xs text-muted-foreground">{session.session_id}</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-2">Type</th>
                    <th className="text-left px-4 py-2">Started</th>
                    <th className="text-left px-4 py-2">Size</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {session.recording_files.map((file) => {
                    const filename = `${session.session_name}_${file.recording_type}.${file.file_type.toLowerCase()}`;
                    const downloadHref = `/api/zoom/recordings/download?url=${encodeURIComponent(file.download_url)}&filename=${encodeURIComponent(filename)}`;
                    return (
                      <tr key={file.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-2">
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                            {file.file_type}
                          </span>
                          <span className="ml-2 text-muted-foreground">{file.recording_type}</span>
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {formatDate(file.recording_start)}
                        </td>
                        <td className="px-4 py-2">{formatBytes(file.file_size)}</td>
                        <td className="px-4 py-2 capitalize">{file.status}</td>
                        <td className="px-4 py-2">
                          <RecordingActions
                            downloadHref={downloadHref}
                            sessionId={session.session_id}
                            recordingId={file.id}
                            isLastFile={session.recording_files.length === 1}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
