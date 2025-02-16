const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDef = protoLoader.loadSync('runtime.proto', {});

const proto = grpc.loadPackageDefinition(packageDef).runtimePackage;

const client = new proto.RuntimeService(
	'localhost:40000',
	grpc.credentials.createInsecure(),
);

const [, , command, filename] = process.argv;

switch (command) {
	case 'getfile': {
		const call = client.GetFile({ filename });

		const data = [];
		call.on('data', function ({ chunk }) {
			data.push(chunk);
		});

		call.on('end', function () {
			let length = 0;
			for (const curr of data) {
				length += curr.length;
			}

			const buffer = new Uint8Array(length);
			let offset = 0;
			for (const curr of data) {
				buffer.set(curr, offset);
				offset += curr.length;
			}

			fs.writeFileSync('copy.jpg', buffer);
		});
		break;
	}
	case 'upload': {
		const call = client.UploadFile(function (err, res) {
			if (err) {
				console.error(err);
				return;
			}
		});
		call.write({ chunk: Buffer.from('testing', 'utf-8') });
		call.end();
		break;
	}
	default:
		break;
}
