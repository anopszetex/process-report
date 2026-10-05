import csvtojson from 'csvtojson';
import { fork } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { partitionFor } from './partition.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const database = path.resolve('database/All_Pokemon.csv');
const workerFile = path.join(directory, 'backgroundTask.js');
const workerCount = Math.min(availableParallelism(), 8);

function send(worker, message) {
  return new Promise((resolve, reject) => {
    worker.send(message, error => (error ? reject(error) : resolve()));
  });
}

const workers = Array.from({ length: workerCount }, () => fork(workerFile));
const completion = workers.map(
  worker =>
    new Promise((resolve, reject) => {
      worker.on('message', message => {
        if (message.type === 'duplicate') {
          console.log(`${message.name} is duplicated`);
        }

        if (message.type === 'done') {
          resolve();
        }
      });
      worker.once('error', reject);
      worker.once('exit', code => {
        if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
      });
    })
);

console.log(`processing with ${workerCount} workers`);

await pipeline(
  createReadStream(database),
  csvtojson(),
  new Writable({
    objectMode: true,
    write(record, _encoding, callback) {
      const parsedRecord = Buffer.isBuffer(record)
        ? JSON.parse(record.toString())
        : record;
      const index = partitionFor(parsedRecord.Name, workerCount);
      send(workers[index], { type: 'record', name: parsedRecord.Name }).then(
        () => callback(),
        callback
      );
    },
  })
);

await Promise.all(workers.map(worker => send(worker, { type: 'end' })));
await Promise.all(completion);
