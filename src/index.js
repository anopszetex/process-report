// eslint-disable-next-line node/no-unpublished-import
import csvtojson from 'csvtojson';
import { fork } from 'node:child_process';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Writable } from 'stream';
import { pipeline } from 'stream/promises';

(async () => {
  const __dirname = fileURLToPath(import.meta.url);

  const database = path.resolve('./database/All_Pokemon.csv');
  const backgroundTaskFile = path.join(__dirname, '../backgroundTask.js');

  const ERROR_EXIT_CODE = 1;
  const PROCESS_COUNT = 30;

  const replications = [];
  const processes = new Map();

  for (let index = 0; index < PROCESS_COUNT; index++) {
    const child = fork(backgroundTaskFile, [database]);

    child.on('exit', () => {
      console.log(`process ${child.pid} exited`);
      processes.delete(child.pid);
    });

    child.on('error', error => {
      console.log(`process ${child.pid} has en error ${error}`);
      // eslint-disable-next-line no-process-exit
      process.exit(ERROR_EXIT_CODE);
    });

    child.on('message', msg => {
      if (replications.includes(msg)) {
        return;
      }

      console.log(`${msg} is replicated`);
      replications.push(msg);
    });

    processes.set(child.pid, child);
  }

  function roundRoubin(array, index = 0) {
    return function () {
      if (index >= array.length) {
        index = 0;
      }

      return array[index++];
    };
  }

  const getProcess = roundRoubin([...processes.values()]);

  console.log(`starting with ${processes.size} processes`);

  await pipeline(
    createReadStream(database),
    csvtojson(),
    Writable({
      write(chunk, encoding, callback) {
        const chosenProcess = getProcess();
        chosenProcess.send(JSON.parse(chunk));
        callback();
      },
    })
  );
})();
