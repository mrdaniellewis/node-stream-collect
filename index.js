'use strict';

const { PassThrough } = require('stream');
const debug = require('debug')('stream-collect');

/**
 *  When a listener for an event named collect is added start collecting the data
 */
const addListener = function addListener(name) {
  if (name !== 'collect') {
    return;
  }

  if (this._collecting) {
    // Don't add more than once
    return;
  }

  debug('adding collect method', this._readableState.objectMode, this._readableState.encoding);

  let collected;
  if (this._readableState.objectMode) {
    collected = [];
  } else if (this._readableState.encoding === null) {
    collected = Buffer.from('');
  } else {
    collected = '';
  }

  this
    .on('readable', () => {
      let chunk;
      while ((chunk = this.read()) !== null) {
        debug('data', chunk);

        if (chunk !== null) {
          if (this._readableState.objectMode) {
            collected.push(chunk);
          } else if (this._readableState.encoding === null) {
            collected = Buffer.concat([collected, chunk]);
          } else {
            collected += chunk;
          }
        }
      }
    })
    .on('end', () => this.emit('collect', collected));

  this._collecting = true;
};

/**
 *  Add the collect event to the stream
 *  @param {Stream} stream
 */
function addToStream(stream) {
  // Don't add more than once
  if (stream.listeners('addListener').includes(addListener)) {
    return stream;
  }

  stream.on('newListener', addListener);

  return stream;
}

/**
 *  Returns a PassThrough stream with the collect event added and a collect method
 */
class Collect extends PassThrough {
  constructor(options) {
    super(options);
    addToStream(this);
    this._collected = null;
  }

  collect() {
    if (!this._collected) {
      this._collected = new Promise((resolve, reject) => {
        this.on('collect', resolve);
        this.on('error', reject);
      });
    }
    return this._collected;
  }

  /** @depreacted */
  then(resolve, reject) {
    return this.collect().then(resolve, reject);
  }

  /** @depreacted */
  catch(reject) {
    return this.collect().then(null, reject);
  }
}

/**
 *  A CollectStreamObject set to objectMode
 */
class CollectObjects extends Collect {
  constructor(options = {}) {
    options.objectMode = true;
    super(options);
  }
}

/**
 *  Collect all data in a stream and return as a promise or in a callback
 *  @param {Stream} stream A stream
 *  @param {String} [encoding] Stream encoding - optional
 *  @param {Function} cb Callback, the first argument will be the data
 *  @returns {Promise}
 */
function collect(stream, encoding, cb = () => {}) {
  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  return stream
    .pipe(new Collect({ encoding, objectMode: stream._readableState.objectMode }))
    .collect()
    .then((data) => {
      cb(null, data);
      return data;
    })
    .catch((e) => {
      cb(e);
      throw e;
    });
}


module.exports = collect;
collect.addToStream = addToStream;
collect.Collect = Collect;
collect.CollectObjects = CollectObjects;

// deprecated names
collect.PassThrough = function (options) { return new Collect(options); };
collect.stream = collect.PassThrough;
collect.PassThroughObject = function (options) { return new CollectObjects(options); };
collect.objectStream = collect.PassThroughObject;
