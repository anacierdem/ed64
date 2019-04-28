ROOTDIR = $(N64_INST)
BUILD_PATH = $(CURDIR)/build
SOURCE_PATH = $(CURDIR)/src
INCLUDE_PATH = $(CURDIR)/include

CFLAGS = -std=gnu99 -O2 -G0 -Wall -Werror -mtune=vr4300 -march=vr4300 -I$(INCLUDE_PATH) -I$(ROOTDIR)/mips64-elf/include
ASFLAGS = -mtune=vr4300 -march=vr4300
N64PREFIX = $(N64_INST)/bin/mips64-elf-
INSTALLDIR = $(N64_INST)
CC = $(N64PREFIX)gcc
AS = $(N64PREFIX)as
LD = $(N64PREFIX)ld
AR = $(N64PREFIX)ar

all: libed64

libed64: $(BUILD_PATH)/libed64.a

$(BUILD_PATH)/libed64.a: $(BUILD_PATH)/libed64.o
	$(AR) -rcs -o $(BUILD_PATH)/libed64.a $(BUILD_PATH)/libed64.o

$(BUILD_PATH)/libed64.o: $(SOURCE_PATH)/libed64.c
	mkdir -p $(BUILD_PATH)
	$(CC) $(CFLAGS) -c -o $(BUILD_PATH)/libed64.o $(SOURCE_PATH)/libed64.c

install:
	install -m 0644 $(BUILD_PATH)/libed64.a $(INSTALLDIR)/mips64-elf/lib/libed64.a
	install -m 0644 $(INCLUDE_PATH)/libed64.h $(INSTALLDIR)/mips64-elf/include/libed64.h

test:
	make -C test

.PHONY: clean

clean:
	rm -rf $(BUILD_PATH)/*
