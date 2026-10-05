import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { test } from 'node:test';

const execute = promisify(execFile);
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

async function run(workerCount) {
  const { stdout } = await execute(process.execPath, ['src/index.js'], {
    cwd: projectRoot,
    env: { ...process.env, WORKERS: String(workerCount) },
  });

  return stdout.trim().split('\n');
}

test('parallel ranges produce the same result as one process', async () => {
  const [single, parallel] = await Promise.all([run(1), run(4)]);
  const resultLines = lines => lines.filter(line => line.includes('appears'));

  assert.deepEqual(resultLines(parallel), resultLines(single));
  assert.match(single.at(-1), /^processed 1034 records in /);
  assert.match(parallel.at(-1), /^processed 1034 records in /);
});
