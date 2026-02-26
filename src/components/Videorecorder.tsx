import React, { useState, useRef } from "react";

export default function ProfessionalRecorder({
  children,
}: {
  children: React.ReactNode;
}) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const startRecording = async () => {
    try {
      // 1. Get Screen Stream with strict constraints
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          suppressLocalAudioPlayback: false,
        },
        preferCurrentTab: true,
        selfBrowserSurface: "include",
        monitorTypeSurfaces: "exclude",
        systemAudio: "include",
      } as any);

      // 2. Get Mic Stream with its own processing
      const micStream = await navigator.mediaDevices
        .getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        })
        .catch(() => null);

      // 3. Setup the Audio Engine with a fixed Sample Rate to prevent "knocking"
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({
        sampleRate: 44100,
      });
      audioCtxRef.current = audioContext;

      const destination = audioContext.createMediaStreamDestination();

      // --- PROCESS TAB AUDIO ---
      if (screenStream.getAudioTracks().length > 0) {
        const tabSource = audioContext.createMediaStreamSource(screenStream);
        // Create a gain node to act as a buffer
        const tabGain = audioContext.createGain();
        tabSource.connect(tabGain);
        tabGain.connect(destination); // To Recording
        // We DO NOT connect tabSource to audioContext.destination here
        // because suppressLocalAudioPlayback: false already handles local hearing.
      } else {
        alert("Check 'Share tab audio' in the popup!");
        screenStream.getTracks().forEach((t) => t.stop());
        return;
      }

      // --- PROCESS MIC AUDIO ---
      if (micStream) {
        const micSource = audioContext.createMediaStreamSource(micStream);
        const micGain = audioContext.createGain();
        micSource.connect(micGain);
        micGain.connect(destination); // To Recording ONLY
      }

      // 4. Merge Video + Mixed Audio
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ]);

      // 5. Recorder Configuration
      chunksRef.current = [];
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm; codecs=vp9,opus",
        audioBitsPerSecond: 128000,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          //if number was passed to .start(), we get multiple ondataavailable events with chunks of the recording, otherwise we get one event at the end with the entire recording
          chunksRef.current.push(e.data);

          //we can send chunks to the server as they come in or wait for the recording to stop and send the entire recording at once. For large recordings, it's better to send chunks to the server as they come in to avoid memory issues.
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `recording-${Date.now()}.webm`;
        a.click();

        screenStream.getTracks().forEach((t) => t.stop());
        if (micStream) micStream.getTracks().forEach((t) => t.stop());
        if (audioCtxRef.current) audioCtxRef.current.close();
        setRecording(false);
      };

      //add a number to .start() to specify the timeslice for ondataavailable events, e.g. recorder.start(1000) for 1 second chunks
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      console.error("Recording failed", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
  };

  return (
    <div className="relative w-full h-full">
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
        {recording && (
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold animate-pulse shadow-xl">
            ● RECORDING CURRENT TAB
          </div>
        )}
        <div className="bg-white p-4 rounded-2xl shadow-2xl border flex gap-4">
          {!recording ? (
            <button
              onClick={startRecording}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold"
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-black text-white px-8 py-3 rounded-xl font-bold"
            >
              Stop & Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
