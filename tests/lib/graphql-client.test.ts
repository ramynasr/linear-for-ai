import { assertEquals, assertExists } from 'jsr:@std/assert@^1.0.0';
import { GraphQLClient } from '../../src/lib/graphql-client.ts';

Deno.test('GraphQLClient - constructs with API key', () => {
  const client = new GraphQLClient('test_api_key');
  assertExists(client);
});

Deno.test('GraphQLClient - redacts API key in debug mode', () => {
  const client = new GraphQLClient('test_api_key_1234', { debug: true });
  const redacted = client.getRedactedKey();
  assertEquals(redacted, 'LINEAR_...1234');
});

Deno.test('GraphQLClient - constructs request headers', () => {
  const client = new GraphQLClient('test_key');
  const headers = client.getHeaders();
  assertEquals(headers.get('Authorization'), 'test_key');
  assertEquals(headers.get('Content-Type'), 'application/json');
});
