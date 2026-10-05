import { fork } from 'node:child_process';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

import { createCsvRanges } from './ranges.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const database = path.resolve('database/All_Pokemon.csv');
const workerFile = path.join(directory, 'backgroundTask.js');
const defaultWorkerCount = Math.min(availableParallelism(), 8);
const requestedWorkerCount = Number(process.env.WORKERS ?? defaultWorkerCount);

if (!Number.isInteger(requestedWorkerCount) || requestedWorkerCount < 1) {
  throw new Error('WORKERS must be a positive integer');
}

const { header, ranges } = await createCsvRanges(
  database,
  requestedWorkerCount
);
const totals = new Map();
const startedAt = performance.now();

function merge(entries) {
  for (const [name, count] of entries) {
    totals.set(name, (totals.get(name) ?? 0) + count);
  }
}

function runWorker(range) {
  return new Promise((resolve, reject) => {
    const worker = fork(workerFile, [
      database,
      String(range.start),
      String(range.endExclusive),
      Buffer.from(header).toString('base64'),
    ]);
    let completed = false;

    worker.on('message', message => {
      if (message.type === 'counts') {
        merge(message.entries);
      }

      if (message.type === 'error') {
        reject(new Error(message.error));
      }

      if (message.type === 'done') {
        completed = true;
        resolve(message.records);
      }
    });

    worker.once('error', reject);
    worker.once('exit', code => {
      if (!completed && code !== 0) {
        reject(new Error(`Worker exited with code ${code}`));
      }
    });
  });
}

console.log(`reading ${ranges.length} file ranges in parallel`);

const recordsPerWorker = await Promise.all(ranges.map(runWorker));
const duplicates = [...totals]
  .filter(([, count]) => count > 1)
  .sort(([left], [right]) => left.localeCompare(right));

for (const [name, count] of duplicates) {
  console.log(`${name} appears ${count} times`);
}

const records = recordsPerWorker.reduce((total, count) => total + count, 0);
const duration = (performance.now() - startedAt).toFixed(2);
console.log(`processed ${records} records in ${duration}ms`);
