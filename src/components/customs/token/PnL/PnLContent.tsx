"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toPng } from "html-to-image";
import Handlebars from "handlebars";
import * as QRCode from "qrcode";
// @ts-ignore
// ######## Components 🧩 ########
import Image from "next/image";
import BaseButton from "@/components/customs/buttons/BaseButton";
import WalletSelectionButton from "@/components/customs/WalletSelectionButton";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Utils & Helpers 🤝 ########
import {
  formatAmountDollarPnL,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";
// ######## Types 🗨️ ########
import { Wallet } from "@/apis/rest/wallet-manager";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Copy } from "lucide-react";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import toast from "react-hot-toast";
import CustomToast from "../../toasts/CustomToast";
import { cn } from "@/libraries/utils";
import { getIsStrippedHoldingPreviewData } from "@/utils/getIsStrippedHoldingPreviewData";
import { getProxyUrl } from "@/utils/getProxyUrl";

function getRandomBinary(): number {
  return Math.floor(Math.random() * 2);
}

const getBase64Image = async (imageUrl: string): Promise<string> => {
  try {
    // First fetch the image through proxy
    const proxyResponse = await fetch(imageUrl, {
      mode: 'cors',
      cache: 'force-cache'
    });
    
    if (!proxyResponse.ok) {
      throw new Error(`Failed to fetch image: ${proxyResponse.statusText}`);
    }

    // Get the image blob
    const imageBlob = await proxyResponse.blob();

    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image blob'));
      };
      reader.readAsDataURL(imageBlob);
    });

  } catch (error) {
    console.error('Error converting proxy image to base64:', error);
    return '';
  }
};

