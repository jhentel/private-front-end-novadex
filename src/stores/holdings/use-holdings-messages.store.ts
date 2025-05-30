import { create } from "zustand";
import { HoldingsConvertedMessageType } from "@/types/ws-general";

export type BatchPriceMessage = {
  priceSol: number;
  priceUsd: number;
  mint: string;
};

type HoldingsMessageState = {
  messages: HoldingsConvertedMessageType[];
  WSHoldingRef: WebSocket | null;
  WSChartHoldingRef: WebSocket | null;
  listSubscribedMints: string[];
  setListSubscribedMints: (mints: string[]) => void;
  setMessages: (newMessages: HoldingsConvertedMessageType[]) => void;
  setMessagesWhenNotExists: (
    newMessages: HoldingsConvertedMessageType[],
  ) => void;
  updateMessage: (
    newMessage: HoldingsConvertedMessageType | HoldingsConvertedMessageType[],
  ) => void;
  setWSHoldingRef: (ws: WebSocket | null) => void;
  // setWSChartHoldingRef: (ws: WebSocket | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  timestamp: number;
  setTimestamp: (timestamp: number) => void;
  chartPriceMessage: BatchPriceMessage[];
  setChartPriceMessage: (newMessage: BatchPriceMessage[]) => void;
  marqueeMint: string[];
  setMarqueeMint: (mint: string | string[]) => void;
};

