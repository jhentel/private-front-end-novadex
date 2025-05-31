"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import BaseButton from "./buttons/BaseButton";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/libraries/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import Link from "next/link";
import { CachedImage } from "./CachedImage";
import { useWindowSize } from "@/hooks/use-window-size";
// import { useWindowSizeStore } from "@/stores/use-window-size.store";

const NOTIFICATIONS_CONTENT_CONTAINER_BASE_CLASS =
  "border-2 gb__white__popover border-border bg-card p-0 shadow-[0_0_20px_0_#000000] max-w-[95vw] sm:w-[376px] z-[1000]";

export type NotificationType =
  | "cashback" // For SOL cash back
  | "feature" // For new feature announcements
  | "maintenance" // For maintenance notifications
  | "social" // For social media posts
  | "video" // For YouTube videos
  | "guide"; // For guides and docs

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  actionText?: string; // For colored text like "learn more"
  icon?: string; // Path to the icon to display
}

const thirtyFiveMinutesAgo = new Date(Date.now() - 35 * 60 * 1000);

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "cashback",
    title: "0.020 SOL - Nova Cash Back!",
    description: "Congratulations! Trade more to earn more!",
    timestamp: thirtyFiveMinutesAgo,
    read: false,
  },
  {
    id: "2",
    type: "feature",
    title: "Limit Orders have been added!",
    description: "Click here to",
    timestamp: thirtyFiveMinutesAgo,
    read: false,
    actionText: "learn more.",
    link: "/features/limit-orders",
  },
  {
    id: "3",
    type: "maintenance",
    title: "We Will be down for 5 minutes of maintenance!",
    description: "At 5:00pm EST today.",
    timestamp: thirtyFiveMinutesAgo,
    read: false,
  },
  {
    id: "4",
    type: "social",
    title: "New X post!",
    description: "Support our new post.",
    timestamp: thirtyFiveMinutesAgo,
    read: false,
  },
  {
    id: "5",
    type: "video",
    title: "New YouTube Video!",
    description: "Check out our new YouTube video on Nova Channel.",
    timestamp: thirtyFiveMinutesAgo,
    read: false,
  },
  {
    id: "6",
    type: "guide",
    title: "New post on guide!",
    description: "Check out our new guide on how to use",
    timestamp: thirtyFiveMinutesAgo,
    read: false,
    actionText: "Limit Orders!",
    link: "/guides/limit-orders",
  },
  {
    id: "7",
    type: "maintenance",
    title: "We Will be down for 5 minutes of maintenance!",
    description: "At 5:00pm EST today.",
    timestamp: thirtyFiveMinutesAgo,
    read: false,
  },
  {
    id: "8",
    type: "video",
    title: "New YouTube Video!",
    description: "Check out our new YouTube video on Nova Channel.",
    timestamp: thirtyFiveMinutesAgo,
    read: false,
  },
  {
    id: "9",
    type: "social",
    title: "New X post!",
    description: "Support our new post.",
    timestamp: thirtyFiveMinutesAgo,
    read: false,
  },
  {
    id: "10",
    type: "social",
    title: "New X post!",
    description: "Support our new post.",
    timestamp: thirtyFiveMinutesAgo,
    read: false,
  },
  {
    id: "11",
    type: "cashback",
    title: "0.020 SOL - Nova Cash Back!",
    description: "Congratulations! Trade more to earn more!",
    timestamp: thirtyFiveMinutesAgo,
    read: false,
  },
];

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} months ago`;
};

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
}) => {
  const handleClick = () => {
    if (onRead && !notification.read) {
      onRead(notification.id);
    }
  };

  // Helper function to render the title with inline icon for cashback notifications
  const renderTitle = () => {
    if (notification.type === "cashback") {
      // For cashback notifications, look for "SOL" in the title and insert the icon there
      const titleParts = notification.title.split("SOL");
      if (titleParts.length > 1) {
        return (
          <div className="flex flex-wrap items-center">
            <div className="relative mr-0.5 inline-flex size-4 items-center justify-center">
              <CachedImage
                src="/icons/solana-sq.svg"
                alt="Solana SQ Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>
            <span className="text-sm font-medium text-white">
              {notification.title}
            </span>
          </div>
        );
      }
    }

    return (
      <p className="text-sm font-medium text-white">{notification.title}</p>
    );
  };

  // Helper function to render description with actionText highlighted in purple
  const renderDescription = () => {
    if (!notification.actionText) {
      return <span className="text-[#9698A3]">{notification.description}</span>;
    }

    // If the description ends with the actionText
    if (notification.description.endsWith(notification.actionText)) {
      const mainText = notification.description.slice(
        0,
        notification.description.length - notification.actionText.length,
      );
      return (
        <>
          <span className="text-[#9698A3]">{mainText}</span>
          <span className="text-purple-500">{notification.actionText}</span>
        </>
      );
    }

    // If the description is separate from the actionText
    return (
      <>
        <span className="text-[#9698A3]">{notification.description} </span>
        <span className="text-purple-500">{notification.actionText}</span>
      </>
    );
  };

  // Get the appropriate icon based on notification type
  const getNotificationIcon = () => {
    // For cashback, we use a special icon
    if (notification.type === "cashback") {
      return "/icons/confetti.svg";
    }

    if (notification.icon) {
      return notification.icon;
    }

    // Fallback icons if not provided directly
    switch (notification.type) {
      case "feature":
        return "/icons/info-tooltip.png";
      case "maintenance":
        return "/icons/warning-triangle.svg";
      case "social":
        return "/icons/x.svg";
      case "video":
        return "/icons/youtube.svg";
      case "guide":
        return "/icons/document.svg";
      default:
        return "/icons/bell.svg";
    }
  };

  // For notifications that are in the "Limit Orders!" format in the guide section
  const renderPurpleText = () => {
    if (notification.type === "guide" && notification.actionText) {
      return <span className="text-purple-500">{notification.actionText}</span>;
    }
    return null;
  };

  const content = (
    <div
      className={cn(
        "relative flex w-full cursor-pointer flex-col rounded-[6px] border-b border-[#1F212A] p-2 hover:bg-[#1F212A]/50",
        !notification.read ? "bg-[#E077FF14]/[8%]" : "bg-white/[4%]",
      )}
      onClick={handleClick}
    >
      {/* Top row with icon and title */}
      <div className="flex items-start gap-x-1">
        {/* Icon */}
        <div className="flex h-5 w-5 items-center justify-center">
          <Image
            src={getNotificationIcon()}
            alt={notification.type}
            width={20}
            height={20}
            className="object-contain"
          />
        </div>

        {/* Title and content */}
        <div className="flex-1">
          {renderTitle()}
          <p className="mt-1 text-xs">
            {renderDescription()}
            {renderPurpleText()}
          </p>
          <p className="mt-2 text-xs text-[#5B5D6B]">
            {formatTimeAgo(notification.timestamp)}
          </p>
        </div>

        {/* Purple indicator dot - now based on unread status */}
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
        )}
      </div>
    </div>
  );

  // If notification has a link, wrap with Link component
  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

const Notifications = () => {
  // const width = useWindowSizeStore((state) => state.width);
  const { width } = useWindowSize();
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  // Calculate unread count
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  // Mark a notification as read when clicking on it
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  };

  // The notification list component
  const notificationList = (
    <div className="nova-scroller flex max-h-[calc(100dvh_-_160px)] w-full flex-col gap-y-1 overflow-y-auto p-2">
      {notifications.length === 0 ? (
        <div className="flex h-32 w-full items-center justify-center">
          <p className="text-sm text-gray-400">No notifications</p>
        </div>
      ) : (
        notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={handleMarkAsRead}
          />
        ))
      )}
    </div>
  );

  if (!width) return null;

  // /** Desktop View */
  if (width > 1280)
    return (
      <Popover>
        <PopoverTrigger asChild>
          <BaseButton variant="gray" className="relative size-8" size="short">
            <div className="relative aspect-square h-4 w-4 flex-shrink-0">
              <Image
                src="/icons/bell.svg"
                alt="Notification Icon"
                fill
                quality={50}
                className="object-contain"
              />
            </div>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </BaseButton>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={6}
          className={cn(NOTIFICATIONS_CONTENT_CONTAINER_BASE_CLASS)}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex w-full items-center justify-between border-b border-border p-4">
            <h4 className="text-nowrap font-geistMedium text-sm text-white md:text-[18px]">
              Notifications
            </h4>
            <div className="flex items-center gap-x-4">
              {/* Clear All button */}
              {unreadCount > 0 && (
                <button
                  className="text-sm text-gray-400 transition-colors hover:text-gray-300"
                  onClick={handleMarkAllAsRead}
                >
                  Clear All
                </button>
              )}
              <PopoverClose className="cursor-pointer text-foreground">
                <X size="24" />
              </PopoverClose>
            </div>
          </div>
          {notificationList}
        </PopoverContent>
      </Popover>
    );

  return (
    <Drawer onOpenChange={setIsOpen} open={isOpen}>
      <DrawerTrigger asChild>
        <button
          title="Notification Drawer Trigger"
          className="relative flex w-full min-w-[86px] flex-col items-center justify-center text-xs"
        >
          <Image
            src={
              isOpen
                ? "/icons/footer/bottom-nav/notification-active.svg"
                : "/icons/footer/bottom-nav/notification.svg"
            }
            alt={`Notification Icon`}
            width={20}
            height={20}
            className={cn("mb-1")}
            priority
          />
          <span
            className={cn(
              "text-xs text-fontColorSecondary group-hover:text-fontColorPrimary",
              isOpen
                ? "font-geistSemiBold text-fontColorAction"
                : "font-geistRegular text-fontColorSecondary",
            )}
          >
            Notification
          </span>
          {unreadCount > 0 && (
            <div className="absolute -top-1 right-[32%] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </button>
      </DrawerTrigger>
      <DrawerContent
        overlayClassName="z-[150] bottom-[58.25px]"
        className="bottom-[58.25px] z-[150] flex max-h-[85dvh] w-full flex-col gap-y-0 bg-card after:hidden xl:hidden xl:max-w-[480px]"
      >
        <DrawerHeader className="flex flex-row items-center justify-between border-b border-border p-4">
          <DrawerTitle className="text-white">Notifications</DrawerTitle>
          <div className="flex items-center gap-x-4">
            {/* Clear All button */}
            {unreadCount > 0 && (
              <button
                className="text-sm text-gray-400 transition-colors hover:text-gray-300"
                onClick={handleMarkAllAsRead}
              >
                Clear All
              </button>
            )}
            <DrawerClose asChild>
              <button className="relative aspect-square h-6 w-6 flex-shrink-0">
                <Image
                  src="/icons/close.png"
                  alt="Close Icon"
                  fill
                  quality={50}
                  unoptimized
                  className="object-contain"
                />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="overflow-y-auto">{notificationList}</div>
      </DrawerContent>
    </Drawer>
  );
};

export default Notifications;
