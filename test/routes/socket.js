var mongo = require('./server.js');
var mongoose = require('mongoose');

function socket() {
	var app = require('express')();
	var server = require('http').createServer(app);
	var io = require('socket.io')(server);
	io.on('connection', function(socket) {
		console.log(socket.id);
		//服务端发送已入库留言入页面发送一次
		mongo.query(function(db) {
			db.collection("pinglun").find({}).toArray(function(err, result) {
				if(err) {
					console.log('Error:' + err);
					return;
				}
				//				console.log(result);
				io.sockets.emit("sendMessagenew", result);
			});
		});
		//监听客户端传过来的留言并写入mongodb,再返回给客户端显示
		socket.on("sendMessageToServer", function(data) {
			console.log(data);
			mongo.query(function(db) {
				db.collection("pinglun").insert(data, function(err, result) {
					console.log("yes");
				});
			})
			//公聊
			io.sockets.emit("sendMessageToAllClient", data)
			//私聊
			//io.sockets.sockets[socketid].emit
		});
		//监听传过来的id执行删除库内对应留言信息
		socket.on("delsendMessage", function(data) {
			console.log(data.id);
			var gid = mongoose.Types.ObjectId(data.id);
			mongo.query(function(db) {
				db.collection("pinglun").remove({
					"_id": gid
				}, function(err, result) {
					if(err) {
						console.log('Error:' + err);
						return;
					}
					//删除完成再次发送剩余信息再次生成页面
					mongo.query(function(db) {
						db.collection("pinglun").find({}).toArray(function(err, result) {
							if(err) {
								console.log('Error:' + err);
								return;
							}
							//				console.log(result);
							io.sockets.emit("sendMessagenew", result);
						});
					});
				});
			});
		})
	});
	server.listen(3001);
}

module.exports = {
	socket
}