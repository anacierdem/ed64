#include <stdio.h>
#include <malloc.h>
#include <string.h>
#include <stdint.h>

#include <libdragon.h>

#include "everdrive.h"

static resolution_t res = RESOLUTION_320x240;
static bitdepth_t bit = DEPTH_32_BPP;

int main(void)
{
    init_interrupts();

    display_init( res, bit, 2, GAMMA_NONE, ANTIALIAS_RESAMPLE );
    console_init();
    console_set_render_mode(RENDER_MANUAL);

    everdrive_init();

    char dest[512] = "Test\n";

    console_clear();
    int i = 0;
    while(1)
    {
        printf("Test: %i\n", i);
        i=i+1;
        handle_usb();
        everdrive_fifo_write_buffer(&dest, 1);
        console_render();
    }
}
