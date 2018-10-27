var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var mongoose = require('mongoose');
var mongo = require('./server.js');
var fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

//查询已经上架商品
router.post('/liebiao', function(req, res, next) {
	console.log(req.body);
	mongo.query(function(db) {
		db.collection("goodlist").find({
			admin: req.body.admin
		}).toArray(function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			}
			res.send(result);
		});
	})
});
//条件查询
router.post('/search', function(req, res, next) {
	console.log(req.body);
	mongo.query(function(db) {
		db.collection("goodlist").find({
			$or: [ {"username":req.body.search}, {"price": req.body.search},{"inventory": req.body.search} ]
		}).toArray(function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			}
			res.send(result);
		});
	})
});
//删除
router.post('/del', function(req, res, next) {
	var gid = mongoose.Types.ObjectId(req.body.id);
//	console.log(req.body);
	let str ="./public/";
	let delurl = req.body.asd;
	for(let i = 0; i < delurl.length; i++) {
		fs.unlink(str+delurl[i], function(err) {
			if(err)  console.log(err) ;
			console.log("删除成功");
		})
	}
	mongo.query(function(db) {
		db.collection("goodlist").remove({
			"_id": gid,
			"admin": req.body.admin
		}, function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			}
		});
	})
	next()
},function(req, res){
	res.send("yes");
});

module.exports = router;