"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { getTwitterAPIKey } from "@/apis/rest/twitter-monitor";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import { useEffect } from "react";
// ######## Components 🧩 ########
// ######## Types 🗨️ ########
// ######## Utils & Helpers 🤝 ########
import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import WalletTradeContent from "./WalletTradeContent";

// ######## Constants ########
const COOKIE_NAME = "_nova_license_key";
const COOKIE_EXPIRY_DAYS = 1;

const WalletTradeClient = () => {
  useEffect(() => {
    const initializeLicenseKey = async () => {
      try {
        //
        const existingKey = Cookies.get(COOKIE_NAME);
        if (existingKey) {
          return;
        }

        const response = await getTwitterAPIKey();
        if (response.success && response.message) {
          Cookies.set(COOKIE_NAME, response.message, {
            expires: COOKIE_EXPIRY_DAYS,
          });
        }
      } catch (error) {
        console.error("Failed to initialize license key:", error);
      }
    };

    initializeLicenseKey();
  }, []);

  return (
    <NoScrollLayout>
      <WalletTradeContent />
    </NoScrollLayout>
  );
};

export default WalletTradeClient;
