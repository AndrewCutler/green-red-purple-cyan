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
		client.JoinChat({ id }, (err, res) => {
			if (err) {
				console.error(err);
				return;
			}

			console.log('Message from server: ', JSON.stringify(res));
		});
		break;
	case 'message':
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
