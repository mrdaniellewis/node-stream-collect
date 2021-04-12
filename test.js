/* eslint-env node, jest */

'use strict';

const fs = require('fs');
const path = require('path');
const { PassThrough } = require('stream');
const collect = require('.');

const testDataPart1 = 'Some data to ';
const testDataPart2 = 'go into the stream';
const completeData = 'Some data to go into the stream';

describe('collect.Collect', () => {
  describe('collect event', () => {
    it('collects buffer data', (done) => {
      const stream = new collect.Collect()
        .on('collect', (data) => {
          expect(Buffer.isBuffer(data)).toBe(true);
          expect(data.toString()).toBe(completeData);
          done();
        });

      stream.write(testDataPart1);
      stream.end(testDataPart2);
    });

    it('collects string data', (done) => {
      const stream = new collect.Collect({ encoding: 'utf8' })
        .on('collect', (data) => {
          expect(typeof data).toBe('string');
          expect(data).toBe(completeData);
          done();
        });

      stream.write(testDataPart1);
      stream.end(testDataPart2);
    });

    it('handles encoding correctly with string data', (done) => {
      const stream = new collect.Collect({ encoding: 'base64' })
        .on('collect', (data) => {
          expect(typeof data).toBe('string');
          expect(Buffer.from(data, 'base64').toString()).toBe(completeData);
          done();
        });

      stream.write(testDataPart1);
      stream.end(testDataPart2);
    });

    it('collects object data', (done) => {
      const stream = new collect.Collect({ objectMode: true })
        .on('collect', (data) => {
          expect(Array.isArray(data)).toBe(true);
          expect(data).toEqual([1, 2, 3]);
          done();
        });

      stream.write(1);
      stream.write(2);
      stream.end(3);
    });

    it('collects a big file', (done) => {
      const file = path.resolve(__dirname, 'the-machine-stops.txt');
      const fileContents = fs.readFileSync(
        file,
        { encoding: 'utf8' },
      );

      const stream = new collect.Collect({ encoding: 'utf8' })
        .on('collect', (data) => {
          expect(data).toBe(fileContents);
          done();
        });

      fs.createReadStream(file, { encoding: 'utf8' })
        .pipe(stream);
    });

    it('can handle having two collect listeners', (done) => {
      const stream = new collect.Collect()
        .on('collect', (data) => {
          // This one will be called first
          expect(Buffer.isBuffer(data)).toBe(true);
          expect(data.toString()).toBe(completeData);
        })
        .on('collect', (data) => {
          // Then this one
          expect(Buffer.isBuffer(data)).toBe(true);
          expect(data.toString()).toBe(completeData);
          done();
        });

      stream.write(testDataPart1);
      stream.end(testDataPart2);
    });
  });

  describe('#collect', () => {
    it('returns a promise resolving to the data', () => {
      const stream = new collect.Collect();
      stream.write(testDataPart1);
      stream.end(testDataPart2);

      return stream.collect((data) => {
        expect(Buffer.isBuffer(data)).toBe(true);
        expect(data.toString()).toBe(completeData);
      });
    });

    it('returns the same promise for subsequent calls', () => {
      const stream = new collect.Collect();
      stream.write(testDataPart1);
      stream.end(testDataPart2);

      expect(stream.collect()).toEqual(stream.collect());
    });

    it('rejects if the stream errors', () => {
      const stream = new collect.Collect();
      const error = new Error('foo');

      stream.write('foobar');

      const promise = stream.collect();
      stream.emit('error', error);

      return promise
        .then(() => { throw new Error('Should not have been called'); })
        .catch((e) => expect(e).toBe(error));
    });
  });

  describe('#then (deprecated)', () => {
    it('returns a promise resolving to the data', () => {
      const stream = new collect.Collect();
      stream.write(testDataPart1);
      stream.end(testDataPart2);

      return stream.then((data) => {
        expect(Buffer.isBuffer(data)).toBe(true);
        expect(data.toString()).toBe(completeData);
      });
    });

    it('rejects if the stream errors', () => {
      const stream = new collect.Collect();
      const error = new Error('foo');

      stream.write('foobar');

      const promise = stream
        .then(
          () => { throw new Error('Should not have been called'); },
          (e) => expect(e).toBe(error),
        );

      stream.emit('error', error);

      return promise;
    });
  });

  describe('#catch (deprecated)', () => {
    it('rejects if the stream errors', () => {
      const stream = new collect.Collect();
      const error = new Error('foo');

      stream.write('foobar');

      const promise = stream
        .catch((e) => expect(e).toBe(error));

      stream.emit('error', error);

      return promise;
    });
  });
});

