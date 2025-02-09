const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDef = protoLoader.loadSync('runtime.proto', {});

const proto = grpc.loadPackageDefinition(packageDef).runtimePackage;

function main() {
	const server = new grpc.Server();
	server.addService(proto.RuntimeService.service, {
		SendChatMessage: sendChatMessage,
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

function sendChatMessage(call, callback) {
	console.log(`Firing ${sendChatMessage.name}.`);
	const { message, id } = call.request;
	callback(null, { message: `message ${message} from id ${id}` });
}

main();
