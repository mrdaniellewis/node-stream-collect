/* jshint node: true */
"use strict";

var stream = require('stream');
var util = require('util');
var promiseUtil = require('promise-util');
var debug = require('debug')('stream-collect');

/**
 *	When a listener for an event named collect is 
 *	added setup collecting the data.
 */
var addListener = function(name) {
	
	if ( name !== 'collect' ) {
		return;
	}

	if ( this._collecting ) {
		// Don't add more than once
		return;
	}

	debug( 'adding collect method', this._readableState.objectMode, this._readableState.encoding );

	var collected;
	if ( this._readableState.objectMode ) {
		collected = [];
	} else if ( this._readableState.encoding === null ) {
		collected = new Buffer(0);
	} else {
		collected = '';
	}

	this
		.on( 'data', function(chunk) {
			
			debug( 'data', chunk );

			if ( chunk !== null ) {
				if ( this._readableState.objectMode ) {
					collected.push(chunk);
				} else if ( this._readableState.encoding === null ) {
					collected = Buffer.concat( [ collected, chunk ] );
				} else {
					collected += chunk;
				}
			}
		} )
		.on( 'end', function() {
			this.emit( 'collect', collected );
		} );

	this._collecting = true;
};

/**
 *	Add the collect event to the stream
 *	@param {Stream} stream
 */
function addToStream(stream) {

	// Don't add more than once
	if ( stream.listeners('addListener').indexOf(addListener) > -1 ) {
		return;
	}

	stream.on( 'newListener', addListener );

	return stream;
}

/**
 *	Collect all data in a stream and return it in a callback
 *	@param {Stream} stream A stream
 *	@param {Function} cb Callback, the first argument will be the data
 */
function collect( stream, encoding, cb ) {

	if ( typeof encoding === 'function' ) {
		cb = encoding;
		encoding = null;
	}

	var defer = promiseUtil.defer();

	stream
		.pipe( new PassThrough( { 
			encoding: encoding, 
			objectMode: stream._readableState.objectMode 
		} ) )
		.on( 'collect', function(data) {
			defer.resolve(data);
			if (cb) {
				cb( data );
			}
		} )
		.on( 'error', defer.reject );

	return defer;
}

/**
 *	Returns a PassThrough stream augmented with collect
 *	@param {Object} [options]
 */
function PassThrough(options) {
	return addToStream( new stream.PassThrough(options) );
}

module.exports = collect;
collect.addToStream = addToStream;
collect.PassThrough = PassThrough;