import assert from 'node:assert/strict';
import { test } from 'node:test';

import { partitionFor } from '../src/partition.js';

test('the same key is always routed to the same worker', () => {
  assert.equal(partitionFor('Charmeleon', 8), partitionFor('Charmeleon', 8));
});

test('the partition is within the available worker range', () => {
  for (const name of ['Pikachu', 'Charizard', 'Mew']) {
    const partition = partitionFor(name, 4);
    assert.ok(partition >= 0 && partition < 4);
  }
});
