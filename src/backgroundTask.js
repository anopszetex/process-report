const database = process.argv[2];

async function onMessage(msg) {}
process.on('message', onMessage);

console.log('msg from child', database);
