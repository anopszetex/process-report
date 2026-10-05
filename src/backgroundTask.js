import csvtojson from 'csvtojson';
import { createReadStream } from 'node:fs';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const [file, startValue, endExclusiveValue, encodedHeader] = process.argv.slice(2);
const start = Number(startValue);
const endExclusive = Number(endExclusiveValue);
const header = Buffer.from(encodedHeader, 'base64').toString();
const counts = new Map();
let records = 0;

async function* csvRange() {
  yield `${header}\n`;
  yield* createReadStream(file, { start, end: endExclusive - 1 });
}

async function run() {
  await pipeline(
    Readable.from(csvRange()),
    csvtojson(),
    new Writable({
      objectMode: true,
      write(record, _encoding, callback) {
        try {
          const parsed = Buffer.isBuffer(record)
            ? JSON.parse(record.toString())
            : record;

          if (typeof parsed.Name !== 'string') {
            callback(new Error('CSV record does not contain a Name column'));
            return;
          }

          counts.set(parsed.Name, (counts.get(parsed.Name) ?? 0) + 1);
          records += 1;
          callback();
        } catch (error) {
          callback(error);
        }
      },
    })
  );

  const entries = [...counts];
  const batchSize = 1000;

  for (let index = 0; index < entries.length; index += batchSize) {
    process.send({
      type: 'counts',
      entries: entries.slice(index, index + batchSize),
    });
  }

  process.send({ type: 'done', records }, () => process.exit(0));
}

run().catch(error => {
  process.send({ type: 'error', error: error.message }, () => process.exit(1));
});
