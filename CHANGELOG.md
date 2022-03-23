# Change Log

## [2.0.4] - 2022-03-23

### Changed

- Update libdragon docker
- Update dependencies

## [2.0.3] - 2021-10-05

### Added

- Timeout for ROM upload. It will not wait forever if there is a comm. problem

### Changed

- Update libdragon docker

### Fixed

- Fix everdrive detection bug. Now all serial ports are properly searched
- Improve parameter handling

## [2.0.2] - 2021-09-23

### Added

- Pack and dry publish on ci

### Fixed

- Fix a bug causing the listen mode to skip logs

## [2.0.1] - 2021-09-08

### Changed

- Make libdragon a peer dependency
- Add eslint

### Fixed

- Improve actions
  - Add names
  - Add registry url
  - Also do a dry publish run
  - Add CI checks for formatter/linter

## [2.0.0] - 2021-09-07

### Changed

- Update libdragon to `9.0.0`
- Update test Makefile
- Remove ed64 library, root Makefile, reboot support, socket server and `read`
  command
- Update readme to match

### Added

- Implement simple ROM loading support for OS 3.x
- Implement UNFLoader text display support
- Automated native executable build
- Proper command line argument handling
- Progress display

## [1.2.5] - 2021-07-27

### Changed

- Update libdragon to `7.0.0`
- Update dependencies

### Fixed

- usb buffer is now 16 byte aligned

## [1.2.4] - 2021-02-07

### Changed

- Update libdragon to `6.0.1`. Fixes #21
- Update readme. Resolves #31, resolves #11
- Remove `run-s` and thus `buildLib` & `installLib` & `buildTest` npm scripts. Instead the makefile does it and it reduces docker & npm overheads.
- Directly link the test code against library output and it is now dependent on the built library. Fixes #37

## [1.2.3] - 2021-01-30

### Changed

- Update libdragon to `6.0.0`

## [1.2.2] - 2020-12-12

### Changed

- Update libdragon to `4.1.4`

### Added

- Dependabot configuration

## [1.2.1] - 2020-12-16

### Changed

- Remove broken patreon badge
- Update libdragon to `4.1.3`
- Update dependencies

## [1.2.0] - 2020-10-05

### Changed

- Update libdragon to `4.1.1`
- Update dependencies

## [1.1.1] - 2020-04-25

### Changed

- Update libdragon to `4.0.0`
- Always rebuild the test
- Properly expose everdrive methods

## [1.1.0] - 2020-04-24

### Changed

- MIT license

## [1.0.5] - 2020-04-22

### Changed

- Did code simplifications and separated some to modules. Nothing changed from the public API's perspective.

### Fixed

- Pad output buffer to nearest 2 byte to fix everdrive v3 not being able to accept odd number of bytes.

## [1.0.4] - 2020-03-25

### Changed

- Update libdragon to `3.1.0`
- Update transitive dependencies
- No need to tag for travis deploy anymore

### Fixed

- Inability to upload non-multiple of Mb ROMs - #18

### Added

- Add prettier to development dependencies.
- **Development** section added to the readme.

## [1.0.3] - 2020-02-16

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
