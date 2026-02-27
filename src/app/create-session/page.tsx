"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

type CreatedSession = {
  session_name: string;
  session_id?: string;
};

export default function CreateSessionPage() {
  const [sessionName, setSessionName] = useState("");
  const [sessionPassword, setSessionPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedSession | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/zoom/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_name: sessionName, session_password: sessionPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(JSON.stringify(data.error ?? data));
        return;
      }
      setCreated({ session_name: data.session_name ?? sessionName, session_id: data.id });
    } catch (e) {
      setError("Something went wrong. Check console.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const attendeeLink = created
    ? `${origin}/call/${encodeURIComponent(created.session_name)}?role=0`
    : "";

  function copyLink() {
    navigator.clipboard.writeText(attendeeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24 gap-6">
      <Link href="/" className="self-start text-sm text-muted-foreground hover:underline">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold">Create a Session</h1>

      {!created ? (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Input
            placeholder="Session Name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
          <Input
            placeholder="Password (optional)"
            type="password"
            value={sessionPassword}
            onChange={(e) => setSessionPassword(e.target.value)}
          />
          {error && (
            <p className="text-sm text-red-500 break-all">{error}</p>
          )}
          <Button
            onClick={handleCreate}
            disabled={!sessionName || loading}
          >
            {loading ? "Creating..." : "Create Session"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <p className="text-green-600 font-medium">
            Session &quot;{created.session_name}&quot; created!
          </p>

          <div className="border rounded p-3 bg-muted text-sm break-all">
            {attendeeLink}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={copyLink}>
              {copied ? "Copied!" : "Copy Attendee Link"}
            </Button>
            <Link
              href={`/call/${encodeURIComponent(created.session_name)}?userName=Host&role=1`}
              className="flex-1"
            >
              <Button className="w-full">Join as Host</Button>
            </Link>
          </div>

          <Button
            variant="ghost"
            onClick={() => { setCreated(null); setSessionName(""); setSessionPassword(""); }}
          >
            Create Another
          </Button>
        </div>
      )}
    </main>
  );
}
