# Stream collect

Methods for collecting a stream of data.

```bash
npm install object-stream
```

## collect( stream, [encoding], [cb] )

Collect the contents of a stream.  The collected data will either be a `Buffer`, `String` or `Array` depending on whether `encoding` has been supplied, or it is an object stream.

Returns a `Promise` that will resolve with the collected data.

* `stream` the stream to collect
* `encoding` the encoding to return data in
* `cb` a callback that will be called with the collected data. 


```js
var collect = require('stream-collect');	
var file = fs.createReadableStream( 'myfile' );

// Collect using a promise
collect(file)
	.then( function(theWholeFile) {
		// Do something
	} );

// Collect using a callback
collect( file, function(theWholeFile) {
	// Do something
} )

// Specify an encoding
collect( file, 'base64' )
	.then( function(theWholeFileInBase64) {
		// Do something
	} );
```

## collect.PassThrough()

A PassThrough stream that has been augmented with a collect event.  This will be emitted in the `end` event with the collected contents of the stream.

```js
var collect = require('stream-collect');

var file = fs.createReadableStream( 'myfile' );
file.pipe( new collect.PassThrough() )
	.on( 'collect', function(data) {
		// data = contents of the file
	} );
```

## collect.addToStream(stream)

Augment any stream with the collect event used on `collect.PassThrough`.

Returns the augmented stream.
