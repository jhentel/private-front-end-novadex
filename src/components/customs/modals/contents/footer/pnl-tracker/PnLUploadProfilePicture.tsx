"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { usePnlSettings } from "@/stores/use-pnl-settings";

// ######## Components 🧩 ########
import Image from "next/image";
import { Label } from "@/components/ui/label";

// ######## Types 🗨️ ########
interface UploadProfilePictureProps {
  setProfilePicture: (base64: string) => void;
}

const PnLUploadProfilePicture = ({
  setProfilePicture,
}: UploadProfilePictureProps) => {
  const { profilePicture: savedProfilePicture } = usePnlSettings();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load image from sessionStorage on component mount
  useEffect(() => {
    if (savedProfilePicture) {
      setPreviewUrl(savedProfilePicture);
      setProfilePicture(savedProfilePicture);
    }
  }, [savedProfilePicture]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const uploadedFile = acceptedFiles[0];

      // Validate file size
      if (uploadedFile.size > 2 * 1024 * 1024) {
        setError("File size must be under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setProfilePicture(base64String);
        setPreviewUrl(base64String);
      };
      reader.readAsDataURL(uploadedFile);
    },
    [setProfilePicture],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
    multiple: false,
  });

  const clearImage = () => {
    setProfilePicture("");
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-geistRegular text-xs text-fontColorSecondary">
        Upload Profile Picture
      </Label>

      <div
        {...getRootProps()}
        className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-[8px] border border-dashed border-[#242436] bg-[#17171F] transition hover:border-gray-400"
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <div className="relative h-full w-full">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="rounded-[10px] object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <p className="text-sm text-white">Click to change image</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-center text-sm text-gray-400">
              500px x 500px, 2MB, .PNG, .JPG <br />
              drag and drop or click{" "}
              <span className="font-medium text-purple-400">upload</span>
            </p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {previewUrl && (
        <button
          type="button"
          onClick={clearImage}
          className="mt-2 self-end text-xs text-red-400"
        >
          Remove Image
        </button>
      )}
    </div>
  );
};

export default PnLUploadProfilePicture;
