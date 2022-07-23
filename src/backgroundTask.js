// eslint-disable-next-line node/no-unpublished-import
import csvtojson from 'csvtojson';
import { createReadStream } from 'node:fs';
import { Transform, Writable } from 'stream';
import { pipeline } from 'stream/promises';

const database = process.argv[2];

async function onMessage(msg) {
  const firstTimeRan = [];

  await pipeline(
    createReadStream(database),
    csvtojson(),
    Transform({
      transform(chunk, encoding, callback) {
        const data = JSON.parse(chunk);

        if (data.Name !== msg.Name) {
          return callback();
        }

        if (firstTimeRan.includes(data.Name)) {
          return callback(null, msg.Name);
        }

        firstTimeRan.push(msg.Name);

        return callback();
      },
    }),
    Writable({
      write(chunk, encoding, callback) {
        if (!chunk) {
          return callback();
        }

        process.send(chunk.toString());
      },
    })
  );
}

process.on('message', onMessage);

setTimeout(() => {
  process.channel.unref();
}, 8000);
