#include <libdragon.h>
#include <dma.h>
#include <stdio.h>
#include <n64sys.h>
#include <string.h>
#include <system.h>

#include "libed64.h"

#define ROM_OFFSET 0xb0001000
#define ROM_CODE_LEN 0x1FFC00

static volatile ED_regs_t * const ED_regs = (ED_regs_t *)0xA8040000;

void send_ack();
void fill_buffer();
void transfer_rom(bool is_read);

volatile unsigned long long usb_buffer[128];
volatile unsigned char *usb_char_buffer;

extern void _start();

unsigned char everdrive_receive_buffer_clean() {
    ED_regs->configuration;
    return (ED_regs->status >> EVERDRIVE_STATUS_RECEIVE) & 1;
}

unsigned char everdrive_dma_busy() {
    ED_regs->configuration;
    return (ED_regs->status >> EVERDRIVE_STATUS_DMA_BUSY) & 1;
}

unsigned char everdrive_dma_timeout() {
    ED_regs->configuration;
    return (ED_regs->status >> EVERDRIVE_STATUS_DMA_TOUT) & 1;
}

unsigned char everdrive_dma_read(unsigned long ram_buff_addr, unsigned short blocks) {
    ED_regs->configuration;
    ED_regs->length = (blocks - 1);
    ED_regs->configuration;
    ED_regs->ram_address = ram_buff_addr;
    ED_regs->configuration;
    ED_regs->direction = EVERDRIVE_FROM_CART;
    while (everdrive_dma_busy());
    return everdrive_dma_timeout();
}

unsigned char everdrive_dma_write(unsigned long ram_buff_addr, unsigned short blocks) {
    ED_regs->configuration;
    ED_regs->length = (blocks - 1);
    ED_regs->configuration;
    ED_regs->ram_address = ram_buff_addr;
    ED_regs->configuration;
    ED_regs->direction = EVERDRIVE_TO_CART;
    while (everdrive_dma_busy());
    return everdrive_dma_timeout();
}

void everdrive_fifo_read_buffer(void *buff, unsigned short blocks) {
    unsigned long len = blocks * 512;

    // First write to cart
    everdrive_dma_write(DMA_BUFF_ADDR / 2048, blocks);

    // Then read to mem
    unsigned long pi_address = (0xb0000000 + DMA_BUFF_ADDR);
    dma_read(buff, pi_address, len);
    while (dma_busy());
    data_cache_hit_invalidate(buff, len);
}

unsigned char everdrive_fifo_write_buffer(void *buff, unsigned short blocks) {
    unsigned long len = blocks * 512;
    data_cache_hit_writeback_invalidate(buff, len);
    dma_write(buff, (0xb0000000 + DMA_BUFF_ADDR), len);
    while (dma_busy());
    return everdrive_dma_read(DMA_BUFF_ADDR / 2048, blocks);
}

static int __console_write(char *buf, unsigned int len)
{
    char console_buffer[512];

    if (len < 512) {
        memset(console_buffer,'\0', sizeof(console_buffer));
    } else {
        len = 512;
    }

    strncpy(console_buffer, buf, len);
    if (everdrive_fifo_write_buffer(console_buffer, 1))
        return 0;
    else
        return len;
}

static stdio_t console_calls = {
    0,
    __console_write,
    0
};

void everdrive_init(bool hook_console) {
    ED_regs->configuration;
    ED_regs->message = 0;
    ED_regs->configuration;
    ED_regs->key = 0x1234; // enable everdrive
    ED_regs->configuration;
    ED_regs->configuration = 1; // SD RAM on

    if (hook_console) hook_stdio_calls( &console_calls );
}

void handle_everdrive() {
    fflush(stdout);

    if (everdrive_receive_buffer_clean())
        return;

    usb_char_buffer = (volatile unsigned char *) usb_buffer;

    everdrive_fifo_read_buffer((void *) usb_buffer, 1);

    if (strncmp("CMD", (void *) usb_char_buffer, 3) != 0)
        return;

    switch (usb_char_buffer[3]) {
        case 'T':
            send_ack();
            break;
        case 'F':
            fill_buffer();
            break;
        case 'R':
            transfer_rom(true);
            break;
        case 'W':
            disable_interrupts();
            transfer_rom(false);
            break;
        case 'S':
            dma_read(&_start, ROM_OFFSET, ROM_CODE_LEN); // Fill up to 2 meg point from address in rom
            while (dma_busy());
            data_cache_hit_invalidate(&_start, ROM_CODE_LEN);
            inst_cache_hit_invalidate(&_start, ROM_CODE_LEN);
            _start();
            break;
    }
}

void send_ack() {
    strncpy((void *) usb_char_buffer, "RSPk", 4);
    everdrive_fifo_write_buffer((void *) usb_buffer, 1);
}

void fill_buffer() {
    unsigned long i;
    for (i = 0; i < 512; i++) {
        usb_char_buffer[i] = 0;
    }
    send_ack();
}

void transfer_rom(bool is_read) {
    unsigned short ptr;
    unsigned short len;
    unsigned long addr;
    ptr = 4;

    addr = usb_char_buffer[ptr++];
    addr <<= 8;
    addr |= usb_char_buffer[ptr++];

    len = usb_char_buffer[ptr++];
    len <<= 8;
    len |= usb_char_buffer[ptr++];

    is_read ? everdrive_dma_read(addr, len) : everdrive_dma_write(addr, len);
}
