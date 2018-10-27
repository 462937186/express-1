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
//loading效果
$(document).ajaxStart(function() {
	$("#productList").html("<img src='./images/loading.gif' class='cent-img'/>");
});

function ajax1() {
	return new Promise(function(resolve, reject) {
		$.ajax({
			url: 'http://localhost:3000/files/liebiao',
			type: 'POST',
			datatype: "json",
			data: {
				admin: yonghuming
			},
			success: function(data) {
				resolve(data);
			}
		});
	})
}
var imgurl = new Object(); //用对象存储图片路径方便删改
//生成列表
function listHtml(value) {
	return new Promise(function(resolve, reject) {
		let html = value.map(function(item, idx) {
			var str = item.lujing.split("&"); //多张图片分割
			for(let i = 0; i < str.length; i++) {
				str[i] = str[i].slice(7);
			}
			//		console.log(str);
			imgurl[item._id] = str; //存入图片
			return `<tr data-guid = "${item._id}">
								<td>${idx}</td>
								<td id="img"><img src="${str[0]}" class="gift-pic img-thumbnail" /></td>
								<td id="lasname">${item.username}</td>
								<td id="J-price">￥${item.price}</td>
								<td id="p-quantity">${item.inventory}</td>
								<td><input type="button" id="del" value="删除" class="btn btn-danger" /></td>
								<td><input type="button"  value="修改" class="btn btn-warning alter" /></td>
							</tr>`
		}).join("");
		$("#productList").html(html);
		dellist();
		resolve(value);
	})
}
//删除按钮
function dellist() {
	$("#productList").unbind("click").on("click", "#del", function() {
		let guid = $(this).closest("tr").attr("data-guid");
		let us = imgurl[guid]; //搜索符合id的图片组
		//		console.log(us);
		$.ajax({
			url: 'http://localhost:3000/files/del',
			type: 'POST',
			datatype: "json",
			traditional: true,
			data: {
				id: guid,
				admin: yonghuming,
				asd: us
			},
			success: function(data) {
				ajax1().then(listHtml).then(xiugai);
			}
		})
	})
}
ajax1().then(listHtml).then(xiugai);
//搜索
var cpLock = false;
$('#search').unbind("compositionstart").on('compositionstart', function() {
	// 输入汉语拼音时锁住搜索框，不进行搜索，或者从汉语拼音转到字母时也可触发
	cpLock = true;
	//	console.log('不搜索')
});
$('#search').unbind("compositionend").on('compositionend', function() {
	// 结束汉语拼音输入并生成汉字时，解锁搜索框，进行搜索
	cpLock = false;
	if($('#search').val().trim() != "") {
		ajaxTime($('#search').val().trim());
	} else if($('#search').val().trim() == "") {
		ajax1().then(listHtml).then(xiugai);
	}
});
$('#search').unbind("input").on('input', function() {
	if(!cpLock) {
		if($('#search').val().trim() != "") {
			ajaxTime($('#search').val().trim());
		} else if($('#search').val().trim() == "") {
			ajax1().then(listHtml).then(xiugai);
		}
	}
});

function ajaxTime(value) {
	//实时搜索
	if(time3) {
		clearTimeout(time3);
	}
	var time3 = setTimeout(function() {
		_ajax = $.ajax({
			url: 'http://localhost:3000/files/search',
			type: 'POST',
			datatype: "json",
			data: {
				search: value
			},
			success: function(data) {
				//				console.log(data);
				listHtml(data); //列表生成后才设置按钮
				xiugai(data);
			}
		})
	}, 500);
}

var old = []; //更改的旧文件src
var upid;

function xiugai(data) {
	//获取的id
	var oldtow = []; //旧的图片组
	//	console.log(data);
	$(".alter").unbind("click").on("click", function() {
		oldtow = [];
		upid = $(this).closest("tr").attr("data-guid");
		$(".overlay").fadeIn(1000);
		$(".box").slideDown(200);
		//		console.log(upid);
		let html = "";
		$.each(data, function(idx, item) {
			if(upid == item._id) {
				let btr = item.lujing.split("&");
				for(let i = 0; i < btr.length; i++) {
					btr[i] = btr[i].slice(7);
					html += `<a class="imglia col mb-2" href="javascript:void(0);" data-imgid="${i}">
								<img class="imglis " src="${btr[i]}" />
								<input type="file" class="form-control filecss" id="updataimg" name="upimges" accept=".gif,.jpg,.png" onchange="xmTanUploadImg(this)" required>
							</a>`;
				}
				$(".updata").html(html);
				$("#updataname").val(item.username);
				$("#updataprice").val(item.price);
				$("#updatakucun").val(item.inventory);
			}
		});
		oldtow = imgurl[upid]; //获取点击到要修改的旧的src
	});
	//开始修改
	$("#yes").unbind("click").on("click", function() {
		var updata = new FormData();
		for(let i = 0; i < newArr.length; i++) {
			updata.append("upimges", newArr[i]);
		}
		$(".overlay").fadeOut(200);
		$(".box").hide(200);
		console.log(old, oldtow); 
		updata.append("old", [old]);
		updata.append("oldtow", [oldtow]); //更改了废弃的src和旧的图片组
		updata.append("id", upid);
		updata.append("username", $("#updataname").val());
		updata.append("price", $("#updataprice").val());
		updata.append("inventory", $("#updatakucun").val());
		updata.append("admin", yonghuming);
		$.ajax({
			url: 'http://localhost:3000/users/update',
			type: 'post',
			cache: false, //不必须 是否在缓存中读取数据的读取
			traditional: true, //false,jquery会深度序列化这个对象  true后可传数组
			data: updata,
			processData: false, //必须  不处理数据
			contentType: false, //必须 不设置内容类型
			success: function(data) {
				ajax1().then(listHtml).then(xiugai);
				old = [];
				oldtow = [];
				newArr = [];
			},
			error: function(xhr) {
				console.log(xhr.responseText)
			}
		});
	})
	$("#no").click(function() {
		$(".overlay").fadeOut(200);
		$(".box").hide(200);
		newArr = [];
		old = [];
	});
}

var newArr=[]; //新上传的文件
//判定文件类型，预览图片
function xmTanUploadImg(obj) {
	var file = obj.files;
	var name = obj.value;
	var fileName = name.substring(name.lastIndexOf(".") + 1).toLowerCase(); //lastIndexOf() 方法可返回一个指定的字符串值最后出现的位置
	//substring() 方法用于提取字符串中介于两个指定下标之间的字符
	//	console.log(name,fileName);
	//	console.log(name.lastIndexOf("."));
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
		newArr.push(file[i]);
		old.push($(obj).prev().attr("src"));
		var reader = new FileReader();//FileReader对象
		reader.readAsDataURL(file[i]);//readAsDataURL file  将文件读取为 DataURL
		reader.onload = (e) => {// onload 文件读取成功完成时触发
			imgsrc = e.target.result;
			$(obj).prev().attr("src", imgsrc);
		}
	}
	//	console.log(newArr, old)
}