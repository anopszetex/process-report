import { open } from 'node:fs/promises';

const READ_SIZE = 64 * 1024;

async function findNextLineStart(handle, position, fileSize) {
  let cursor = position;

  while (cursor < fileSize) {
    const length = Math.min(READ_SIZE, fileSize - cursor);
    const buffer = Buffer.allocUnsafe(length);
    const { bytesRead } = await handle.read(buffer, 0, length, cursor);
    const newline = buffer.subarray(0, bytesRead).indexOf(0x0a);

    if (newline !== -1) {
      return cursor + newline + 1;
    }

    cursor += bytesRead;
  }

  return fileSize;
}

async function readRange(handle, start, endExclusive) {
  const buffer = Buffer.alloc(endExclusive - start);
  await handle.read(buffer, 0, buffer.length, start);
  return buffer.toString();
}

async function createCsvRanges(file, requestedRangeCount) {
  const handle = await open(file, 'r');

  try {
    const { size } = await handle.stat();
    const dataStart = await findNextLineStart(handle, 0, size);

    if (dataStart === size) {
      throw new Error('CSV file must contain a header and at least one record');
    }

    const header = (await readRange(handle, 0, dataStart - 1)).replace(/\r$/, '');
    const boundaries = [dataStart];
    const dataSize = size - dataStart;

    for (let index = 1; index < requestedRangeCount; index += 1) {
      const target = dataStart + Math.floor((dataSize * index) / requestedRangeCount);
      const boundary = await findNextLineStart(handle, target, size);
      const previous = boundaries.at(-1);

      if (boundary > previous && boundary < size) {
        boundaries.push(boundary);
      }
    }

    boundaries.push(size);

    return {
      header,
      ranges: boundaries.slice(0, -1).map((start, index) => ({
        start,
        endExclusive: boundaries[index + 1],
      })),
    };
  } finally {
    await handle.close();
  }
}

export { createCsvRanges, findNextLineStart };
