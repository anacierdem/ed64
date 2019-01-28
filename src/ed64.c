#include <stdio.h>
#include <malloc.h>
#include <string.h>
#include <stdint.h>

#include <libdragon.h>

#include "everdrive.h"

extern void _start();

int main(void)
{
    long int count = 0;

    resolution_t res = RESOLUTION_320x240;
    bitdepth_t bit = DEPTH_32_BPP;

    init_interrupts();

    display_close();
    display_init( res, bit, 2, GAMMA_NONE, ANTIALIAS_RESAMPLE );

    everdrive_init(true);

    while(1)
    {
        printf("Test counter: %lu\n", count++);

        // Wait to limit data
        unsigned long stop = 100 + get_ticks_ms();
        while( stop > get_ticks_ms() );

        handle_everdrive();
    }
}
