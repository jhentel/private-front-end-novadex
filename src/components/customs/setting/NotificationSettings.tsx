import { useNotificationSettingsStore } from "@/stores/setting/use-notification-settings.store";
import CustomToast from "@/components/customs/toasts/CustomToast";
import toast from "react-hot-toast";
import Image from "next/image";
import { cn } from "@/libraries/utils";

interface NotificationSettingsProps {
  formId?: string;
  autoSave?: boolean;
}

function NotificationSettings({
  formId = "notification-settings-form",
  autoSave = false,
}: NotificationSettingsProps) {
  const { isMuted, setNotificationIsMutedStatus } =
    useNotificationSettingsStore();

  const options = [
    { label: "Mute", value: true },
    { label: "Unmute", value: false },
  ];

  const handleOptionChange = (value: boolean) => {
    setNotificationIsMutedStatus(value);

    toast.custom((t: any) => (
      <CustomToast
        tVisibleState={t.visible}
        message="Notification preference saved"
        state="SUCCESS"
      />
    ));
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <h1 className="font-geistBold text-sm text-fontColorPrimary max-md:hidden">
        Transactions Notification
      </h1>
      <div className="relative h-full w-full flex-grow flex-col overflow-hidden rounded-[8px] md:bg-[#242436]">
        <div className="relative grid grid-cols-2 gap-[1.5px]">
          {options.map((option) => (
            <div
              key={option.value ? "mute" : "unmute"}
              className="flex flex-col justify-end gap-2 bg-[#12121a] p-[16px]"
            >
              <button
                type="button"
                onClick={() => handleOptionChange(option.value)}
                className={cn(
                  "relative flex h-[70px] w-full items-center justify-center overflow-hidden transition duration-300",
                  "rounded-[8px] border-[1.5px] border-[#242436]",
                  "font-geistSemiBold text-sm",
                  isMuted === option.value
                    ? "border-primary bg-primary/15 text-[#DF74FF]"
                    : "text-fontColorPrimary hover:text-white",
                )}
              >
                {isMuted === option.value && (
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
                <div
                  className={cn(
                    "relative z-30 aspect-square flex-shrink-0",
                    option.value ? "size-9" : "size-8",
                  )}
                >
                  <Image
                    src={
                      option.value
                        ? "/icons/footer/sound-off.png"
                        : "/icons/footer/sound-on.png"
                    }
                    alt="Sound On Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </button>
              <div className="flex w-full items-center justify-center">
                <label className="text-center font-geistSemiBold text-xs text-fontColorSecondary">
                  {option.label}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings;
