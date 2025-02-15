const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDef = protoLoader.loadSync('runtime.proto', {});

const proto = grpc.loadPackageDefinition(packageDef).runtimePackage;

const client = new proto.RuntimeService(
	'localhost:40000',
	grpc.credentials.createInsecure(),
);

const [, , command, id, message] = process.argv;

switch (command) {
	case 'join':
		const call = client.GetVideo({ id });

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
	case 'message':
		if (!message) {
			console.error('no message');
			return;
		}

		client.SendChatMessage({ message, id }, (err, res) => {
			if (err) {
				console.error(err);
				return;
			}

			console.log('Message from server: ', JSON.stringify(res));
		});
		break;
	default:
		break;
}
