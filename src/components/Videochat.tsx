"use client";
import {
  CSSProperties,
  type SetStateAction,
  type Dispatch,
  useState,
  useRef,
  useEffect,
} from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { Button } from "./ui/button";
import {
  useSession,
  useSessionUsers,
  VideoPlayerComponent,
  VideoPlayerContainerComponent,
  useVideoState,
  useAudioState,
  useMyself,
} from "@zoom/videosdk-react";
import VideoRecorder from "./Videorecorder";
import ZoomVideo from "@zoom/videosdk";
import Image from "next/image";

const Container = (props: { slug: string; JWT: string }) => {
  const [inCall, setInCall] = useState(false);
  return inCall ? (
    <Videochat {...props} setInCall={setInCall} />
  ) : (
    <Button onClick={() => setInCall(true)}>Join session</Button>
  );
};

const Videochat = (props: {
  slug: string;
  JWT: string;
  setInCall: Dispatch<SetStateAction<boolean>>;
}) => {
  const { slug: session, JWT, setInCall } = props;
  const { isLoading, isError, isInSession, error } = useSession(
    session,
    JWT,
    userName,
    "",
    30,
    {
      videoOptions: {
        hd: true,
        fullHd: true,
        virtualBackground: {
          imageUrl:
            "https://images.unsplash.com/photo-1715490187538-30a365fa05bd?q=80&w=1945&auto=format&fit=crop",
        },
      },
    },
  );
  const participants = useSessionUsers();
  const { isVideoOn, toggleVideo } = useVideoState();
  const { isAudioMuted, toggleMute } = useAudioState();
  const clientRef = useRef<any>(null);
  const [transcripts, setTranscripts] = useState<any[]>([]);

  useEffect(() => {
    clientRef.current = ZoomVideo.createClient();
    // Optionally, cleanup on unmount
    return () => {
      clientRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!clientRef.current) return;
    // Listen for caption-message events
    const handler = (payload: any) => {
      setTranscripts((prev) => [...prev, payload]);
      console.log("Transcript array:", [...transcripts, payload]);
      console.log(`${payload.displayName} said: ${payload.text}`);
    };
    clientRef.current.on && clientRef.current.on("caption-message", handler);

    return () => {
      clientRef.current?.off && clientRef.current.off("caption-message", handler);
    };
  }, [transcripts]);

  useEffect(() => {
    if (clientRef.current && isInSession && participants.length > 0) {
      console.log({ client: clientRef.current });
      const ltt = clientRef.current.getLiveTranscriptionClient();
      const cloudRecording = clientRef.current.getRecordingClient();

      cloudRecording.startCloudRecording();

      ltt.startLiveTranscription();
    }
  }, [isInSession, participants.length]);
  console.log({ participants });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.reason}</div>;

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <h1 className="text-center text-3xl font-bold mb-4 mt-0">
        Session: {session}
      </h1>
      <div>
        {isInSession && (
          <VideoPlayerContainerComponent style={videoPlayerStyle}>
            {participants.map((participant) =>
              participant.bVideoOn ? (
                <VideoPlayerComponent key={participant.userId} user={participant} />
              ) : (
                <div
                  key={`av-${participant.userId}`}
                  className="relative w-10 h-10 bg-red-200"
                >
                  <Image
                    fill
                    src={participant.avatar || ""}
                    alt={participant.displayName}
                    unoptimized
                  />
                </div>
              ),
            )}
          </VideoPlayerContainerComponent>
        )}
      </div>
      <div className="flex w-full flex-col justify-around self-center">
        <div className="mt-4 flex w-[30rem] flex-1 justify-around self-center rounded-md bg-white p-4">
          <Button onClick={() => void toggleVideo()} title="camera">
            {isVideoOn ? <Video /> : <VideoOff />}
          </Button>
          <Button onClick={toggleMute} title="microphone">
            {isAudioMuted ? <MicOff /> : <Mic />}
          </Button>
          <Button onClick={() => setInCall(false)} title="leave session">
            <PhoneOff />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Container;

const videoPlayerStyle = {
  height: "75vh",
  marginTop: "1.5rem",
  marginLeft: "3rem",
  marginRight: "3rem",
  alignContent: "center",
  borderRadius: "10px",
  overflow: "hidden",
} as CSSProperties;

const userName = `User-${new Date().getTime().toString().slice(8)}`;
