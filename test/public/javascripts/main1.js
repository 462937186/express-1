let yonghuming = $.cookie("admin") || "";
if(yonghuming == "") {
	location.href = "./login.html";
}

$("#adname").text(yonghuming);
$("#clos").click(function() {
	$.cookie('admin', null, {
		expires: -1,
		path: '/'
	});
	location.reload();
})
var data = new FormData();
var filesArr = [];

function xmTanUploadImg(obj) {
	var file = obj.files;
	for(let i = 0; i < file.length; i++) {
//		console.log(file[i])
		filesArr.push(file[i]);
	}
	var name = obj.value;
	var fileName = name.substring(name.lastIndexOf(".") + 1).toLowerCase();
	if(fileName != "jpg" && fileName != "png" && fileName != "gif") {
		alert("请选择图片格式文件上传(jpg,png,gif)！");
		obj.value = "";
		return false; //阻止submit提交
	}
	for(let i = 0; i < file.length; i++) {
		var fileSize = Math.round(file[i].size / 1024 / 1024);
		if(fileSize >= 3) {
			alert("请上传小于少于3M的图片");
			return false;
		}
		var reader = new FileReader();
		reader.readAsDataURL(file[i]);//将文件读取为 DataURL
		reader.onload = function(e) {//onload 文件读取成功完成时触发
			imgsrc = e.target.result;//lastModified 属性可返回文档最后被修改的日期和时间
			let html = `<a href="javascript:void(0);" class="filea del" data-imgid="${file[i].lastModified}">
									<img src="${imgsrc}" class="flieimg" />
								</a>
								`;
			$(".updata").prepend(html);
		}
	}
//	console.log(filesArr);
	$(".updata").unbind("click").on("click", ".del", function() {
//		console.log(file[i].name);
		let idname = $(this).attr("data-imgid");
		for(let i = 0; i < filesArr.length; i++) {
				if(filesArr[i].lastModified == idname) {//lastModified 属性可返回文档最后被修改的日期和时间
//					console.log(filesArr[i].name,file[j].name);
					filesArr.splice(i, 1);
			}
		}
					console.log(filesArr);
		$(this).remove();
	});
}
$("#addProduct").on("click", function() {
	for(let i = 0; i < filesArr.length; i++) {
		data.append("upimges", filesArr[i]);
	}
	data.append("username", $('#validationServer01').val());
	data.append("price", $('#validationServer4').val());
	data.append("inventory", $('#validationServer03').val());
	data.append("admin", yonghuming);
	$.ajax({
		url: 'http://localhost:3000/users/uploads',
		type: 'post',
		cache: false, //不必须
		data: data,
		processData: false, //必须
		contentType: false, //必须
		success: function(data) {
			location.reload();
		},
		error: function(xhr) {
			console.log(xhr.responseText)
		}
	});
})