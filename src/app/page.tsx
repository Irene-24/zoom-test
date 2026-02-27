"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [sessionName, setSessionName] = useState("");
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("1");
  const router = useRouter();
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <h1 className="text-3xl font-bold text-center my-4">
        Zoom VideoSDK Next.js Quickstart
      </h1>

      <div className="flex gap-4 mb-8">
        <Link href="/create-session">
          <Button variant="outline">Create Session (REST API)</Button>
        </Link>
        <Link href="/recordings">
          <Button variant="outline">View Recordings</Button>
        </Link>
      </div>
      <Input
        type="text"
        className="w-full max-w-xs"
        placeholder="Session Name"
        value={sessionName}
        onChange={(e) => setSessionName(e.target.value)}
      />
      <Input
        type="text"
        className="w-full max-w-xs mt-4"
        placeholder="Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <select
        className="w-full max-w-xs mt-4 border rounded px-3 py-2 text-sm"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="1">Host</option>
        <option value="0">Attendee</option>
      </select>
      <Button
        className="w-full max-w-xs mt-8"
        disabled={!sessionName || !userName}
        onClick={() => router.push(`/call/${sessionName}?userName=${encodeURIComponent(userName)}&role=${role}`)}
      >
        Create Session
      </Button>

      {/* <Button
        className="w-full max-w-xs mt-8"
        disabled={!sessionName}
        onClick={() => router.push(`/sessions/${sessionName}`)}
      >
        Create Session 2
      </Button> */}
    </main>
  );
}