const PnLContent = ({
  profitAndLoss,
  profitAndLossUsdRaw,
  profitAndLossPercentage,
  sold,
  soldDRaw,
  invested,
  investedDRaw,
  closeElement,
  scrollable,
  solPrice,
  wallets,
  setWallets,
  title,
  image,
  type,
  remaining,
  remainingDRaw,
}: {
  profitAndLoss: string | number;
  profitAndLossUsdRaw?: string | number;
  profitAndLossPercentage: string | number;
  sold: string | number;
  soldDRaw?: string | number;
  invested: string | number;
  investedDRaw?: string | number;
  closeElement: React.ReactNode;
  scrollable?: boolean;
  solPrice: number;
  wallets?: Wallet[];
  setWallets?: (wallets: Wallet[]) => void;
  title: string;
  image?: string;
  type?: string;
  remaining: string | number;
  remainingDRaw?: string | number;
}) => {
  const width = useWindowSizeStore((state) => state.width);

  const [isLoadingDownload, setIsLoadingDownload] = useState(false);
  const [showUSD, setShowUSD] = useState(true);

  const selectedWalletAddresses = wallets?.map((wallet) => wallet.address);
  const referralCode = "TradeOnNova";

  const randomBinary = useMemo(() => {
    return getRandomBinary();
  }, []);

  const getAmount = (
    value: any,
    formatter: (value: number, param?: any) => string,
    suffix: string = "",
    additionalParam: any = undefined,
  ) => formatter(Number(value) || 0, additionalParam) + suffix;

  useEffect(() => {
    // Register conditional helper for currency display
    Handlebars.registerHelper("currency", function (usdValue, solValue) {
      return showUSD ? usdValue : solValue;
    });
  }, [showUSD]);

  const generateQRCodeBase64 = async (text: string) => {
    try {
      return await QRCode.toDataURL(text, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 200,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  };

  // Example usage in your component:
  const [qrCodeBase64, setQRCodeBase64] = useState("");

  // Generate QR code for a specific URL or text
  useEffect(() => {
    const generateQR = async () => {
      const qrImage = await generateQRCodeBase64(referralCode);
      setQRCodeBase64(qrImage as string);
    };

    if (referralCode) {
      generateQR();
    }
  }, [referralCode]);

  const [imageBase64, setImageBase64] = useState<string>('');

useEffect(() => {
  const loadImage = async () => {
    if (image) {
      const imageProxy = getProxyUrl(image);
      const base64 = await getBase64Image(imageProxy);
      setImageBase64(base64 || image);
    }
  };
  
  loadImage();
}, [image]);

  // Modify templateData to exclude all dynamic values including image
  const templateData = useMemo(() => { 
    return {
      pnlBg:
        randomBinary === 0
          ? "/template/assets/pnl-trophy.png"
          : "/template/assets/pnl-rocket.png",
      symbol: type === "holding" ? "ALL HOLDINGS" : title,
      isImage: Boolean(image),
      image: imageBase64,
      showUSD,
      invested: getAmount(invested, formatAmountWithoutLeadingZero, ""),
      sold: getAmount(sold, formatAmountWithoutLeadingZero, ""),
      holding: getAmount(remaining, formatAmountWithoutLeadingZero, ""),
      investedD: investedDRaw
        ? getAmount(investedDRaw, formatAmountDollarPnL, "")
        : getAmount(
            Number(invested || 0) * solPrice,
            formatAmountDollarPnL,
            "",
          ),
      soldD: soldDRaw
        ? getAmount(soldDRaw, formatAmountDollarPnL, "")
        : getAmount(Number(sold || 0) * solPrice, formatAmountDollarPnL, ""),
      holdingD: remainingDRaw
        ? getAmount(remainingDRaw, formatAmountDollarPnL, "")
        : getAmount(
            Number(remaining || 0) * solPrice,
            formatAmountDollarPnL,
            "",
          ),
      roi:
        Number(invested || 0) !== 0
          ? (Number(profitAndLoss || 0) >= 0 ? "+" : "") +
            (
              (Number(profitAndLoss || 0) / Number(invested || 1)) *
              100
            ).toFixed(2) +
            "%"
          : "0%",
      roiD:
        Number(investedDRaw || 0) !== 0
          ? (Number(
              profitAndLossUsdRaw || Number(profitAndLoss || 0) * solPrice,
            ) >= 0
              ? "+"
              : "") +
            (
              (Number(
                profitAndLossUsdRaw || Number(profitAndLoss || 0) * solPrice,
              ) /
                Number(investedDRaw || Number(invested || 0) * solPrice || 1)) *
              100
            ).toFixed(2) +
            "%"
          : "0%",
      profitOrLoss: Number(profitAndLoss || 0) > 0 ? "Profit" : "Loss",
      profitD: profitAndLossUsdRaw
        ? (Number(profitAndLossUsdRaw) > 0 ? "+" : "") +
          getAmount(profitAndLossUsdRaw, formatAmountDollarPnL)
        : (Number(profitAndLoss || 0) * solPrice > 0 ? "+" : "") +
          getAmount(
            Number(profitAndLoss || 0) * solPrice,
            formatAmountDollarPnL,
          ),
      profit:
        (Number(profitAndLoss || 0) > 0 ? "+" : "") +
        getAmount(profitAndLoss, formatAmountWithoutLeadingZero),
      profitSol: getAmount(
        profitAndLoss,
        formatAmountWithoutLeadingZero,
        " SOL",
      ),
      isProfit: Number(profitAndLoss || 0) > 0,
      referralCode: referralCode,
      // qrCodeBase64: qrCodeBase64,
    };
  }, [
    selectedWalletAddresses,
    profitAndLoss,
    profitAndLossPercentage,
    solPrice,
    title,
    showUSD,imageBase64
    // qrCodeBase64,
  ]);

  // Add refs for DOM manipulation
  const templateContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to update DOM elements
  const updateDOMElements = useCallback((data: typeof templateData) => {
    if (!templateContainerRef.current) return;

    const container = templateContainerRef.current;

    // Update token logo if exists
    // const tokenLogoContainer = container.querySelector(
    //   "#token-logo-container",
    // ) as HTMLDivElement;
    // const tokenLogo = container.querySelector(
    //   "#token-logo",
    // ) as HTMLImageElement;
    // if (type === "holding") {
    //   if (tokenLogoContainer) {
    //     tokenLogoContainer.style.display = "none";
    //   }
    // }
    // if (tokenLogo && typeof data.image === "string") {
    //   tokenLogo.src = data.image;
    // }

    // Update token name
    const tokenName = container.querySelector(".token-name");
    if (tokenName) {
      tokenName.textContent = data.symbol;
    }

    // Update profit/loss value and class
    const profitLossContainer = container.querySelector(".pnl") as HTMLElement;
    if (profitLossContainer) {
      profitLossContainer.className = "pnl";
      if (data.showUSD) {
        profitLossContainer.textContent = getIsStrippedHoldingPreviewData(
          data.invested,
          remaining,
        )
          ? "-"
          : data.profitD.toString();
      } else {
        profitLossContainer.innerHTML = `${
          getIsStrippedHoldingPreviewData(data.invested, remaining)
            ? "-"
            : data.profit
        }<img src="/template/assets/sol-white.svg" alt="sol icon" style="width: 30px; height:auto; margin-left:10px; margin-top: 10px">`;
      }
    }

    // Update summary values
    const updateSummaryValue = (
      label: string,
      value: string | number,
      showUSD: boolean,
    ) => {
      Array.from(container.querySelectorAll(".summary-item")).forEach(
        (item) => {
          const labelEl = item.querySelector(".summary-label");
          if (labelEl && labelEl.textContent === label) {
            const valueElement = item.querySelector(
              ".summary-value-profit, .summary-value-loss, .summary-value",
            ) as HTMLElement;
            const whiteValue = item.querySelector(
              ".summary-value",
            ) as HTMLElement;
            if (valueElement) {
              valueElement.className = data.isProfit
                ? "summary-value-profit"
                : "summary-value-loss";
              if (whiteValue) {
                whiteValue.className = "summary-value";
              }
              if (showUSD) {
                valueElement.textContent = value.toString();
              } else {
                valueElement.innerHTML = `${value}<img src="${data.isProfit ? "/template/assets/sol-green.svg" : "/template/assets/sol-red.svg"}" alt="sol icon" style="width: 15px; height:auto; margin-left:5px;">`;
                if (whiteValue) {
                  whiteValue.innerHTML = `${value}<img src="/template/assets/sol-white.svg" alt="sol icon" style="width: 15px; height:auto; margin-left:5px;">`;
                }
              }
            }
          }
        },
      );
    };
    // Update all summary values
    updateSummaryValue(
      "BOUGHT",
      getIsStrippedHoldingPreviewData(data.invested, remaining)
        ? "-"
        : data.showUSD
          ? data.investedD
          : data.invested,
      data.showUSD,
    );
    updateSummaryValue(
      "SOLD",
      getIsStrippedHoldingPreviewData(
        Number(data.sold) + Number(data.invested),
        remaining,
      )
        ? "-"
        : data.showUSD
          ? data.soldD
          : data.sold,
      data.showUSD,
    );
    updateSummaryValue(
      "STILL HOLDING",
      data.showUSD ? data.holdingD : data.holding,
      data.showUSD,
    );
    updateSummaryValue(
      "R.O.I",
      getIsStrippedHoldingPreviewData(data.invested, remaining)
        ? "-"
        : data.roi,
      true,
    );

    // Update referral code
    const referralValue = container.querySelector(".referral-value");
    if (referralValue) {
      referralValue.textContent = data.referralCode;
    }

    // const qrContainer = document.getElementById("qr-container");

    // if (qrContainer) {
    //   // Create the <img> element
    //   const img = document.createElement("img");
    //   img.id = "logo";
    //   img.src = data.qrCodeBase64;
    //   img.className = "qr-code";
    //   img.alt = "logo";

    //   // Append the image to the container
    //   qrContainer.appendChild(img);
    // }

    // Update QR code
    // const qrCode = container.querySelector("#logo") as HTMLImageElement;
    // if (qrCode && data.qrCodeBase64) {
    //   qrCode.src = data.qrCodeBase64;
    //   qrCode.className = "qr-code";
    // }
  }, []);

  // Separate effect for updating DOM elements
  useEffect(() => {
    updateDOMElements(templateData);
  }, [
    templateData,
    updateDOMElements,
    // templateData.qrCodeBase64
  ]);

  // Replace the old rendered template useMemo with a simpler one
  const renderedTemplate = useMemo(
    () => (
      <div ref={templateContainerRef} className="relative z-[10] h-full w-full">
        <Image
          src={templateData.pnlBg || "/template/assets/pnl-trophy.png"}
          alt="PnL Template"
          fill
          priority
          quality={100}
          className="absolute left-0 top-0 z-[5] size-full object-contain"
        />
        <Image
          src={(
            templateData.pnlBg || "/template/assets/pnl-trophy.png"
          ).replace("png", "webp")}
          alt="PnL Template"
          fill
          priority
          quality={1}
          className="absolute left-0 top-0 z-[1] size-full object-contain"
        />
        <div className="body z-[10]">
          <main className="pnl-main font-outfit">
            <div className="main-container">
              <div className="token-container">
                {templateData.image && templateData.symbol !== "ALL HOLDINGS" && (
                  <div
                    className="token-logo relative"
                    id="token-logo-container"
                  >
                    <Image
                      // id="token-logo"
                      src={templateData.image as string}
                      className="token-logo-image"
                      alt="token-logo"
                      fill
                    />
                  </div>
                )}

                <span className="token-name">{templateData.symbol}</span>
              </div>

              <div className="pnl mt-[-3.5px]">
                {templateData.showUSD ? (
                  templateData.profitD
                ) : (
                  <div className="flex">
                    {templateData.profit}
                    <div className="relative ml-[10px] mt-[10px] flex h-auto w-[30px] items-center justify-center">
                      <Image
                        src="/template/assets/sol-white.svg"
                        alt="sol icon"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="summary">
                <div className="summary-item">
                  <span className="summary-label">BOUGHT</span>
                  <div
                    className={cn(
                      templateData.isProfit
                        ? "summary-value-profit"
                        : "summary-value-loss",
                      "mt-[-4.5px]",
                    )}
                  >
                    {templateData.showUSD ? (
                      templateData.investedD
                    ) : (
                      <div className="flex items-center">
                        {templateData.invested}
                        <div className="relative ml-[5px] h-auto w-[15px]">
                          <Image
                            src={
                              templateData.isProfit
                                ? "/template/assets/sol-green.svg"
                                : "/template/assets/sol-red.svg"
                            }
                            alt="sol icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="summary-item">
                  <span className="summary-label">SOLD</span>
                  <span
                    className={cn(
                      templateData.isProfit
                        ? "summary-value-profit"
                        : "summary-value-loss",
                      "mt-[-4.5px]",
                    )}
                  >
                    {templateData.showUSD ? (
                      templateData.soldD
                    ) : (
                      <div className="flex items-center">
                        {templateData.sold}
                        <div className="relative ml-[5px] h-auto w-[15px]">
                          <Image
                            src={
                              templateData.isProfit
                                ? "/template/assets/sol-green.svg"
                                : "/template/assets/sol-red.svg"
                            }
                            alt="sol icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">STILL HOLDING</span>
                  <span className="summary-value mt-[-4.5px]">
                    {templateData.showUSD ? (
                      templateData.holdingD
                    ) : (
                      <div className="relative flex w-[15px] items-center">
                        {templateData.holding}
                        <div className="relative ml-[5px] h-auto w-[15px]">
                          <Image
                            src="/template/assets/sol-white.svg"
                            alt="sol icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">R.O.I</span>
                  <span className="summary-value mt-[-4.5px]">
                    {templateData.roi}
                  </span>
                </div>
              </div>

              <div className="referral-container">
                <div className="referral">
                  <div className="referral-label">REFERRAL</div>
                  <div className="referral-value mt-[-2px]">
                    {templateData.referralCode}
                  </div>
                </div>
              </div>

              <div className="footer-container">
                <div className="nova-website">nova.trade</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    ),
    [],
  );

  const handleTweet = () => {
    // Get the profit/loss value for the tweet
    const pnlValue = showUSD
      ? getAmount(
          profitAndLossUsdRaw
            ? profitAndLossUsdRaw
            : Number(profitAndLoss || 0) * solPrice,
          formatAmountDollarPnL,
        )
      : getAmount(profitAndLoss, formatAmountWithoutLeadingZero);

    // Construct the tweet text
    const tweetText = `I just made ${pnlValue}${showUSD ? "USD" : "SOL"} on ${title} with Nova 💜\n\nThe fastest speeds and highest earning rewards.\n\nTrade with me - https://nova.trade/`;

    // URL encode the tweet text
    const encodedTweet = encodeURIComponent(tweetText);

    // Create the Twitter intent URL
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}`;

    // Open in a new window
    window.open(twitterIntentUrl, "_blank");
  };

  // ✨✨✨ SOLUTION ✨✨✨
  const htmlToCanvasRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleImageAction = useCallback(
    (action: "download" | "copy" | "both") => {
      if (!htmlToCanvasRef.current) return;
      setIsLoadingDownload(true);

      // Add Firefox detection
      const isFirefox =
        navigator.userAgent.toLowerCase().indexOf("firefox") > -1;

      toPng(htmlToCanvasRef.current, {
        cacheBust: true,
        quality: 1, // Ensuring high quality
        pixelRatio: 5, // Adjust pixel ratio for better quality
        fetchRequestInit: {
          mode: "no-cors",
        },
        skipFonts: isFirefox, // Skip font processing in Firefox
        canvasWidth: htmlToCanvasRef.current.offsetWidth,
        canvasHeight: htmlToCanvasRef.current.offsetHeight,
      })
        .then(async (dataUrl) => {
          try {
            // ✅ **Download Image**
            if (action === "download" || action === "both") {
              const link = document.createElement("a");
              link.download = "pnl-image.png";
              link.href = dataUrl;
              link.click();
              toast.custom((t: any) => (
                <CustomToast
                  tVisibleState={t.visible}
                  message="Image downloaded!"
                  state="SUCCESS"
                />
              ));
            }

            // ✅ **Copy Image to Clipboard**
            if (action === "copy" || action === "both") {
              const response = await fetch(dataUrl);
              const blob = await response.blob();
              const item = new ClipboardItem({ "image/png": blob });
              await navigator.clipboard.write([item]);
              toast.custom((t: any) => (
                <CustomToast
                  tVisibleState={t.visible}
                  message="Image copied to clipboard!"
                  state="SUCCESS"
                />
              ));
              /* console.log("✅ Image copied to clipboard!") */;
            }
          } catch (err) {
            console.warn("❌ Operation error:", err);

            // Fallback for clipboard if that was the issue
            if (action === "copy" || action === "both") {
              try {
                const imgElement = document.createElement("img");
                imgElement.src = dataUrl;
                document.body.appendChild(imgElement);
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNode(imgElement);
                selection?.removeAllRanges();
                selection?.addRange(range);
                const success = document.execCommand("copy");
                document.body.removeChild(imgElement);
                if (success) {
                  /* console.log("✅ Image copied to clipboard using fallback!") */;
                } else {
                  console.warn("❌ Clipboard fallback failed");
                }
              } catch (fallbackErr) {
                console.warn("❌ Fallback error:", fallbackErr);
              }
            }
          }
        })
        .catch((err) => {
          console.warn("❌ Error:", err);
          // More detailed error logging
          if (err && err.message) {
            console.warn("Error details:", err.message);
          }
        })
        .finally(() => {
          setIsLoadingDownload(false);
        });
    },
    [],
  );

  // Add these constants for template dimensions
  const TEMPLATE_WIDTH = 544;
  const TEMPLATE_HEIGHT = 363;

  // Add state for scale
  const [scale, setScale] = useState(1);

  // Add resize observer
  useEffect(() => {
    if (!htmlToCanvasRef.current) return;

    const updateScale = () => {
      const container = htmlToCanvasRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculate scales based on both dimensions
      const scaleX = containerWidth / TEMPLATE_WIDTH;
      const scaleY = containerHeight / TEMPLATE_HEIGHT;

      // Use the smaller scale to ensure template fits
      const newScale = Math.min(scaleX, scaleY);

      setScale(newScale);
    };

    // Create resize observer
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(htmlToCanvasRef.current);

    // Initial scale calculation
    updateScale();

    return () => {
      resizeObserver.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div className="flex h-[64px] w-full items-center justify-between gap-x-5 border-b border-border px-4 py-[19px]">
        <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
          P&L Image
        </h4>

        {wallets && setWallets && (
          <WalletSelectionButton
            value={wallets}
            setValue={setWallets}
            isMultipleSelect={true}
            maxWalletShow={10}
            isGlobal={false}
            className="h-10"
          />
        )}

        {closeElement}
      </div>

      {/* <div className="flex w-full flex-grow bg-amber-300"></div> */}

      <div className="flex w-full flex-grow flex-col gap-y-3 p-4">
        {/* ############ TEMPLATE HERE ############ */}
        <>
          <ContextMenu>
            <ContextMenuTrigger>
              <>
                {scrollable ? (
                  width! >= 768 ? (
                    <OverlayScrollbarsComponent
                      defer
                      element="div"
                      className="relative h-fit w-full flex-grow overflow-y-scroll"
                    >
                      <div
                        ref={htmlToCanvasRef}
                        className="relative w-full overflow-hidden rounded-[8px] border border-border"
                        style={{
                          aspectRatio: `${TEMPLATE_WIDTH}/${TEMPLATE_HEIGHT}`,
                          maxWidth: "816px",
                          maxHeight: "545px",
                          margin: "0 auto",
                        }}
                      >
                        <div
                          className="absolute left-0 top-0 origin-top-left"
                          style={{
                            width: TEMPLATE_WIDTH,
                            height: TEMPLATE_HEIGHT,
                            transform: `scale(${scale})`,
                            transformOrigin: "top left",
                          }}
                        >
                          {renderedTemplate}
                        </div>
                      </div>
                    </OverlayScrollbarsComponent>
                  ) : (
                    <OverlayScrollbarsComponent
                      defer
                      element="div"
                      className="relative flex w-full flex-grow"
                      style={{
                        height: TEMPLATE_HEIGHT * scale + 5,
                      }}
                    >
                      <div className="absolute left-0 top-0 h-full w-full">
                        <div
                          ref={htmlToCanvasRef}
                          className="relative h-fit w-full overflow-hidden rounded-[8px] border border-border"
                          style={{
                            aspectRatio: `${TEMPLATE_WIDTH}/${TEMPLATE_HEIGHT}`,
                            maxWidth: "816px",
                            maxHeight: "545px",
                            margin: "0 auto",
                          }}
                        >
                          <div
                            className="absolute left-0 top-0 origin-top-left"
                            style={{
                              width: TEMPLATE_WIDTH,
                              height: TEMPLATE_HEIGHT,
                              transform: `scale(${scale})`,
                              transformOrigin: "top left",
                            }}
                          >
                            {renderedTemplate}
                          </div>
                        </div>
                      </div>
                    </OverlayScrollbarsComponent>
                  )
                ) : (
                  <div
                    ref={htmlToCanvasRef}
                    className="relative w-full overflow-hidden rounded-[8px] border border-border"
                    style={{
                      aspectRatio: `${TEMPLATE_WIDTH}/${TEMPLATE_HEIGHT}`,
                      maxWidth: "816px",
                      maxHeight: "545px",
                      margin: "0 auto",
                    }}
                  >
                    <div
                      className="absolute left-0 top-0 origin-top-left"
                      style={{
                        width: TEMPLATE_WIDTH,
                        height: TEMPLATE_HEIGHT,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                      }}
                    >
                      {renderedTemplate}
                    </div>
                  </div>
                )}
              </>
            </ContextMenuTrigger>
            <ContextMenuContent className="gb__white__popover z-[1000] w-56 border border-border bg-background">
              <div
                onClick={() => {
                  if (!isLoadingDownload) {
                    handleImageAction("copy");
                  }
                }}
                className="inset flex cursor-pointer items-center justify-center bg-shadeTable py-1.5 text-center text-fontColorPrimary transition-colors duration-300 hover:bg-shadeTableHover hover:text-fontColorPrimary"
              >
                <Copy
                  className="mr-2 h-4 w-4 text-fontColorPrimary"
                  size={16}
                />
                {isLoadingDownload ? "Copying..." : "Copy Image"}
              </div>
            </ContextMenuContent>
          </ContextMenu>
        </>
        {/* ############ TEMPLATE HERE END ############ */}

        <div className="grid w-full grid-cols-1 items-center justify-between gap-x-3 gap-y-2 md:grid-cols-3">
          <BaseButton
            // onClick={handleDownload}
            disabled={isLoadingDownload}
            isLoading={isLoadingDownload}
            onClick={() => handleImageAction("download")}
            variant="gray"
            className="h-fit md:h-[30px] lg:h-[40px]"
            prefixIcon={
              <div className="relative aspect-square size-4 lg:size-5">
                <Image
                  src="/icons/download.png"
                  alt="Download Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            }
          >
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              Download
            </span>
          </BaseButton>
          <BaseButton
            variant="gray"
            prefixIcon={
              <div className="relative aspect-square size-4 lg:size-5">
                <Image
                  src="/icons/arrows-exchange.svg"
                  alt="Exchange Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            }
            className="h-fit bg-primary/[8%] text-sm text-primary hover:bg-primary/[24%] focus:bg-primary/[24%] md:h-[30px] lg:h-[40px]"
            onClick={() => setShowUSD(!showUSD)}
          >
            Change to {showUSD ? "SOL" : "USD"}
          </BaseButton>
          <BaseButton
            onClick={handleTweet}
            variant="primary"
            className="h-fit md:h-[30px] lg:h-[40px]"
            prefixIcon={
              <div className="relative aspect-square size-4 lg:size-5">
                <Image
                  src="/icons/social/twitter.png"
                  alt="Twitter Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
            }
          >
            <span className="inline-block text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
              Tweet
            </span>
          </BaseButton>
        </div>
      </div>
    </>
  );
};

export default React.memo(PnLContent);
