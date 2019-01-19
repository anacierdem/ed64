#include <libdragon.h>
#include <dma.h>
#include <stdio.h>
#include <n64sys.h>
#include <string.h>

#include "everdrive.h"

#define EVERDRIVE_STATE_DMA_BUSY 0
#define EVERDRIVE_STATE_RECEIVE 3

static volatile struct ED_regs_s * const ED_regs = (struct ED_regs_s *)0xA8040000;

void send_ack();
void fill_buffer();
void transfer_rom(bool is_read);

unsigned long long usb_buffer[128];
char *usb_char_buffer;

extern void _start();

void everdrive_dma_read(unsigned long ram_buff_addr, unsigned short blocks) {
    ED_regs->configuration;
    ED_regs->length = (blocks - 1);
    ED_regs->configuration;
    ED_regs->ram_address = ram_buff_addr;
    ED_regs->configuration;
    ED_regs->direction = EVERDRIVE_FROM_CART;
    while (everdrive_dma_busy());
}

void everdrive_dma_write(unsigned long ram_buff_addr, unsigned short blocks) {
    ED_regs->configuration;
    ED_regs->length = (blocks - 1);
    ED_regs->configuration;
    ED_regs->ram_address = ram_buff_addr;
    ED_regs->configuration;
    ED_regs->direction = EVERDRIVE_TO_CART;
    while (everdrive_dma_busy());
}

void everdrive_init() {
    ED_regs->configuration;
    ED_regs->message = 0;
    ED_regs->configuration;
    ED_regs->key = 0x1234;
    ED_regs->configuration;
    ED_regs->configuration = 1; // SD RAM on
}

unsigned char everdrive_receiving() {
    return (ED_regs->status >> EVERDRIVE_STATE_RECEIVE) & 1;
}

unsigned char everdrive_dma_busy() {
    return (ED_regs->status >> EVERDRIVE_STATE_DMA_BUSY) & 1;
}

void everdrive_fifo_read_buffer(void *buff, unsigned short blocks) {
    unsigned long len = blocks * 512;
    unsigned long ram_buff_addr = DMA_BUFF_ADDR / 2048;

    // First write to cart
    everdrive_dma_write(ram_buff_addr, blocks);

    // Then read to mem
    unsigned long pi_address = (0xb0000000 + ram_buff_addr * 2048);
    dma_read(buff, pi_address, len);
    while (dma_busy());
    data_cache_hit_invalidate(buff, len);
}

void everdrive_fifo_write_buffer(void *buff, unsigned short blocks) {
    unsigned long len = blocks * 512;
    unsigned long ram_buff_addr = DMA_BUFF_ADDR / 2048;
    data_cache_hit_writeback_invalidate(buff, len);
    dma_write(buff, (0xb0000000 + ram_buff_addr * 1024 * 2), len);
    everdrive_dma_read(ram_buff_addr, blocks);
}

void handle_usb() {
    usb_char_buffer = (volatile unsigned char *) usb_buffer;

    if (everdrive_receiving())
        return;

    everdrive_fifo_read_buffer(usb_buffer, 1);

    if (strncmp("CMD", usb_char_buffer, 3) != 0)
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
            transfer_rom(false);
            break;
        case 'S':
            disable_interrupts();
            _start();
            break;
    }
}

void send_ack() {
    strncpy(usb_char_buffer, "RSPk", 4);
    everdrive_fifo_write_buffer(usb_buffer, 1);
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