export const useHoldingsMessageStore = create<HoldingsMessageState>()(
  (set, get) => ({
    messages: [],
    WSHoldingRef: null,
    WSChartHoldingRef: null,
    marqueeMint: [],
    setMarqueeMint: (mint) =>
      set(() => {
        if (Array.isArray(mint)) {
          return { marqueeMint: mint };
        }
        return { marqueeMint: [mint as string] };
      }),
    listSubscribedMints: [],
    setListSubscribedMints: (mints) =>
      set(() => ({ listSubscribedMints: mints })),
    setMessages: (newMessages) =>
      set(() => {
        // console.log("HOLDING SET 🌱🌱🌱 - Set Messages", newMessages);
        return { messages: newMessages };
      }),
    setMessagesWhenNotExists: (newMessages) =>
      set((state) => {
        const updatedMessages = state.messages.map((currMsg) => {
          const newTokens =
            newMessages
              .find((newMsg) => newMsg.wallet === currMsg.wallet)
              ?.tokens?.filter(
                (newToken) =>
                  !currMsg.tokens.some(
                    (currToken) => currToken.token.mint === newToken.token.mint,
                  ),
              ) || [];
          return {
            wallet: currMsg.wallet,
            tokens: [...currMsg.tokens, ...newTokens],
          };
        });

        return {
          messages: updatedMessages,
        };
        // // Find wallet that has a new token
        // const updatedWallet =
        //   state.messages.find((existingMsg) =>
        //     newMessages.some(
        //       (newMsg) =>
        //         existingMsg.wallet === newMsg.wallet &&
        //         existingMsg.tokens.length === newMsg?.tokens.length,
        //     ),
        //   )?.wallet || "";

        // // if wallet updated doesn't exist, return the current state
        // if (updatedWallet.length === 0) return { messages: state.messages };

        // const prevMints = state.messages
        //   .map((m) => m.tokens.map((t: any) => t.token.mint))
        //   .flat();
        // const newMints = newMessages
        //   .map((m) => m.tokens.map((t: any) => t.token.mint))
        //   .flat();
        // const mintsToAdd = newMints.filter((m) => !prevMints.includes(m));
        // const tokensToAdd =
        //   newMessages
        //     .find((m) => m.wallet === updatedWallet)
        //     ?.tokens.filter((t: any) => mintsToAdd.includes(t.token.mint)) || [];

        // return {
        //   messages: [
        //     ...state.messages.map((w) => {
        //       return {
        //         wallet: w.wallet,
        //         tokens:
        //           w.wallet === updatedWallet
        //             ? [...w.tokens, ...tokensToAdd]
        //             : w.tokens,
        //       };
        //     }),
        //   ],
        // };
        // const prevMints = state.messages
        //   .map((m) => m.tokens.map((t: any) => t.token.mint))
        //   .flat();
        // const newMints = newMessages
        //   .map((m) => m.tokens.map((t: any) => t.token.mint))
        //   .flat();
        // const mintsToAdd = newMints.filter((m) => !prevMints.includes(m));

        // return {
        //   messages: [
        //     ...state.messages,
        //     ...newMessages.map((w) => {
        //       return {
        //         wallet: w.wallet,
        //         tokens: w.tokens.filter((t: any) =>
        //           mintsToAdd.includes(t.token.mint),
        //         ),
        //       };
        //     }),
        //   ],
        // };
      }),
    updateMessage: (m) => {
      return set((state) => {
        // console.log("UPDATE MESSAGE💬💬💬 - New Message", m, Array.isArray(m));
        // const mess = m as HoldingsConvertedMessageType;

        // console.log(
        //   "HOLDING SET 🌱🌱🌱 - NOT ARRAY Update Message",
        //   state.messages.some((msg) => msg.wallet === mess.wallet),
        //   state.messages.map((msg) => msg.wallet),
        //   mess.wallet,
        //   state.messages.map((msg) => {
        //     if (msg.wallet === mess.wallet) {
        //       console.log("HOLDING SET 🌱🌱🌱 - BAL:AAAA", msg, m);
        //       msg.tokens.map((t: any) => {
        //         const newToken = mess.tokens?.find(
        //           (newToken) => newToken.token.mint === t.token.mint,
        //         );
        //         console.log("HOLDING SET 🌱🌱🌱 - BOLOOOO", newToken);
        //         return newToken;
        //       });
        //     }
        //   }),
        // );
        if (Array.isArray(m)) {
          // Create a Map for faster lookup of new messages by wallet

          return {
            ...state,
            messages: state.messages.map((msg) => {
              const newMsg = m.find((newMsg) => newMsg.wallet === msg.wallet);
              // console.log("HOLDING SET 🌱🌱🌱 - Update Message", newMsg);
              return newMsg
                ? {
                    wallet: msg.wallet,
                    tokens: msg.tokens.map((tokenOld) => {
                      const tokenNew = newMsg?.tokens?.find(
                        (token) => token.token.mint === tokenOld.token.mint,
                      );
                      return tokenNew ? tokenNew : tokenOld;
                    }),
                  }
                : msg;
            }),
          };
        }

        // Single message update
        return {
          ...state,
          messages: state.messages.some((msg) => msg.wallet === m.wallet)
            ? state.messages.map((msg) => {
                return msg.wallet === m.wallet
                  ? {
                      wallet: m.wallet,
                      tokens: msg?.tokens?.map((t: any) => {
                        const newToken = m?.tokens?.find(
                          (newToken) => newToken.token.mint === t.token.mint,
                        );
                        // console.log(
                        //   "HOLDING SET 🌱🌱🌱 - Update Message 2",
                        //   newToken,
                        // );
                        return newToken ? newToken : t;
                      }),
                    }
                  : msg;
              })
            : [...state.messages, m],
        };
      });
    },
    setWSHoldingRef: (ws) =>
      set(() => {
        if (ws === null) {
          set((state) => {
            if (state.WSHoldingRef) {
              state.WSHoldingRef.onclose = null;
              state.WSHoldingRef.onerror = null;
              state.WSHoldingRef.onmessage = null;
              state.WSHoldingRef.onopen = null;
              state.WSHoldingRef.close();
            }
            return {};
          });
        }
        return ws === null
          ? {
              WSHoldingRef: null,
            }
          : { WSHoldingRef: ws };
      }),
    // setWSChartHoldingRef: (ws) =>
    //   set(() => {
    //     if (ws === null) {
    //       set((state) => {
    //         if (state.WSChartHoldingRef) {
    //           state.WSChartHoldingRef.onclose = null;
    //           state.WSChartHoldingRef.onerror = null;
    //           state.WSChartHoldingRef.onmessage = null;
    //           state.WSChartHoldingRef.onopen = null;
    //           state.WSChartHoldingRef.close();
    //         }
    //         return {};
    //       });
    //     }
    //     return ws === null
    //       ? {
    //           WSChartHoldingRef: null,
    //         }
    //       : { WSChartHoldingRef: ws };
    //   }),
    isLoading: false,
    setIsLoading: (loading) => set(() => ({ isLoading: loading })),
    timestamp: 0,
    setTimestamp: (timestamp) => set(() => ({ timestamp: timestamp })),
    chartPriceMessage: [],
    setChartPriceMessage: (newMessage) => {
      const mintsToAdd = newMessage.map((m) => m.mint);
      const prevChartPriceMessage = get().chartPriceMessage;
      const newChartPriceMessage = [
        ...prevChartPriceMessage.filter((c) => !mintsToAdd.includes(c.mint)),
        ...newMessage,
      ];
      set(() => ({
        chartPriceMessage: newChartPriceMessage,
      }));
    },
  }),
);
