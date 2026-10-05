function partitionFor(value, partitionCount) {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.codePointAt(0)) >>> 0;
  }

  return hash % partitionCount;
}

export { partitionFor };
