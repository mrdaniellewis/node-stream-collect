/* jshint node: true, mocha: true */
"use strict";


var expect = require('expect');
var collect = require('../');
var fs = require('fs');
var path = require('path');
var PassThrough = require('stream').PassThrough;

var testDataPart1 = 'Some data to ';
var testDataPart2 = 'go into the stream';
var completeData = 'Some data to go into the stream';

describe( 'collect.PassThrough', function() {

	it( 'creates a collect.PassThrough instance', function( ) {	
		expect( new collect.PassThrough() ).toBeA( collect.PassThrough );
	} );

	it( 'is a PassThrough stream', function( ) {	
		expect( new collect.PassThrough() ).toBeA( PassThrough );
	} );

	it( 'is can be instigated without new', function( ) {	
		expect( collect.PassThrough() ).toBeA( PassThrough );
	} );

	it( 'collect.stream is a collect.PassThrough', function( ) {	
		expect( collect.stream ).toBe( collect.PassThrough );
	} );

	it( 'collects buffer data', function(done) {
		var stream = new collect.PassThrough()
			.on( 'collect', function(data) {
				expect( Buffer.isBuffer(data) ).toBe(true);
				expect( data.toString() ).toBe( completeData );
				done();
			} );

		stream.write(testDataPart1);
		stream.end(testDataPart2);

	} );

	it( 'collects string data', function(done) {
		var stream = new collect.PassThrough( {encoding: 'utf8'})
			.on( 'collect', function(data) {
				expect( typeof data ).toBe('string');
				expect( data ).toBe( completeData );
				done();
			} );

		stream.write(testDataPart1);
		stream.end(testDataPart2);

	} );

	it( 'handles encoding correctly with string data', function(done) {
		var stream = new collect.PassThrough( {encoding: 'base64'})
			.on( 'collect', function(data) {
				expect( typeof data ).toBe('string');
				expect( new Buffer(data, 'base64').toString() ).toBe( completeData );
				done();
			} );

		stream.write(testDataPart1);
		stream.end(testDataPart2);

	} );

	it( 'collects object data', function(done) {
		var stream = new collect.PassThrough( {objectMode: true})
			.on( 'collect', function(data) {
				expect( Array.isArray(data) ).toBe(true);
				expect( data ).toEqual( [1,2,3] );
				done();
			} );

		stream.write(1);
		stream.write(2);
		stream.end(3);

	} );

	it( 'collects a big arse file', function(done) {

		// If debug is on this is a little slow
		this.timeout( 5000 );

		var file = path.resolve( __dirname, 'war-and-peace.txt' );
		var fileContents = fs.readFileSync( 
			file, 
			{encoding: 'utf8'}
		);

		var stream = new collect.PassThrough( {encoding: 'utf8'} )
			.on( 'collect', function(data) {
				expect(data).toBe(fileContents);
				done();
			} );

		fs.createReadStream( file, {encoding: 'utf8'} )
			.pipe( stream );

	} );

	it( 'can handle having two collect listeners', function(done) {
		var stream = new collect.PassThrough()
			.on( 'collect', function(data) {
				// This one will be called first
				expect( Buffer.isBuffer(data) ).toBe(true);
				expect( data.toString() ).toBe( completeData );
			} )
			.on( 'collect', function(data) {
				// Then this one
				expect( Buffer.isBuffer(data) ).toBe(true);
				expect( data.toString() ).toBe( completeData );
				done();
			} );


		stream.write(testDataPart1);
		stream.end(testDataPart2);

	} );

	describe( 'as a thenable', function() {

		it( 'resolves as promise using the then method', function() {

			var stream = new collect.PassThrough();
			stream.write(testDataPart1);
			stream.end(testDataPart2);

			return stream.then( function(data) {
				expect( Buffer.isBuffer(data) ).toBe(true);
				expect( data.toString() ).toBe( completeData );
			} );

		} );

		it( 'allows then to be chained like a promise', function() {

			var stream = new collect.PassThrough();
			stream.write(testDataPart1);
			stream.end(testDataPart2);

			return stream
				.then( function(data) {
					return 'some completly different data';
				} )
				.then( function(data) {
					expect( data ).toBe('some completly different data');
				} );
		} );

		it( 'returns the same data for subsequent calls to then', function() {

			var stream = new collect.PassThrough();
			stream.write(testDataPart1);
			stream.end(testDataPart2);

			return stream
				.then( function(data) {
					return stream.then();
				} )
				.then( function(data) {
					expect( Buffer.isBuffer(data) ).toBe(true);
					expect( data.toString() ).toBe( completeData );
				} );

		} );

		it( 'rejects as a promise using the then method', function() {

			var stream = new collect.PassThrough();
			stream.write(testDataPart1);

			var promise = stream
				.then( function(data) {
					throw new Error( 'Should not have been called' );
				}, function(e) {
					expect(e).toBe(error);
				} );

			// Need to create the error after the promise is created
			var error = new Error('foo');
			stream.emit('error', error);

			return promise;

		} );

		it( 'rejects as a promise using the catch method', function() {

			var stream = new collect.PassThrough();
			stream.write(testDataPart1);

			var promise = stream
				.then( function(data) {
					throw new Error( 'Should not have been called' );
				} )
				.catch( function(e) {
					expect(e).toBe(error);
				} );

			// Need to create the error after the promise is created
			var error = new Error('foo');
			stream.emit('error', error);

			return promise;

		} );

		it( 'passes errors from a piped stream', function() {

			var stream = new PassThrough();
			var error = new Error('foo');

			stream.write('foobar');

			var promise = stream
				.pipe( new collect.PassThrough() )
				.then( function(data) {
					throw new Error( 'Should not have been called' );
				} )
				.catch( function(e) {
					expect(e).toBe(error);
				} );
			
			stream.emit('error',error);

			return promise;

		} );

	} );



} );

