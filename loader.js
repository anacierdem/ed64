#!/usr/bin/env node

const { withPad, bin2String, cleanBinary } = require('./loader/utils');
const {
  prepareCommand,
  prepareReadCommand,
  prepareWriteCommand,
  commands,
} = require('./loader/commands');

const SerialPort = require('serialport');
var fs = require('fs');
var net = require('net');

const ACK = 'RSPk';
const TIMEOUT = 1000;
const MEG = 1024 * 1024;
const STATUS_UPDATE_AT = MEG;
const MEG_32 = 32 * MEG;

const ackError = new Error('Acknowledge timeout.');

const ports = SerialPort.list();

function acknowledge(port) {
  return new Promise((resolve, reject) => {
    const portTimeout = setTimeout(() => {
      reject(ackError);
      port.close();
    }, TIMEOUT);

    function wait(data) {
      const response = bin2String(data);
      if (response.indexOf(ACK) > -1) {
        clearTimeout(portTimeout);
        port.removeListener('data', wait);
        resolve(true);
      }
    }

    port.on('data', wait);
  });
}

function writeToPort(port, data) {
  return new Promise((resolve, reject) => {
    port.write(data, (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

async function sendCommand(port, command, waitAck = true) {
  await writeToPort(port, command);
  if (waitAck) {
    return await acknowledge(port);
  } else {
    return true;
  }
}

async function sendData(port, data) {
  console.log('Sending...');
  const size = data.byteLength;

  async function writeNext(offset) {
    const sizeInMeg = (size / MEG).toPrecision(2);
    if (offset >= size) {
      console.log(`Written ${size} bytes. Booting...`);
      await sendCommand(port, prepareCommand(commands.BOOT), false);
    } else {
      const currentMeg = (offset / MEG).toPrecision(2);
      if (sizeInMeg !== currentMeg) {
        console.log('Writing at', `${currentMeg} Mb/${sizeInMeg} Mb`);
      }
      const bytesToWrite = Math.min(size - offset, STATUS_UPDATE_AT);
      const partial = Buffer.from(data.buffer, offset, bytesToWrite);

      if (offset === MEG_32) {
        console.log('Next 32m');
        await sendCommand(port, prepareWriteCommand(size - MEG_32, 64), false);
      }

      await writeToPort(port, withPad(partial, 512));
      await writeNext(offset + bytesToWrite);
    }
  }

  await sendCommand(port, prepareWriteCommand(Math.min(MEG_32, size)), false);
  await writeNext(0);
}

async function prepare(port, contents) {
  if (contents.byteLength < 2097152) {
    try {
      await sendCommand(port, prepareCommand(commands.FILL));
      console.log('Fill success!');
      await sendData(port, contents);
    } catch (e) {
      console.error('Fill error!');
    }
  } else {
    await sendData(port, contents);
  }
}

function startListening(port, socketPort) {
  var server = net.createServer(function (socket) {
    port.on('data', (d) => {
      console.log('N64:', bin2String(d));
      socket.write(cleanBinary(d));
    });
    socket.on('data', (d) => {
      console.log('Remote:', bin2String(d));
      // ed64 can only work with data of multiples of 16bit
      // If the buffer is filled with an odd bytes and DMA timeout
      // triggers, last byte vanishes.
      port.write(withPad(d, 2));
    });
  });

  port.on('data', (d) => {
    process.stdout.write(cleanBinary(d));
  });

  server.listen(socketPort, '127.0.0.1');
}

function findPortAndUpload(options) {
  const { fileName, keepAlive, read } = options;
  // Enumarate ports and invoke sendData
  ports.then((ports) => {
    ports.forEach(async ({ path }) => {
      const port = new SerialPort(path, {
        baudRate: 9600,
      });

      // Open errors will be emitted as an error event
      port.on('error', function (err) {
        console.log('Error: ', err.message);
      });

      try {
        await sendCommand(port, prepareCommand(commands.TEST));
        console.log('Found ED64 on', path);

        if (read) {
          startListening(port, options.port);
          await sendCommand(port, prepareReadCommand(2097152));
        } else {
          fs.readFile(fileName, async function (err, contents) {
            if (err) {
              console.log('Error reading file: ', err.message);
            }
            await prepare(port, contents);
            if (keepAlive) {
              startListening(port, options.port);
            } else {
              port.close();
            }
          });
        }
      } catch (e) {
        if (e !== ackError) console.log(e.message);
      }
    });
  });
}

const options = {
  fileName: process.argv[2],
  keepAlive: false,
  read: false,
  port: 1337,
};

process.argv.forEach(function (val, index, array) {
  if (val.indexOf('--server-port=') === 0) {
    options.port = parseInt(val.replace('--server-port=', ''));
  }
  switch (val) {
    case '--keep-alive':
      options.keepAlive = true;
      break;
    case '--read':
      options.read = true;
      break;
  }
});

findPortAndUpload(options);
