"use client";

import { useEffect, useRef, useState } from "react";
import BaseButton from "@/components/customs/buttons/BaseButton";
import Image from "next/image";
import { cn } from "@/libraries/utils";
import copy from "copy-to-clipboard";

export interface EarnReferralLinkProps {
  id: string;
}

export function EarnReferralLink({ id }: EarnReferralLinkProps) {
  return (
    <div className="border-1 flex h-[74px] w-full items-center justify-start gap-3 rounded-[12px] border-[#242436] bg-[#17171F] px-4 py-3 max-sm:h-fit">
      <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-b from-[#E077FF] to-[#5E30A8] lg:size-12">
        <div className="relative h-[20px] w-[20px] lg:h-[25px] lg:w-[25px]">
          <Image
            src="/icons/hierarchy.png"
            alt="Hierarchy Icon"
            fill
            quality={100}
          />
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <span className="font-geist text-xs text-[#9191A4]">
          Your Referral Link
        </span>
        <InputReferralLink id={id} />
      </div>
      <CopyButton id={id} />
    </div>
  );
}

export interface InputReferralLinkProps {
  id: string;
}

export function InputReferralLink({ id }: InputReferralLinkProps) {
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(id);
  const spanRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleEdit() {
    setEdit(!edit);
  }

  function handleSave() {
    setEdit(false);
  }

  function handleCancel() {
    setValue(id);
    setEdit(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  }

  useEffect(() => {
    if (edit && spanRef.current && inputRef.current) {
      const width = spanRef.current.offsetWidth || 12;
      inputRef.current.style.width = `${width + 20}px`;
    }
  }, [value, edit]);

  useEffect(() => {
    if (edit && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [edit]);

  return (
    <div className="flex items-center justify-start">
      <span className="font-geistSemiBold text-sm leading-[22px] text-[#FCFCFD] lg:text-xl lg:leading-7">
        nova.io/ref/
      </span>
      {edit ? (
        <>
          <div className="relative">
            <span className="pointer-events-none absolute left-0 top-1/2 z-10 -translate-y-1/2 font-geistSemiBold text-sm leading-[22px] text-[#DF74FF] lg:text-xl lg:leading-7">
              @
            </span>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              className="border-b border-[#DF74FF] bg-transparent pl-[19px] font-geistSemiBold text-sm leading-[22px] text-[#DF74FF] focus:outline-none lg:text-xl lg:leading-7"
            />
          </div>
          <span
            ref={spanRef}
            className="invisible absolute whitespace-pre font-geistSemiBold text-sm leading-[22px] lg:text-xl lg:leading-7"
          >
            {value}
          </span>
        </>
      ) : (
        <>
          <span className="font-geistSemiBold text-sm leading-[22px] text-[#DF74FF] lg:text-xl lg:leading-7">
            @{value}
          </span>

          <button className="ml-1" onClick={handleEdit}>
            <Image
              src="/icons/edit.png"
              alt="Edit Icon"
              width={16}
              height={16}
            />
          </button>
        </>
      )}
    </div>
  );
}

interface CopyButtonProps {
  id: string;
}

const CopyButton = ({ id }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 2000);
    }
  }, [copied]);

  const handleCopy = () => {
    copy(`nova.io/ref/${id}`);
    setCopied(true);
  };

  return (
    <BaseButton
      variant="primary"
      className="inline-flex max-h-10 min-h-10 min-w-10 gap-2 rounded-[8px] p-2 pr-3"
      prefixIcon={
        <div className={cn("relative aspect-square size-4 flex-shrink-0")}>
          <Image
            src="/icons/black-copy.svg"
            alt="Copy Icon"
            fill
            quality={100}
            className="object-contain duration-300"
          />
        </div>
      }
      onClick={handleCopy}
    >
      <span
        className={cn(
          "inline-block whitespace-nowrap font-geistSemiBold text-sm text-[#080811]",
        )}
      >
        {copied ? "Copied!" : "Copy"}
      </span>
    </BaseButton>
  );
};
