import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { parseFilter, getFieldsOrDefault } from "../../../src/lib/utils/command.ts";

Deno.test("parseFilter - parses valid JSON filter", () => {
  const filter = '{"state":{"type":{"eq":"started"}}}';
  const result = parseFilter(filter);
  assertEquals(result, { state: { type: { eq: "started" } } });
});

Deno.test("parseFilter - throws on invalid JSON", () => {
  const filter = "{invalid json}";
  assertThrows(
    () => parseFilter(filter),
    Error,
    "Invalid filter JSON",
  );
});

Deno.test("parseFilter - returns undefined when no filter", () => {
  const result = parseFilter(undefined);
  assertEquals(result, undefined);
});

Deno.test("getFieldsOrDefault - returns parsed fields from string", () => {
  const result = getFieldsOrDefault("id,title,state", ["id"]);
  assertEquals(result, ["id", "title", "state"]);
});

Deno.test("getFieldsOrDefault - returns default when no fields provided", () => {
  const result = getFieldsOrDefault(undefined, ["id", "url"]);
  assertEquals(result, ["id", "url"]);
});
