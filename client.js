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
	case 'file':
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

			const arr = new Uint8Array(length);
			let offset = 0;
			for (const curr of data) {
				arr.set(curr, offset);
				offset += curr.length;
			}

			fs.writeFileSync('copy.jpg', arr);
		});
		break;
	default:
		break;
}
