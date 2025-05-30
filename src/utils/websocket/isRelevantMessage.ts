import {
  PingMessageType,
  SuccessMessageType,
  WSMessage,
} from "@/types/ws-general"

export function isRelevantMessage(channel: string, event: WSMessage<any>): boolean {
  // IGNORE PING MESSAGES
  const pingMessage = event as PingMessageType
  if (pingMessage.channel === "ping" && pingMessage.success) return false

  // IGNORE SUCCESS MESSAGES FOR THE CHANNEL
  const successMessage = event as SuccessMessageType
  if (successMessage.success && successMessage.channel === channel) return false

  // IGNORE MESSAGES NOT MEANT FOR THE CHANNEL
  if (event.channel !== channel) return false

  return true
}
