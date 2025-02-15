const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDef = protoLoader.loadSync('runtime.proto', {});
const fs = require('fs');

const proto = grpc.loadPackageDefinition(packageDef).runtimePackage;

function main() {
	const server = new grpc.Server();
	server.addService(proto.RuntimeService.service, {
		SendChatMessage: sendChatMessage,
		GetVideo: getVideo,
	});
	server.bindAsync(
		'0.0.0.0:40000',
		grpc.ServerCredentials.createInsecure(),
		(err, port) => {
			if (err) {
				console.error(err);
				return;
			}

			console.log(`Server started on port ${port}.`);
		},
	);
}

function getVideo(call) {
	const stream = fs.createReadStream('photo.jpg', { highWaterMark: 100 });

	stream.on('data', async function (chunk) {
		call.write({ chunk });
	});

	stream.on('end', function () {
		console.log('finished reading file.');
		call.end();
	});

	stream.on('error', function (err) {
		console.error('error reading file:', err);
		call.end();
	});
}

function sendChatMessage(call, callback) {
	const { message, id } = call.request;
	if (!chats.has(id)) {
		const msg = `no chat with id ${id}`;
		callback(null, { message: msg });
		console.error(msg);
		return;
	}

	const chat = chats.get(id);

	callback(null, { message: `message ${message} from id ${id}` });
}

main();
