var socket = io('http://localhost:3001');
socket.on('connect', function() {});
socket.on('event', function(data) {});
socket.on('disconnect', function() {});
//监听
//第一个生成留言列表
socket.on('sendMessagenew', function(data) {
	//				console.log(data[0]);
	for(let i = 0; i < data.length; i++) {
		let html = `<li class="media my-4">
							<img class="mr-3 align-self-center plunimg" src="images/shangpin1.jpg" alt="Generic placeholder image">
							<div class="media-body">
								<h5 class="mt-0 mb-1">${data[i].username}</h5> ${data[i].cont}
							</div>
						</li>`
		$(".list-unstyled").append(html);
	}

});
//生成新插入的留言
socket.on('sendMessageToAllClient', function(data) {
	console.log(data);
	let html = `<li class="media  my-4">
							<img class="mr-3 align-self-center plunimg" src="images/shangpin1.jpg" alt="Generic placeholder image">
							<div class="media-body">
								<h5 class="mt-0 mb-1">${data.username}</h5> ${data.cont}
							</div>
						</li>`
	$(".list-unstyled").append(html);
});
//点击发送留言信息
$("#send").click(function() {
	function getNow(s) {
		return s < 10 ? '0' + s : s;
	}
	var myDate = new Date();
	//获取当前年
	var year = myDate.getFullYear();
	//获取当前月
	var month = myDate.getMonth() + 1;
	//获取当前日
	var date = myDate.getDate();
	var h = myDate.getHours(); //获取当前小时数(0-23)
	var m = myDate.getMinutes(); //获取当前分钟数(0-59)
	var s = myDate.getSeconds();
	var now = year + '-' + getNow(month) + "-" + getNow(date) + " " + getNow(h) + ':' + getNow(m) + ":" + getNow(s);
	console.log(now);
	socket.emit("sendMessageToServer", {
		time: now,
		cont: $("#message").val(),
		username: $("#username").val()
	});
})