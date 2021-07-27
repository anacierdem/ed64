# Change Log

## [1.2.5] - 2021-27-07

### Changed

- Update libdragon to `7.0.0`
- Update dependencies

### Fixed

- usb buffer is now 16 byte aligned

## [1.2.4] - 2021-07-02

### Changed

- Update libdragon to `6.0.1`. Fixes #21
- Update readme. Resolves #31, resolves #11
- Remove `run-s` and thus `buildLib` & `installLib` & `buildTest` npm scripts. Instead the makefile does it and it reduces docker & npm overheads.
- Directly link the test code against library output and it is now dependent on the built library. Fixes #37

## [1.2.3] - 2021-30-01

### Changed

- Update libdragon to `6.0.0`

## [1.2.2] - 2020-31-12

### Changed

- Update libdragon to `4.1.4`

### Added

- Dependabot configuration

## [1.2.1] - 2020-16-12

### Changed

- Remove broken patreon badge
- Update libdragon to `4.1.3`
- Update dependencies

## [1.2.0] - 2020-05-10

### Changed

- Update libdragon to `4.1.1`
- Update dependencies

## [1.1.1] - 2020-25-04

### Changed

- Update libdragon to `4.0.0`
- Always rebuild the test
- Properly expose everdrive methods

## [1.1.0] - 2020-24-04

### Changed

- MIT license

## [1.0.5] - 2020-22-04

### Changed

- Did code simplifications and separated some to modules. Nothing changed from the public API's perspective.

### Fixed

- Pad output buffer to nearest 2 byte to fix everdrive v3 not being able to accept odd number of bytes.

## [1.0.4] - 2020-25-03

### Changed

- Update libdragon to `3.1.0`
- Update transitive dependencies
- No need to tag for travis deploy anymore

### Fixed

- Inability to upload non-multiple of Mb ROMs - #18

### Added

- Add prettier to development dependencies.
- **Development** section added to the readme.

## [1.0.3] - 2020-16-02

### Changed

- Update libdragon to `3.0.0`
- Update serialport to `8.0.7`

### Fixed

- Communication was not working properly and system was getting stuck.
  - Fix `ROM_OFFSET` value.
  - Re-add `ED_regs->configuration` reads in addition to memory barriers.
  - This effectively reverts some changes from `0.2.4`.
- Prevent multiple NPM invocations for faster builds on windows.
- Remove unnecessary `everdrive_dma_busy` checks that were also introduced in `0.2.4`.

### Added

- Prettier configuration.

## [1.0.2] - 2019-07-12

### Changed

- Update libdragon to `2.0.3`

### Added

- Add support information.

## [1.0.1] - 2019-01-12

### Changed

- Updated libdragon to `2.0.2`

## [0.2.4] - 2019-09-11

### Fixed

- Add memory barriers.
- Add initial everdrive dma waits.
- Remove unused dma wait and fix ROM values.
- Properly print output of N64.
- Pipe output to stdout instead of console.log.
- Remove unnecessary register reads.

## [0.2.3] - 2019-09-11

### Fixed

- Fix a bug causing inability to upload image.

## [0.2.2] - 2019-01-11 - DEPRECATED

### Changed

- Updated libdragon. We now use the active libdragon version instead of base on CI.

## [0.2.1] - 2019-31-10 - DEPRECATED

### Changed

- Use `libdragon install` instead of download.

## [0.2.0] - 2019-31-10 - DEPRECATED

### Added

- Pipe ED64 output to a socket.
