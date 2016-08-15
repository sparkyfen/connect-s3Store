/** 
 * Connect - session - S3Store
 * Copyright(c) 2013 Adam Schodde
 * MIT Licensed
 */

var AWS = require('aws-sdk');
var debug = require('debug');
module.exports = function (connect) {
	var Store = connect.session.Store;

	function S3Store(options) {
		var self = this;
		options = options || {};
		Store.call(this, options);
		this.prefix = null == options.prefix ? 'sess:' : options.prefix;
		var accessKeyId = options.accessKeyId;
		var secretAccessKey = options.secretAccessKey;
		var sslEnabled = options.ssl || true;
		var region = options.region;
		this.bucketName = options.bucketName;
		if(accessKeyId === '' || secretAccessKey === '' || sslEnabled === '' || region === '' || this.bucketName === '') {
			throw new ReferenceError('There was a problem locating the AWS S3 settings, check your options.');
		}
		this.client = new AWS.S3({
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,
			sslEnabled: sslEnabled,
			region: region
		});
		if(this.client === undefined) {
			throw new ReferenceError('Unable to find the S3 Module, please make sure aws-sdk is installed.');
		}
		this.ttl = options.ttl || 0;
	};
	S3Store.prototype.__proto__ = Store.prototype;

	S3Store.prototype.get = function(sid, callback) {
		sid = this.prefix + sid;
		debug('GET "%s"', sid);
		var getOptions = {
			Bucket: this.bucketName,
			Key: 'sessions/' + sid
		};
		var obj = this;
		this.client.getObject(getOptions, function (error, data) {
			if(error) {
				if ((error.code||'') === 'NoSuchKey') {
					return obj.set(sid, {}, function() {
						callback();
					});
				} else {
					return callback(error.message);
				}
			}
			if(!data) {
				return callback();
			}
			try {
				var result = JSON.parse(new Buffer(data.Body));
				debug('GOT %s', result);
				return callback(null, result);
			} catch(e) {
				return callback(e.message);
			}
		});
	};

	S3Store.prototype.set = function(sid, sess, callback) {
		sid = this.prefix + sid;
		var expireDate = new Date();
		expireDate.setSeconds(expireDate.getSeconds() + this.ttl);
		var putOptions = {
			Bucket: this.bucketName,
			Key: 'sessions/' + sid,
			Body: JSON.stringify(sess),
			Expires: expireDate,
			ServerSideEncryption: 'AES256'
		};
		debug('GET sid: "%s" sess: "%s"', sid, sess);
		this.client.putObject(putOptions, function (error, data) {
			if(error) {
				return callback && callback(error.message);
			}
			return callback && callback.apply(this, arguments);
		});
	};	

	S3Store.prototype.destory = function(sid, callback) {
		sid = this.prefix + sid;
		var deleteOptions = {
			Bucket: this.bucketName,
			Key: 'sessions/' + sid
		};
		this.client.deleteObject(deleteOptions, function (error, data) {
			if(error) {
				return callback(error.message);
			}
			if(!data) {
				return callback();
			}
			return callback(null, data);
		});
	};

	S3Store.prototype.length = function(callback) {
		var listOptions = {
			Bucket: this.bucketName,
			Delimiter: '/',
			Prefix: 'sessions'
		}
		this.client.listObjects(listOptions, function (error, data) {
			if(error) {
				return callback(error.message);
			}
			if(!data) {
				return callback();
			}
			return callback(null, data.Contents.length);
		});
	};

	S3Store.prototype.clear = function(callback) {
		var clearOptions = {
			Bucket: this.bucketName,
			Key: 'sessions/'
		};
		this.client.deleteObject(clearOptions, function (error, data) {
			if(error) {
				return callback(error.message);
			}
			if(!data) {
				return callback();
			}
			return callback(null, data);
		});
	};
	return S3Store;
};