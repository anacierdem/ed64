#!/usr/bin/env node

const SerialPort = require('serialport')
var fs = require('fs');

const commands = {
  TEST: 'CMDT',
  BOOT: 'CMDS',
  WRITE: 'CMDW',
  FILL: 'CMDF'
};

const ACK = 'RSPk';
const TIMEOUT = 1000;
const STATUS_UPDATE_AT = 32768;
const MEG_32 = 33554432;

const ports = SerialPort.list();

function bin2String(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(array[i]);
  }
  return result;
}

function waitAck(port, cb) {
  const portTimeout = setTimeout(() => {
    cb(false);
    port.close();
  }, TIMEOUT);

  function wait(data) {
    const response = bin2String(data);
    if (response.indexOf(ACK) > -1) {
      clearTimeout(portTimeout);
      port.removeListener('data', wait);
      cb(true);
    }
  }

  port.on('data', wait)
}

// Make sure to write 512 bytes of data to fill buffer on ed64
function prepareCommand(command) {
  const buffer = Buffer.alloc(512);
  buffer[0] = command.charCodeAt(0);
  buffer[1] = command.charCodeAt(1);
  buffer[2] = command.charCodeAt(2);
  buffer[3] = command.charCodeAt(3);
  return buffer;
}

function boot(port) {
  port.write(prepareCommand(commands.BOOT), 'ascii', () => {
    port.close();
  });
  console.log('Try boot...');
}

function prepareWriteCommand(size, offset = 0) {
  const command = prepareCommand(commands.WRITE);;
  command[4] = offset;
  command[5] = 0;
  command[6] = (size / 512) >> 8;
  command[7] = (size / 512);

  return command;
}

function sendData(port, data) {
  console.log('Sending...');
  const size = data.byteLength;

  function writeNext(offset) {
    console.log('Writing at', `${offset}/${size}`);
    if (offset >= size) {
      boot(port);
    } else {
      const partial = Buffer.from(data.buffer, offset, STATUS_UPDATE_AT);

      if (offset === MEG_32) {
        console.log('Next 32m');
        port.write(prepareWriteCommand(size - MEG_32, 64), () => {
          port.write(partial, () => {
            writeNext(offset + STATUS_UPDATE_AT)
          });
        });
      } else {
        port.write(partial, () => {
          writeNext(offset + STATUS_UPDATE_AT)
        });
      }
    }
  }

  port.write(prepareWriteCommand(size), () => {
    writeNext(0);
  });
}

function prepare(port) {
  fs.readFile(process.argv[2], function(err, contents) {
    if (err) {
      console.log('Error reading file: ', err.message);
    }
    if(contents.byteLength < 2097152) {
      port.write(prepareCommand(commands.FILL), () => {
        waitAck(port, (success) => {
          if (success) {
            console.log('Fill success!');

            sendData(port, contents);
          } else {
            console.log('Fill error!');
          }
        });
      });
    } else {
      sendData(port, contents);
    }
  });
}

// Enumarate ports and invoke sendData
ports.then((ports) => {
  ports.forEach(({ comName }) => {
    const port = new SerialPort(comName , {
      baudRate: 9600
    });

    // Open errors will be emitted as an error event
    port.on('error', function(err) {
      console.log('Error: ', err.message)
    });

    waitAck(port, (success) => {
      if (success) {
        console.log('Found ED64 on', comName);
        prepare(port);
      }
    });

    port.write(prepareCommand(commands.TEST), function(err) {
      if (err) {
        return console.log('Error on write: ', err.message)
      }
    });
  })
});

