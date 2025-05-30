"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAnnouncementStore } from "@/stores/use-announcement.store";
import { getAnnouncement } from "@/apis/rest/announcement";
import { cn } from "@/libraries/utils";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  InfoIcon,
} from "lucide-react";

interface Announcement {
  message: string;
  level: "warning" | "danger" | "success";
}

const Announcement: React.FC = () => {
  const {
    data: announcement,
    isLoading,
    error,
  } = useQuery<Announcement, Error, Announcement | null>({
    queryKey: ["announcement"],
    queryFn: getAnnouncement,
    refetchInterval: 60000, // Refetch every 60 seconds
    refetchIntervalInBackground: true,
    staleTime: 55000, // Consider data stale after 55 seconds
    select: (data) => {
      // Only return the announcement if it has a message
      return data && data.message ? data : null;
    },
    retry: 3, // Retry failed requests 3 times
  });

  const setIsAnnouncementExist = useAnnouncementStore(
    (state) => state.setIsAnnouncementExist,
  );
  useEffect(() => {
    if (announcement) {
      setIsAnnouncementExist(true);
    } else {
      setIsAnnouncementExist(false);
    }
  }, [announcement, setIsAnnouncementExist]);

  // Log errors but don't disrupt the UI
  useEffect(() => {
    if (error) {
      console.warn("Failed to fetch announcement:", error);
    }
  }, [error]);

  const getBgColor = (level: string) => {
    switch (level) {
      case "warning":
        return "bg-[#F0A664]/[0.11] border-amber-200";
      case "danger":
        return "bg-[#F56565]/[0.11] border-red-200";
      case "success":
        return "bg-[#48BB78]/[0.11] border-green-200";
      default:
        return "bg-blue-50/[0.11] border-blue-200";
    }
  };

  const getTextColor = (level: string) => {
    switch (level) {
      case "warning":
        return "text-[#F0A664]";
      case "danger":
        return "text-[#F56565]";
      case "success":
        return "text-[#48BB78]";
      default:
        return "text-blue-800";
    }
  };

  const getIcon = (level: string) => {
    const className = cn("w-4 h-4", getTextColor(level));

    switch (level) {
      case "warning":
        return <AlertTriangle className={className} />;
      case "danger":
        return <AlertCircle className={className} />;
      case "success":
        return <CheckCircle className={className} />;
      default:
        return <InfoIcon className={className} />;
    }
  };

  // Only hide the component during initial loading or when there's no announcement
  if (isLoading || !announcement) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex min-h-10 items-center justify-center px-4 py-2",
        getBgColor(announcement.level),
      )}
    >
      <div
        className={cn(
          "flex items-center gap-x-1 text-sm font-medium",
          getTextColor(announcement.level),
        )}
      >
        {getIcon(announcement.level)}
        {announcement.message}
      </div>
    </div>
  );
};

export default Announcement;
