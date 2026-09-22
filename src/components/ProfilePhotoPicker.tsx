"use client";

import { useRef, useState } from "react";
import { Avatar } from "./Avatar";
import { CameraIcon } from "./Icon";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const AVATAR_SIZE = 512;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface ProfilePhotoPickerProps {
  name: string;
  value: string | null;
  onChange: (value: string | null) => void;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that image."));
    image.src = src;
  });
}

async function fileToAvatarDataUrl(file: File): Promise<string> {
  const rawUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.readAsDataURL(file);
  });

  const image = await loadImage(rawUrl);
  const side = Math.min(image.width, image.height);
  const sourceX = (image.width - side) / 2;
  const sourceY = (image.height - side) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare that image.");
  context.drawImage(image, sourceX, sourceY, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
  return canvas.toDataURL("image/jpeg", 0.86);
}

export function ProfilePhotoPicker({ name, value, onChange }: ProfilePhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Choose an image smaller than 5MB.");
      return;
    }

    try {
      setError(null);
      onChange(await fileToAvatarDataUrl(file));
    } catch {
      setError("We couldn't use that image. Try another photo.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div style={{ position: "relative" }}>
        <Avatar name={name || "You"} size={84} palette="bold" imageUrl={value} />
        <button
          type="button"
          aria-label="Choose profile photo"
          onClick={() => inputRef.current?.click()}
          style={{
            position: "absolute",
            right: -2,
            bottom: -2,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--c-gold)",
            border: "2px solid #fff",
            color: "var(--c-plum)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CameraIcon size={16} />
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => handleFile(event.target.files?.[0])}
        style={{ display: "none" }}
      />
      {value && (
        <button type="button" onClick={() => onChange(null)} className="sr-label" style={{ fontSize: 10, color: "var(--c-magenta)", fontWeight: 800 }}>
          Remove photo
        </button>
      )}
      {error && <p style={{ color: "var(--c-danger)", fontSize: 11 }}>{error}</p>}
    </div>
  );
}
