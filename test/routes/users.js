var express = require('express');
var router = express.Router();
var mongo = require('./server.js');
var multer = require('multer');
var mongoose = require('mongoose');
var fs = require('fs');

var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		//console.log(file)
		cb(null, './public/images') //上传文件夹
	},
	//给上传文件重命名，获取添加后缀名
	filename: function(req, file, cb) {
		var fileFormat = (file.originalname).split(".");
		//给图片加上时间戳格式防止重名名
		//比如把 abc.jpg图片切割为数组[abc,jpg],然后用数组长度-1来获取后缀名
		cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]); //表单名字+时间+分割数组[1]
	}
});
var upload = multer({
	storage: storage
});

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.post('/uploads', upload.any(), function(req, res, next) {
	function dleur() {
		return new Promise(function(resolve, reject) {
			let path = "";
			for(let i = 0; i < req.files.length; i++) {
				path += req.files[i].path + "&";
				//		console.log('文件保存路径：%s', path);
			}
			req.body["lujing"] = path.slice(0, -1);
			resolve();
		})
	}
	function mongodel() {
		return new Promise(function(resolve, reject) {
			mongo.query(function(db) {
				db.collection("goodlist").insert([req.body], function(err, result) {
					console.log("yes");
				});
			})
			resolve();
		})
	}
	function delsend() {
		res.send(req.body);

	}
dleur().then(mongodel).then(delsend);
});

router.post('/update', upload.any(), function(req, res, next) {
	var gid = mongoose.Types.ObjectId(req.body.id);
	let path = "";

	function ready() {
		return new Promise(function(resolve, reject) {
			let str = "public/";
			let oldtow = req.body.oldtow.split(","); //全套旧文件路径
			let delurl = req.body.old.split(","); //旧文件路径
			for(let i = 0; i < delurl.length; i++) {
				delurl[i] = str + delurl[i];
			}
			for(let i = 0; i < oldtow.length; i++) {
				oldtow[i] = str + oldtow[i];
			}
			//删除被替换的图片
			for(let i = 0; i < delurl.length; i++) {
				fs.unlink(delurl[i], function(err) { //删除文件
					if(err) console.log(err);
					console.log("删除成功");
				})
			}
			var arr1 = []; //剩余的图片//新文件路径
			for(let i = 0; i < oldtow.length; i++) {
				delurl.indexOf(oldtow[i]) === -1 ? arr1.push(oldtow[i]) : 0; //如果要检索的字符串值没有出现，则该方法返回 -1。
			}
			for(let i = 0; i < req.files.length; i++) {
				arr1.push(req.files[i].path);
			}

			for(let i = 0; i < arr1.length; i++) {
				path += arr1[i] + "&";
			}
			path = path.slice(0, -1);
			resolve(path);
		})
	}

	function start() {
		return new Promise(function(resolve, reject) {
			mongo.query(function(db) {
				db.collection("goodlist").update({
					'_id': gid
				}, {
					$set: {
						"username": req.body.username,
						"price": req.body.price,
						"inventory": req.body.inventory,
						"admin": req.body.admin,
						"lujing": path
					}
				}, {
					multi: true
				})
			})
			resolve();
		})
	}

	function send() {
		res.send("yes");
	}
	ready().then(start).then(send)
});

router.post('/register', function(req, res, next) {
	console.log(req.body)

	function isExistSameName() {
		return new Promise(function(resolve, reject) {
			mongo.query(function(db) {
				db.collection("zucebiao").find({
					username: req.body.username
				}).toArray(function(err, result) {
					if(err) {
						console.log('Error:' + err);
						return;
					}
					console.log(result);
					if(result.length > 0) {
						res.send("fail");
					} else {
						resolve()
					}
				});
			})
		})
	}

	function isInsertUser() {
		return new Promise(function(resolve, reject) {
			mongo.query(function(db) {
				db.collection("zucebiao").insert([{
					username: req.body.username,
					password: req.body.password
				}], function(err, result) {
					if(err) throw error;
					res.send("success");
				});
			})
		})
	}
	isExistSameName().then(isInsertUser);

});

router.post('/login', function(req, res, next) {
	console.log(req.body);
	mongo.query(function(db) {
		db.collection("zucebiao").find({
			$and: [{
				"username": req.body.username
			}, {
				"password": req.body.password
			}]
		}).toArray(function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			}
			console.log(result);
			if(result.length > 0) {
				res.cookie('admin', req.body.username, {

					path: '/',
				});
				res.send(req.body.username);
			} else {
				res.send("fail");
			}
		});
	})
});

module.exports = router;