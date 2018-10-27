let yonghuming = $.cookie("admin") || "";
if(yonghuming == "") {
	location.href = "./login.html";
}
$("#adname").text(yonghuming);
$("#clos").click(function(){
	$.cookie('admin',null,{expires: -1,path: '/'});
    location.reload();
})
var socket = io('http://localhost:3001');
socket.on('connect', function() {});
socket.on('event', function(data) {});
socket.on('disconnect', function() {});

function socket1() {
	return new Promise(function(resolve, reject) {
		socket.on('sendMessagenew', function(data) {
			console.log(data);
			let html = "";
			for(let i = 0; i < data.length; i++) {
				html += `<tr data-guid="${data[i]._id}">
								<td>${i}</td>
								<td id="messagecont">${data[i].cont}</td>
								<td id="messagename">${data[i].username}</td>
								<td id="messagetime">${data[i].time}</td>
								<td><input type="button" id="del" value="删除" class="btn btn-danger" /></td>
							</tr>`
			}
			$("#productList").html(html);
		});
		resolve();
	})
}

function delsocket() {
	$("#productList").on("click", "#del", function() {
		let guid = $(this).closest("tr").attr("data-guid");
		console.log($(this), guid)
		socket.emit("delsendMessage", {
			id: guid
		});
		$(this).closest("tr").remove();
	})
}
socket1().then(delsocket);