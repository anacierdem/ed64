#include <stdio.h>
#include <malloc.h>
#include <string.h>
#include <stdint.h>

#include <libdragon.h>

int main(void)
{
    init_interrupts();

    debug_init_usblog();

    while (1)
    {
        debugf("Hello world!\n");
        unsigned long stop = 100 + get_ticks_ms();
        while (stop > get_ticks_ms());
    }
}
