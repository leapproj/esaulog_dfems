import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listRecentCheckins,
  redeemAccessKey,
  scanEpass,
  type GateSession,
} from "@/lib/server/gate";

type GateSearch = { festival?: string; code?: string };

export const Route = createFileRoute("/gate")({
  validateSearch: (s: Record<string, unknown>): GateSearch => ({
    festival: typeof s.festival === "string" ? s.festival : undefined,
    code: typeof s.code === "string" ? s.code : undefined,
  }),
  component: GatePage,
});

function GatePage() {
  const search = Route.useSearch();
  const [session, setSession] = useState<GateSession | null>(null);
  const [code, setCode] = useState(search.code ?? "HIGALAAY-GATE-A");
  const enter = useMutation({
    mutationFn: () => redeemAccessKey({ data: code }),
    onSuccess: (res) => {
      if (res.ok) setSession(res.session);
      else setErr(res.reason);
    },
  });
  const [err, setErr] = useState<string | null>(null);

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="w-full max-w-sm">
          <Wordmark />
          <h1 className="mt-8 font-display text-3xl tracking-tight">Event access key</h1>
          <p className="mt-2 text-sm text-muted">
            Ushers enter with an event access key. Demo keys are listed on the festival page.
          </p>
          <form
            className="mt-6 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setErr(null);
              enter.mutate();
            }}
          >
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="HIGALAAY-GATE-A"
              autoCapitalize="characters"
              className="h-14 font-mono tracking-wide"
            />
            <Button type="submit" size="lg" disabled={enter.isPending}>
              Enter
            </Button>
          </form>
          {err ? <p className="mt-3 text-sm text-danger">{err}</p> : null}
        </div>
      </main>
    );
  }

  return <Scanner session={session} onLeave={() => setSession(null)} />;
}

function Scanner({ session, onLeave }: { session: GateSession; onLeave: () => void }) {
  const [cred, setCred] = useState("ESA-0001821");
  const [result, setResult] = useState<
    | { ok: true; name: string; credentialId: string; eventName: string }
    | { ok: false; reason: string; name?: string }
    | null
  >(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cam, setCam] = useState(false);

  const scan = useMutation({
    mutationFn: (credential: string) =>
      scanEpass({ data: { code: session.code, credential } }),
    onSuccess: (res) => {
      if (res.ok) {
        setResult({
          ok: true,
          name: res.participant.name,
          credentialId: res.participant.credentialId,
          eventName: res.participant.eventName,
        });
      } else {
        setResult({
          ok: false,
          reason: res.reason,
          name: res.participant?.name,
        });
      }
      void recent.refetch();
    },
  });

  const recent = useQuery({
    queryKey: ["gate-recent", session.code],
    queryFn: () => listRecentCheckins({ data: session.code }),
  });

  useEffect(() => {
    if (!cam) return;
    let stream: MediaStream | null = null;
    let stop = false;
    const run = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        const Detector = (
          window as unknown as {
            BarcodeDetector?: new (o: { formats: string[] }) => {
              detect: (s: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
            };
          }
        ).BarcodeDetector;
        if (!Detector || !videoRef.current) return;
        const det = new Detector({ formats: ["qr_code"] });
        const loop = async () => {
          if (stop || !videoRef.current) return;
          try {
            const codes = await det.detect(videoRef.current);
            if (codes[0]?.rawValue) {
              scan.mutate(codes[0].rawValue);
              stop = true;
            }
          } catch {
            /* detector may throw on empty frames */
          }
          if (!stop) requestAnimationFrame(() => void loop());
        };
        void loop();
      } catch {
        setCam(false);
      }
    };
    void run();
    return () => {
      stop = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [cam, scan]);

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-8">
      <div className="flex items-center justify-between">
        <Wordmark />
        <button type="button" className="text-sm text-muted" onClick={onLeave}>
          Leave gate
        </button>
      </div>
      <p className="mt-8 text-xs tracking-[0.2em] text-muted uppercase">Assigned event</p>
      <h1 className="font-display text-3xl tracking-tight">{session.eventName}</h1>
      <p className="text-sm text-muted">
        {session.gateName ?? "Gate"} · {session.festivalName}
      </p>

      {result ? (
        <div
          className={`mt-8 rounded-xl p-6 ${result.ok ? "bg-ok/15" : "bg-danger/15"}`}
        >
          <p className="text-xs tracking-[0.2em] uppercase">{result.ok ? "Valid" : "Invalid"}</p>
          <p className="mt-2 font-display text-3xl">{result.ok ? result.name : result.name ?? "—"}</p>
          {result.ok ? (
            <p className="mt-1 font-mono text-sm">{result.credentialId}</p>
          ) : (
            <p className="mt-2 text-sm">{result.reason}</p>
          )}
          {result.ok ? (
            <p className="mt-3 text-sm text-muted">Registered · {result.eventName}</p>
          ) : null}
        </div>
      ) : null}

      <form
        className="mt-8 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          scan.mutate(cred);
        }}
      >
        <Input
          value={cred}
          onChange={(e) => setCred(e.target.value)}
          placeholder="Scan ePASS or enter ID"
          className="h-14 font-mono"
        />
        <Button type="submit" size="lg" disabled={scan.isPending}>
          {scan.isPending ? "Checking…" : "Scan ePASS"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setCam((c) => !c)}>
          {cam ? "Stop camera" : "Use camera"}
        </Button>
      </form>
      {cam ? (
        <video ref={videoRef} autoPlay playsInline className="mt-4 w-full rounded-xl bg-surface" />
      ) : null}

      <h2 className="mt-10 text-xs tracking-wide text-muted uppercase">Recent</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {(recent.data ?? []).map((r) => (
          <li key={r.id} className="flex justify-between rounded-md bg-surface px-3 py-2">
            <span>{r.full_name}</span>
            <span className={r.result === "valid" ? "text-ok" : "text-danger"}>{r.result}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
