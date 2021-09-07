V=1
BUILD_DIR=build
include n64.mk

src = test.c

all: test.z64

test.z64: N64_ROM_TITLE="Test Bench"
$(BUILD_DIR)/test.elf: $(src:%.c=$(BUILD_DIR)/test.o)

clean:
	rm -f $(BUILD_DIR)/* test.elf test.z64

-include $(wildcard $(BUILD_DIR)/*.d)

.PHONY: all clean
