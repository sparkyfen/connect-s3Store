Connect-S3Store
=========
ExpressJS Session Store via Amazon S3

Author
------
[Adam Schodde]
Version
-------

0.1


Installation
--------------

```sh
npm install connect-s3Store
```

Options
-------
* `prefix`: (optional) Prefex of the sessions
* `accessKeyId`: Amazon S3 Access Key
* `secretAccessKey`: Amazon S3 Secret Access Key
* `ssl`: true|false (enabling ssl to Amazon S3)
* `region`: us-east-1|us-west-1|etc.. Amazon S3 Region
* `bucketName`: Amazon S3 Bucket containing|will contain the sessions
* `ttl`: How long to store sessions in S3 in seconds

Usage
-----
```javascript
    var S3Store = require('connect-s3Store')(express);
    ...
    app.use(express.session({
		secret: 'someSecret',
		cookie: {
			httpOnly: false, 
			secure: true
		},
		store: new S3Store({
			//prefix: 
			accessKeyId: '',
			secretAccessKey: '',
			ssl: true,
			region: 'us-east-1',
			bucketName: '',
			ttl: 86400 // 1 day
		})
	});
```

License
-------

[MIT]

Copyright(c) 2013 Adam Schodde <sparky1010+github@gmail.com>

  [Adam Schodde]: http://bitbucket.org/brutalhonesty
  [MIT]: http://www.tldrlegal.com/license/mit-license
