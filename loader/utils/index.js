function withPad(input, boundary, padWith = 0) {
  if (input.length % boundary !== 0) {
    const padded = Buffer.alloc(
      Math.ceil(input.length / boundary) * boundary,
      padWith
    );
    input.copy(padded, 0, 0);
    return padded;
  } else {
    return input;
  }
}
module.exports = {
  withPad,
};