describe('collect.PassThrough (deprecated)', () => {
  it('creates a collect stream', () => {
    expect(collect.PassThrough()).toBeInstanceOf(collect.Collect);
  });

  it('creates a collect stream when used with new', () => {
    expect(new collect.PassThrough()).toBeInstanceOf(collect.Collect);
  });
});

describe('collect.stream (deprecated)', () => {
  it('creates a collect stream', () => {
    expect(collect.stream()).toBeInstanceOf(collect.Collect);
  });
});

describe('collect.CollectObjects', () => {
  it('collects as an object stream', () => {
    const stream = new collect.CollectObjects();
    const ob1 = {};
    const ob2 = {};
    stream.write(ob1);
    stream.end(ob2);

    return stream.collect()
      .then((data) => {
        expect(data[0]).toBe(ob1);
        expect(data[1]).toBe(ob2);
      });
  });
});

describe('collect.PassThroughObject (deprecated)', () => {
  it('creates a collectobjects stream', () => {
    expect(collect.PassThroughObject()).toBeInstanceOf(collect.CollectObjects);
  });

  it('creates a collect stream when used with new', () => {
    expect(new collect.PassThroughObject()).toBeInstanceOf(collect.CollectObjects);
  });
});

describe('collect.objectStream (deprecated)', () => {
  it('creates a collectobjects stream', () => {
    expect(collect.objectStream()).toBeInstanceOf(collect.CollectObjects);
  });
});

describe('collect', () => {
  it('collects using a callback', (done) => {
    const stream = new PassThrough();

    collect(stream, (error, data) => {
      expect(Buffer.isBuffer(data)).toBe(true);
      expect(data.toString()).toBe(completeData);
      done();
    });

    stream.write(testDataPart1);
    stream.end(testDataPart2);
  });

  it('collects using a specified encoding', (done) => {
    const stream = new PassThrough();

    collect(stream, 'hex', (error, data) => {
      expect(typeof data).toBe('string');
      expect(Buffer.from(data, 'hex').toString()).toBe(completeData);
      done();
    });

    stream.write(testDataPart1);
    stream.end(testDataPart2);
  });

  it('collects using a promise', () => {
    const stream = new PassThrough();

    const ret = collect(stream)
      .then((data) => {
        expect(Buffer.isBuffer(data)).toBe(true);
        expect(data.toString()).toBe(completeData);
      });

    stream.write(testDataPart1);
    stream.end(testDataPart2);

    return ret;
  });

  it('collects object data', () => {
    const stream = new PassThrough({ objectMode: true });

    const ret = collect(stream);

    stream.write(1);
    stream.write(2);
    stream.end(3);

    return ret
      .then((data) => {
        expect(Array.isArray(data)).toBe(true);
        expect(data).toEqual([1, 2, 3]);
      });
  });
});

describe('collect.addToStream', () => {
  it('augments a stream with the collect event', (done) => {
    const stream = new PassThrough();
    expect(collect.addToStream(stream)).toEqual(stream);

    stream
      .on('collect', (data) => {
        expect(data.toString()).toBe(completeData);
        done();
      });

    stream.write(testDataPart1);
    stream.end(testDataPart2);
  });
});
