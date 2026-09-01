export function newId(prefix: string) {
  const raw = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `${prefix}_${raw}`;
}

export function credentialFromSeq(seq: number) {
  return `ESA-${String(seq).padStart(7, "0")}`;
}

export function qrPayload(credentialId: string) {
  return `esaulog:epass:${credentialId}`;
}
