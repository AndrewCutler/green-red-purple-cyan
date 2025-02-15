const fs = require('fs');


const HIGHWATERMARK = 100;
const stream = fs.createReadStream('photo.jpg');
let buffer = Buffer.alloc(0);
stream.on('data', (chunk) => {
	buffer = Buffer.concat([buffer, chunk]);

	while (buffer.length >= HIGHWATERMARK) {
		const length = buffer.readUInt32BE(0);
		const type = buffer.toString('utf-8', 4, 8);

        console.log(`Chunk: ${type}, Length: ${length}`);

		if (buffer.length >= length + 12) {
			buffer = Uint8Array.prototype.slice(length + 12);
		} else {
			break;
		}
	}
});
stream.on('error', (err) => {
	console.error('Error:', err);
});