describe( 'collect.PassThroughObject', function() {

	it( 'creates a collect.PassThrough instance', function( ) {	
		expect( new collect.PassThroughObject() ).toBeA( collect.PassThrough );
	} );

	it( 'is a PassThrough stream', function( ) {	
		expect( new collect.PassThroughObject() ).toBeA( PassThrough );
	} );

	it( 'is can be instigated without new', function( ) {	
		expect( collect.PassThroughObject() ).toBeA( PassThrough );
	} );

	it( 'collect.objectStream is a collect.PassThroughStream', function( ) {	
		expect( collect.objectStream ).toBe( collect.PassThroughObject );
	} );

	it( 'creates a PassThrough instance with objectMode on', function( ) {	
		var objectStream = collect.objectStream();

		expect( objectStream._readableState.objectMode ).toBe( true );
		expect( objectStream._writableState.objectMode ).toBe( true );
	} );

	it( 'collects as an object stream', function() {	
		
		var stream = new collect.PassThrough( {objectMode: true });
		var ob1 = {};
		var ob2 = {};
		stream.write( ob1 );
		stream.end( ob2 );

		return stream.pipe( collect.objectStream() )	
			.then( function(data) {
				expect( data[0] ).toBe(ob1);
				expect( data[1] ).toBe(ob2);

			} );
	} );


} );


describe( 'collect', function() {

	it( 'collects using a callback', function(done) {
		
		var stream = new PassThrough();

		collect( stream, function( data ) {
			expect( Buffer.isBuffer(data) ).toBe(true);
			expect( data.toString() ).toBe( completeData );
			done();
		} );
	
		stream.write(testDataPart1);
		stream.end(testDataPart2);

	} );

	it( 'collects using a specified encoding', function(done) {
		
		var stream = new PassThrough();

		collect( stream, 'hex', function( data ) {
			expect( typeof data ).toBe('string');
			expect( new Buffer(data,'hex').toString() ).toBe( completeData );
			done();
		} );
	
		stream.write(testDataPart1);
		stream.end(testDataPart2);

	} );

	it( 'collects using a promise', function() {
		

		var stream = new PassThrough();

		var ret = collect(stream)
			.then( function(data) {
				expect( Buffer.isBuffer(data) ).toBe(true);
				expect( data.toString() ).toBe( completeData );
			} );
	
		stream.write(testDataPart1);
		stream.end(testDataPart2);

		return ret;

	} );

	it( 'collects object data', function() {

		var stream = new PassThrough( {objectMode: true});

		var ret = collect(stream);
		
		stream.write(1);
		stream.write(2);
		stream.end(3);

		return ret
			.then( function(data) {
				expect( Array.isArray(data) ).toBe(true);
				expect( data ).toEqual( [1,2,3] );
			} );

	} );

} );