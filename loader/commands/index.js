const commands = {
  TEST: 't',
  ROM_START: 's',
  ROM_WRITE: 'W',
  ROM_READ: 'R',
  ROM_FILL: 'c',
  RAM_READ: 'r',
  FPGA_WRITE: 'f',
};

// Make sure to write 512 bytes of data to fill buffer on ed64
function prepareCommand(command, address = 0, length = 0, argument = 0) {
  const buffer = Buffer.alloc(16);
  Buffer.from('cmd', 'ascii').copy(buffer, 0, 0);
  buffer[3] = command.charCodeAt(0);
  buffer.writeUInt32BE(address, 4);
  buffer.writeUInt32BE(length / 512, 8);
  buffer.writeUInt32BE(argument, 12);
  return buffer;
}

module.exports = {
  commands,
  prepareCommand,
};
