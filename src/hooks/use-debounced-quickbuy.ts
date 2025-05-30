"use client";

import { useMemo, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import { useQueryClient } from "@tanstack/react-query";
import {
  QuickBuyAmountRequest,
  updateQuickBuyAmount,
} from "@/apis/rest/settings/settings";

export const useDebouncedQuickBuy = () => {
  const queryClient = useQueryClient();
  const isFirstCall = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdate = useMemo(
    () =>
      debounce(
        async (request: QuickBuyAmountRequest) => {
          if (isFirstCall.current) {
            isFirstCall.current = false;
            return;
          }
          try {
            if (request.amount < 0.00001) return;
            await updateQuickBuyAmount(request);
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ["settings"] });
            }, 1000);
          } catch (error) {
            console.warn("Failed to update quick buy amount:", error);
          }
        },
        200,
        { leading: false, trailing: true },
      ),
    [queryClient],
  );

  useEffect(() => {
    isFirstCall.current = true;
  }, [queryClient]);

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedUpdate]);

  return { debouncedUpdateQuickBuyAmount: debouncedUpdate };
};
