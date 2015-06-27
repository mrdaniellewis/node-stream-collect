# Stream collect

[![npm version](https://badge.fury.io/js/stream-collect.svg)](http://badge.fury.io/js/stream-collect)

Collects a readable streams data as a string buffer or, for object streams, an array.

```bash
npm install stream-collect
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

Creates a PassThrough stream that that has an additional 'collect' and acts as a Promise.

The `collect` event returns the collected data.  It is called as part of the `end` event.

The PassThrough stream has `then` and `catch` methods added to acts like a Promise (or strictly a "thenable").

```js

// Using the collect event
var collect = require('stream-collect');

var file = fs.createReadableStream( 'myfile' );
file.pipe( new collect.PassThrough() )
	.on( 'collect', function(data) {
		// data = contents of the file
	} );

// As a Promise
var file = fs.createReadableStream( 'myfile' );
file.pipe( new collect.PassThrough() )
	.then(data) {
		// data = contents of the file
	} );

```

## collect.addToStream(stream)

Augment any stream with a `collect` event.

Returns the augmented stream.
