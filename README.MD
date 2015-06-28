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

## `collect.stream()` / `collect.PassThrough()`


`collect.stream()` creates a `stream.PassThrough` with an additional 'collect' event that can also act as a Promise.

```js

var collect = require('stream-collect');

// Using the collect event
var file = fs.createReadableStream( 'myfile' );
file.pipe( collect.stream() )
	.on( 'collect', function(data) {
		// data = contents of the file
	} );

// As a Promise
var file = fs.createReadableStream( 'myfile' );
file.pipe( collect.stream() )
	.then(data) {
		// data = contents of the file
	} );

```

The `collect` event is called as part of the `end` event.

When collect is piped, any errors from the source stream will be passed to this stream and can be caught in `then` and `catch` when used as a Promise.

`collect.PassThrough()` is an alternative name for `collect.stream`.  Both can be used with or without the `new` operator.

## `collect.objectStream()` / `collect.PassThroughObject()`

Returns a new `collect.stream` with `objectMode` set to true.

## collect.addToStream(stream)

Augment any stream with a `collect` event.

Returns the augmented stream.
