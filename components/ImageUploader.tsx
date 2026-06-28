"use client";

import { useRef, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

const BUCKET = "media";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Sub-folder inside the bucket, e.g. "gallery" or "story". */
  folder?: string;
}

function safeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${Date.now()}-${rand}.${ext || "jpg"}`;
}

/**
 * Image field with an upload button. Uploads to the public Supabase Storage
 * "media" bucket under a unique path (so the URL is always fresh — no cache
 * collisions) and writes the resulting public URL back via onChange. Still
 * accepts a pasted URL or /images/… path for backward compatibility.
 */
export default function ImageUploader({ label, value, onChange, folder = "gallery" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setErr(null);
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErr("Image is larger than 10 MB. Please pick a smaller file.");
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setErr("Supabase is not configured.");
      return;
    }
    setBusy(true);
    const path = `${folder}/${safeName(file.name)}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
    if (error) {
      setErr(error.message.includes("row-level security") ? "Upload blocked — sign in as an admin." : error.message);
      setBusy(false);
      return;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-12 w-12 flex-none rounded-md border border-champagne/30 object-cover" />
        ) : (
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-md border border-dashed border-champagne/40 text-champagne/50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 16l4-4 3 3 5-5 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
        )}
        <input
          className="input-field flex-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Upload, or paste a URL / /images/… path"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="btn-outline flex-none px-4 py-2 text-xs disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
      </div>
      {err && <span className="mt-1 block font-sans text-xs text-blush-dark">{err}</span>}
    </label>
  );
}
