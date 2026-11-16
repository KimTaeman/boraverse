export const MAX_LETTER_LENGTH = 1200;
export const MAX_MESSAGE_LENGTH = 500;
export const isUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export type Audience = "bangtan" | "army";
type Identity = { visitorToken: string; requestId: string };
export type MagicWrite = Identity & (
  { action: "submit"; kind: Audience; title: string; text: string; consent: true } |
  { action: "react"; messageId: string; active: boolean } |
  { action: "remove"; messageId: string } |
  { action: "report"; messageId: string; reason: "harmful" | "private_information" | "other" }
);
export type MagicInput = MagicWrite | { action: "draw"; visitorToken: string; previousId?: string };
export type PublicMessage = { id: string; title: string; text: string; reactions: number };
export type MagicReply =
  { status: "submitted"; submissionId: string; kind: Audience; reviewStatus: "pending" | "published" | "rejected" | "withdrawn" } |
  { status: "reacted"; messageId: string; active: boolean; reactions: number } |
  { status: "withdrawn" | "reported"; messageId: string } |
  { status: "drawn"; message: PublicMessage | null };
export function safePublicText(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max &&
    !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value) && !/<\/?[a-z][^>]*>|https?:\/\/|www\.|mailto:|\b[^\s@]+@[^\s@]+\.[^\s@]+|(?:\+?\d[\s().-]*){9,}/i.test(value);
}
export function validateMagic(value: unknown): MagicInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = { ...value } as Record<string, unknown>;
  if (!isUuid(item.visitorToken)) return null;
  const keys = ["action", "visitorToken"];
  if (item.action === "draw") {
    keys.push("previousId");
    if (item.previousId !== undefined && !isUuid(item.previousId)) return null;
  } else {
    keys.push("requestId");
    if (!isUuid(item.requestId)) return null;
    if (item.action === "submit") {
      keys.push("kind", "title", "text", "consent");
      if (!["bangtan", "army"].includes(String(item.kind)) || item.consent !== true || !safePublicText(item.title, 80) || !safePublicText(item.text, item.kind === "army" ? MAX_MESSAGE_LENGTH : MAX_LETTER_LENGTH)) return null;
    } else if (["react", "remove", "report"].includes(String(item.action))) {
      keys.push("messageId");
      if (!isUuid(item.messageId)) return null;
      if (item.action === "react") { keys.push("active"); if (typeof item.active !== "boolean") return null; }
      if (item.action === "report") { keys.push("reason"); if (!["harmful", "private_information", "other"].includes(String(item.reason))) return null; }
    } else return null;
  }
  if (Object.keys(item).some(key => !keys.includes(key))) return null;
  for (const key of ["visitorToken", "requestId", "messageId", "previousId"]) if (typeof item[key] === "string") item[key] = item[key].toLowerCase();
  return item as MagicInput;
}
export function publicMessage(value: unknown): value is PublicMessage {
  if (!value || typeof value !== "object") return false;
  const item = value as PublicMessage;
  return isUuid(item.id) && typeof item.title === "string" && item.title.length <= 80 && typeof item.text === "string" && item.text.length <= MAX_LETTER_LENGTH && Number.isSafeInteger(item.reactions) && item.reactions >= 0;
}
export function validReply(value: unknown, input: MagicInput): value is MagicReply {
  if (!value || typeof value !== "object") return false;
  const reply = value as MagicReply;
  if (input.action === "submit") return reply.status === "submitted" && reply.kind === input.kind && isUuid(reply.submissionId) && ["pending", "published", "rejected", "withdrawn"].includes(reply.reviewStatus);
  if (input.action === "react") return reply.status === "reacted" && reply.messageId === input.messageId && typeof reply.active === "boolean" && Number.isSafeInteger(reply.reactions) && reply.reactions >= 0;
  if (input.action === "draw") return reply.status === "drawn" && (reply.message === null || publicMessage(reply.message));
  return reply.status === (input.action === "remove" ? "withdrawn" : "reported") && "messageId" in reply && reply.messageId === input.messageId;
}
