import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBusinessEvent, matchesWebhookSecret } from "../functions/notify-business-event/payload.ts";

test("accepts completed inserts and the first completion of an attached quote", () => {
  const insert = { type: "INSERT", schema: "public", table: "quotes", record: { id: 42, submission_complete: true } };
  assert.ok(parseBusinessEvent(insert));
  assert.ok(parseBusinessEvent({ ...insert, type: "UPDATE", old_record: { id: 42, submission_complete: false } }));
  assert.ok(parseBusinessEvent({ type: "INSERT", schema: "public", table: "profiles", record: { id: "customer" } }));
});

test("rejects incomplete quotes, repeated completions and unrelated updates", () => {
  const event = { type: "UPDATE", schema: "public", table: "quotes", record: { id: 42, submission_complete: true } };
  for (const invalid of [
    { ...event, old_record: { id: 42, submission_complete: true } },
    { ...event, old_record: { id: 43, submission_complete: false } },
    { ...event, type: "INSERT", record: { id: 42, submission_complete: false } },
    { ...event, table: "profiles" }, null, [], {},
  ]) assert.equal(parseBusinessEvent(invalid), null);
});

test("only accepts the exact database webhook secret", () => {
  const secret = "a".repeat(64);
  assert.equal(matchesWebhookSecret(secret, secret), true);
  assert.equal(matchesWebhookSecret("b".repeat(64), secret), false);
  assert.equal(matchesWebhookSecret("", secret), false);
  assert.equal(matchesWebhookSecret("Bearer " + secret, secret), false);
  assert.equal(matchesWebhookSecret(secret + "a", secret), false);
});
