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

} );