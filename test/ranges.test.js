import assert from 'node:assert/strict';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { createCsvRanges } from '../src/ranges.js';

test('splits a CSV into non-overlapping ranges at record boundaries', async () => {
  const file = path.join(tmpdir(), `process-report-${process.pid}.csv`);
  const source = 'id,Name\n1,Alpha\n2,Beta\n3,Gamma\n4,Delta\n';
  await writeFile(file, source);

  try {
    const content = await readFile(file);
    const { header, ranges } = await createCsvRanges(file, 3);
    const chunks = ranges.map(({ start, endExclusive }) =>
      content.subarray(start, endExclusive).toString()
    );

    assert.equal(header, 'id,Name');
    assert.equal(chunks.join(''), source.slice(source.indexOf('\n') + 1));
    assert.ok(chunks.every(chunk => !chunk.startsWith('\n')));
  } finally {
    await rm(file, { force: true });
  }
});
