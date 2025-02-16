const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDef = protoLoader.loadSync('runtime.proto', {});
const fs = require('fs');

const proto = grpc.loadPackageDefinition(packageDef).runtimePackage;

function main() {
	const server = new grpc.Server();
	server.addService(proto.RuntimeService.service, {
		GetFile: getFile,
		UploadFile: uploadFile,
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

function getFile(call) {
	const { filename } = call.request;
	const stream = fs.createReadStream(filename, { highWaterMark: 100 });

	stream.on('data', async function (chunk) {
		call.write({ chunk });
	});

	stream.on('end', function () {
		console.log('finished reading file.');
		call.end();
	});

	stream.on('error', function (err) {
		switch (err.code) {
			case 'ENOENT':
				console.error('Cannot find file: ', filename);
				break;
			case 'EACCES':
				console.error('Cannot access file: ', filename);
				break;
			default:
				console.error(err);
				break;
		}
		call.end();
	});
}

function uploadFile(call, callback) {
	const data = [];
	call.on('data', function ({ chunk }) {
		console.log('data: ', {
			chunk,
			string: String.fromCharCode(...chunk),
		});
	});

	call.on('end', function () {
		console.log('end');
	});
}

main();
