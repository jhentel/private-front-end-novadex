"use client";
import { getCosmoInitialFetch } from "@/apis/rest/cosmo";
import { cn } from "@/libraries/utils";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const NavLink = React.memo(
  ({
    link,
    prefetch = true,
    scroll = false,
  }: {
    link: {
      label: string;
      href: string;
    };
    prefetch?: boolean;
    scroll?: boolean;
  }) => {
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const prefetchCosmo = async () => {
      await queryClient.prefetchQuery({
        queryKey: ["cosmo-initial-fetch"],
        queryFn: getCosmoInitialFetch,
      });
    };
    const isActive = pathname === link?.href;

    return (
      <Link
        href={link?.href}
        prefetch={prefetch}
        scroll={scroll}
        onClick={link?.href === "/" ? () => prefetchCosmo() : undefined}
        className={cn(
          "flex h-8 items-center justify-center text-nowrap rounded-[8px] px-4 py-1.5 font-geistSemiBold text-sm text-fontColorPrimary transition-all duration-300 ease-in-out",
          isActive
            ? "bg-secondary text-[rgb(252,252,253)] hover:bg-[#262636]"
            : "bg-transparent text-fontColorSecondary hover:bg-secondary/10 hover:text-fontColorPrimary",
        )}
      >
        {link?.label}
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export default NavLink;
