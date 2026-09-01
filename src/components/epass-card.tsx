import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { EsaulogMark } from "./brand";

export function EpassCard({
  festivalName,
  participantName,
  credentialId,
  payload,
  city,
}: {
  festivalName: string;
  participantName: string;
  credentialId: string;
  payload: string;
  city?: string;
}) {
  const [src, setSrc] = useState<string>("");
  useEffect(() => {
    void QRCode.toDataURL(payload, {
      width: 280,
      margin: 1,
      color: { dark: "#161714", light: "#f3efe4" },
    }).then(setSrc);
  }, [payload]);

  return (
    <div className="epass-print mx-auto w-full max-w-sm overflow-hidden rounded-xl bg-paper text-ink shadow-[var(--shadow-border)]">
      <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3">
        <span className="text-[10px] tracking-[0.22em] uppercase">{festivalName}</span>
        <EsaulogMark className="size-6 text-ink" />
      </div>
      <div className="px-5 py-5">
        <p className="text-xs tracking-wide text-ink/50 uppercase">Participant</p>
        <p className="font-display text-2xl tracking-tight">{participantName}</p>
        <p className="mt-1 font-mono text-sm tabular-nums">{credentialId}</p>
        {city ? <p className="mt-1 text-xs text-ink/50">{city}</p> : null}
        <div className="mt-5 grid place-items-center rounded-lg bg-paper p-3">
          {src ? (
            <img src={src} alt="ePASS QR" className="size-44" />
          ) : (
            <div className="size-44 animate-pulse bg-ink/10" />
          )}
        </div>
        <p className="mt-4 text-center text-[10px] tracking-[0.2em] text-ink/50 uppercase">
          eSAULOG ePASS
        </p>
      </div>
    </div>
  );
}
