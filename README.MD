# Stream collect

[![npm version](https://badge.fury.io/js/stream-collect.svg)](http://badge.fury.io/js/stream-collect)

Collects a readable streams data as a string, buffer or, for object streams, an array.

```bash
npm install stream-collect
```

## `collect.Collect(options)`

Create a pass through stream with a `collect()` method and `collect` event.

```js
const { Collect } = require('stream-collect');
const file = fs.createReadableStream('myfile');

// Collect using a promise
file.pipe(new Collect())
  .collect()
  .then(buffer => { /* use contents */ });

// Collect using an event
file.pipe(new Collect())
  .on('collect', buffer => { /* use contents */ });

// Collect as a string rather than a buffer
file.pipe(new Collect({ encoding: 'utf-8' }))
  .collect()
  .then(string => { /* use contents */ });

// Collect an object stream
file
  .pipe(new Transform({
    readableObjectMode: true,
    transform(chunk, encoding, callback) {
      chunk.toString().split('').forEach(char = this.push(char));
      callback();
    }
  })
  .pipe(new Collect())
  .on('collect', array => { /* -> array of characters */ });  

```

## `collect(stream, [encoding], [cb])`

Collect a streams contents returning a promise or callback.

```js
const collect = require('stream-collect');
const file = fs.createReadableStream('myfile');

// Collect using a promise
collect(file)
  .then(fileContents => { /* use contents */ });

// Collect using a callback
collect(file, (error, fileContents) => { /* use contents */ });

// Specify an encoding
collect(file, 'base64')
  .then(fileContents => { /* use contents */ });
```

## `collect.CollectObjects()`

A `Collect` stream with `objectMode` set to true.

## `collect.addToStream(stream)`

Augment any stream with a `collect` event.

Returns the augmented stream.
