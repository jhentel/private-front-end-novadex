// ######## Libraries 📦 & Hooks 🪝 ########
import toast from "react-hot-toast";
import { useCustomizeSettingsStore } from "@/stores/setting/use-customize-settings.store";
import { useEffect, useMemo, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

// ######## Components 🧩 ########
import CustomToast from "@/components/customs/toasts/CustomToast";
import Image from "next/image";
import CustomizedTokenInformationSettings from "./CustomizeTokenInformationSettings";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import {
  customTokenInformationSettingsSchema,
  TokenInformationSetting,
} from "@/apis/rest/settings/settings";

interface CustomizeTokenPageSettingsProps {
  formId?: string;
  autoSave?: boolean;
}

type FormData = z.infer<typeof customTokenInformationSettingsSchema>;

function CustomizeTokenPageSettings({
  formId = "customize-token-settings-form",
  autoSave = false,
}: CustomizeTokenPageSettingsProps) {
  const { presets, updatePreset, activePreset } = useCustomizeSettingsStore();
  const finalActivePreset = activePreset || "preset1";

  const form = useForm<FormData>({
    resolver: zodResolver(customTokenInformationSettingsSchema),
    defaultValues: {
      tokenInformationSetting:
        presets[finalActivePreset].tokenInformationSetting || "normal",
    },
  });

  const options = [
    { label: "Normal", value: "normal" },
    { label: "Simplify", value: "simplify" },
  ];

  const handleOptionChange = useCallback(
    (value: TokenInformationSetting) => {
      try {
        form.setValue("tokenInformationSetting", value, {
          shouldTouch: true,
          shouldValidate: true,
        });

        if (autoSave) {
          updatePreset(finalActivePreset, {
            ...presets[finalActivePreset],
            tokenInformationSetting: value,
          });
        }
      } catch (error) {
        console.warn("Error updating setting:", error);
      }
    },
    [autoSave, finalActivePreset, form, presets, updatePreset],
  );

  const onSubmit = useCallback(() => {
    try {
      const values = form.getValues();
      updatePreset(finalActivePreset, {
        ...presets[finalActivePreset],
        tokenInformationSetting: values.tokenInformationSetting,
      });

      toast.custom((t: any) => (
        <CustomToast
          tVisibleState={t.visible}
          message="Token Information layout preference saved"
          state="SUCCESS"
        />
      ));
    } catch (error) {
      console.warn("Error saving settings:", error);
    }
  }, [finalActivePreset, form, presets, updatePreset]);

  useEffect(() => {
    if (!autoSave) return;

    const subscription = form.watch(() => {
      onSubmit();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [autoSave, form, onSubmit]);

  const selectedOption = useMemo(() => {
    return presets[finalActivePreset].tokenInformationSetting;
  }, [presets, finalActivePreset]);

  return (
    <div className="flex w-full flex-col gap-3">
      <h1 className="font-geistBold text-sm text-fontColorPrimary max-md:hidden">
        Token Information
      </h1>
      <div className="relative h-full w-full flex-grow flex-col overflow-hidden rounded-[8px] md:bg-[#242436]">
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 pt-10 md:hidden">
          <Image
            src="/images/only-on-desktop.png"
            alt="Only Available on Desktop"
            width={180}
            height={120}
            className="mb-4"
          />
          <h3 className="text-center font-geistSemiBold text-2xl text-fontColorPrimary">
            Only Available on Desktop
          </h3>
          <p className="text-md text-center font-geistRegular text-fontColorSecondary">
            This feature is currently optimized for desktop use. Please switch
            to a desktop device for the best experience.
          </p>
        </div>
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="relative hidden grid-cols-2 gap-[1.5px] md:grid">
            {options.map((option) => (
              <div
                key={option.value}
                className="flex flex-col justify-end gap-2 bg-[#12121a] p-[16px]"
              >
                <button
                  type="button"
                  onClick={() =>
                    handleOptionChange(option.value as TokenInformationSetting)
                  }
                  className={cn(
                    "relative flex w-full flex-col overflow-hidden transition duration-300",
                    "rounded-[8px] border-[1.5px] border-[#242436]",
                    "font-geistSemiBold text-sm",
                    selectedOption === option.value
                      ? "border-primary bg-primary/15 text-[#DF74FF]"
                      : "text-fontColorPrimary hover:text-white",
                  )}
                >
                  {selectedOption === option.value && (
                    <div className="absolute -right-3.5 -top-3.5 z-10 flex size-9 items-center justify-start rounded-[24px] bg-primary pl-2 pt-2">
                      <Image
                        src="/icons/check.svg"
                        alt="Check Icon"
                        quality={50}
                        width={10}
                        height={10}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <CustomizedTokenInformationSettings
                    option={option.value as TokenInformationSetting}
                  />
                </button>
                <div className="flex w-full items-center justify-center">
                  <label className="text-center font-geistSemiBold text-xs text-fontColorSecondary">
                    {option.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomizeTokenPageSettings;
