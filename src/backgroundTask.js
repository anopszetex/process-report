const names = new Set();
const reported = new Set();

process.on('message', message => {
  if (message.type === 'end') {
    process.send({ type: 'done' }, () => process.exit(0));
    return;
  }

  if (names.has(message.name) && !reported.has(message.name)) {
    reported.add(message.name);
    process.send({ type: 'duplicate', name: message.name });
  }

  names.add(message.name);
});
