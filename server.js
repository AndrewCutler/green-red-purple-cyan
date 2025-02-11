const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDef = protoLoader.loadSync('runtime.proto', {});

const proto = grpc.loadPackageDefinition(packageDef).runtimePackage;

function main() {
	const server = new grpc.Server();
	server.addService(proto.RuntimeService.service, {
		SendChatMessage: sendChatMessage,
		JoinChat: joinChat,
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

const chats = new Map();

function joinChat(call, callback) {
	const { id } = call.request;
	let chat, action;
	if (chats.has(id)) {
		chat = chats.get(id);
        // todo: check user isn't already joined
		chat.users.push(id);
		action = 'joined';
	} else {
		chat = { id, users: [] };
		action = 'created';
		chat.users = [id];
		chats.set(id, chat);
	}
	console.log(chats);
	callback(null, { action });
}

function sendChatMessage(call, callback) {
	console.log(`Firing ${sendChatMessage.name}.`);
	const { message, id } = call.request;
	callback(null, { message: `message ${message} from id ${id}` });
}

main();
