export type WebhookRecord = Record<string, unknown>;
export type BusinessEvent = {
  type: "INSERT" | "UPDATE";
  schema: "public";
  table: "profiles" | "quotes";
  record: WebhookRecord;
  old_record?: WebhookRecord;
};

function isRecord(value: unknown): value is WebhookRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseBusinessEvent(value: unknown): BusinessEvent | null {
  if (!isRecord(value) || value.schema !== "public" || !isRecord(value.record)) return null;
  if (value.table === "profiles" && value.type === "INSERT") return value as BusinessEvent;
  if (value.table !== "quotes" || value.record.submission_complete !== true) return null;
  if (value.type === "INSERT") return value as BusinessEvent;
  if (value.type === "UPDATE" && isRecord(value.old_record) &&
      value.old_record.submission_complete === false &&
      value.old_record.id === value.record.id) return value as BusinessEvent;
  return null;
}

export function matchesWebhookSecret(provided: string, expected: string) {
  if (!/^[a-f0-9]{64}$/.test(provided) || !/^[a-f0-9]{64}$/.test(expected)) return false;
  let difference = 0;
  for (let index = 0; index < 64; index++) {
    difference |= provided.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

