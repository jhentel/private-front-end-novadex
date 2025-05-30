"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const TokenDexPaidImageHover = ({ tokenMint }: { tokenMint: string }) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = `https://media.nova.trade/api/banner/${tokenMint}`;

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      setAspectRatio(ratio);
      setImageLoaded(true);
    };
  }, [imageUrl]);

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-[2px] border-none bg-[#202037]"
      style={{
        aspectRatio: imageLoaded
          ? aspectRatio
            ? `${aspectRatio}`
            : undefined
          : "10/9",
        width: imageLoaded ? "300px" : "200px",
      }}
    >
      {imageLoaded ? (
        <Image
          src={imageUrl}
          alt="Token Dex Paid Image"
          fill
          className="object-cover"
          priority
          quality={50}
        />
      ) : (
        <div className="flex h-24 items-center justify-center">
          <div className="relative size-6 animate-spin">
            <Image
              src="/icons/search-loading.png"
              alt="Loading"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenDexPaidImageHover;
