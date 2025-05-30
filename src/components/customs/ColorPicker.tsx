"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { RgbaColorPicker } from "react-colorful";

type RGBA = { r: number; g: number; b: number; a: number };
type RGBAResult = { color: RGBA; valid: boolean };

function hexToRgba(hex: string): RGBAResult {
  const normalizedHex = hex.replace(/^#/, "");

  if (normalizedHex.length === 3 || normalizedHex.length === 4) {
    const r = parseInt(normalizedHex[0] + normalizedHex[0], 16);
    const g = parseInt(normalizedHex[1] + normalizedHex[1], 16);
    const b = parseInt(normalizedHex[2] + normalizedHex[2], 16);
    const a =
      normalizedHex.length === 4
        ? parseInt(normalizedHex[3] + normalizedHex[3], 16) / 255
        : 1;
    return { color: { r, g, b, a }, valid: true };
  }

  if (normalizedHex.length === 6 || normalizedHex.length === 8) {
    const r = parseInt(normalizedHex.slice(0, 2), 16);
    const g = parseInt(normalizedHex.slice(2, 4), 16);
    const b = parseInt(normalizedHex.slice(4, 6), 16);
    const a =
      normalizedHex.length === 8
        ? parseInt(normalizedHex.slice(6, 8), 16) / 255
        : 1;
    return { color: { r, g, b, a }, valid: true };
  }

  return { color: { r: 0, g: 0, b: 0, a: 0 }, valid: false };
}

type HexResult = { hex: string; opacity: number };

function rgbaToHex({ r, g, b, a = 1 }: RGBA): HexResult {
  const toHex = (value: number): string =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0");

  const hex = `${toHex(r)}${toHex(g)}${toHex(b)}`;
  const opacity = Math.max(0, Math.min(1, a));

  return { hex, opacity };
}

function convertToHex({ r, g, b, a = 1 }: RGBA): string {
  const toHex = (value: number): string =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0");

  const hexR = toHex(r);
  const hexG = toHex(g);
  const hexB = toHex(b);
  const hexA = toHex(a * 255);

  return a >= 1 ? `#${hexR}${hexG}${hexB}` : `#${hexR}${hexG}${hexB}${hexA}`;
}

interface ColorPickerProps {
  color: string;
  savedColors: string[];
  onChange: (color: { hex: string; rgba: RGBA }) => void;
  onSaveColor: (color: string) => void;
}

export function ColorPicker(props: ColorPickerProps) {
  const { color, savedColors, onChange, onSaveColor } = props;
  const initialColor = useRef(color);
  const [rgba, setRgba] = useState(hexToRgba(color));
  const { hex, opacity } = useMemo(() => rgbaToHex(rgba.color), [rgba]);

  const displayedSavedColors = useMemo(
    () => savedColors.reverse().slice(0, 14),
    [savedColors],
  );

  function handleRgbaChange(color: RGBA) {
    const opacity = 1;
    setRgba({ color: { ...color, a: opacity }, valid: true });
  }

  function handleHexChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const rbga = hexToRgba(value);
    setRgba(rbga);
  }

  function handleOpacityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseInt(e.target.value) / 100;
    setRgba({ ...rgba, color: { ...rgba.color, a: value } });
  }

  function handleAddColor() {
    function uniqueArray<T>(arr: T[]): T[] {
      return [...new Set(arr)];
    }

    onSaveColor(convertToHex(rgba.color));
  }

  function handleSelectSavedColor(color: string) {
    setRgba(hexToRgba(color));
  }

  useEffect(() => {
    const hex = convertToHex(rgba.color);
    onChange({ hex, rgba: rgba.color });
  }, [rgba]);

  return (
    <div className="space-y-4">
      <div className="[&_.react-colorful\\_\\_alpha]:h-2 [&_.react-colorful\\_\\_alpha]:rounded-full [&_.react-colorful\\_\\_hue]:mb-4 [&_.react-colorful\\_\\_hue]:h-2 [&_.react-colorful\\_\\_hue]:rounded-full [&_.react-colorful\\_\\_pointer]:size-3 [&_.react-colorful\\_\\_saturation]:mb-4 [&_.react-colorful\\_\\_saturation]:h-[148px] [&_.react-colorful\\_\\_saturation]:rounded-lg [&_.react-colorful]:w-full">
        <RgbaColorPicker color={rgba.color} onChange={handleRgbaChange} />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-8 flex-1 items-center justify-start gap-2 rounded-lg border border-[#242436] px-3 py-[7px]">
          <span className="font-geistSemiBold text-sm text-[#9191A4]">#</span>
          <input
            className="h-full w-full bg-transparent font-geistRegular text-sm uppercase text-[#9191A4] focus:outline-none"
            value={hex}
            onChange={handleHexChange}
          />
        </div>
        <div className="flex h-8 w-[72px] items-center justify-end gap-2 rounded-lg border border-[#242436] px-3 py-[7px]">
          <input
            className="h-full w-full bg-transparent font-geistRegular text-sm text-[#9191A4] focus:outline-none"
            value={opacity * 100}
            onChange={handleOpacityChange}
          />
          <span className="font-geistSemiBold text-sm text-[#9191A4]">%</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-geistSemiBold text-xs text-[#9191A4]">
          Saved Color
        </span>
        <button
          className="flex items-center justify-start gap-1 font-geistSemiBold text-xs text-[#DF74FF]"
          onClick={handleAddColor}
        >
          <Plus size={12} />
          Add
        </button>
      </div>
      <div className="space-y-2">
        {chunkArray(displayedSavedColors, 7).map((colorRow, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center justify-normal gap-2"
          >
            {colorRow.map((hex, index) => {
              if (hex) {
                return (
                  <button
                    key={hex}
                    className="size-8 rounded-full border border-border transition-all duration-200 hover:ring-2 hover:ring-white sm:size-6"
                    style={{ backgroundColor: hex }}
                    onClick={() => handleSelectSavedColor(hex)}
                  ></button>
                );
              }

              return (
                <button
                  key={index}
                  className="invisible size-8 rounded-full sm:size-6"
                ></button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const chunkArray = <T,>(arr: T[], size: number): (T | undefined)[][] => {
  const chunks: (T | undefined)[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    const chunk: (T | undefined)[] = arr.slice(i, i + size);
    while (chunk.length < size) {
      chunk.push(undefined);
    }
    chunks.push(chunk);
  }

  return chunks;
};
