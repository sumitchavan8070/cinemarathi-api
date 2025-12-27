# Online Python compiler (interpreter) to run Python online.
# Write Python 3 code in this online editor and run it.

import time
import sys

def print_lyrics():
    lyrics = [
        "Mein ab kyun hosh mein aata nahi?",
        "Sukoon yeh dil kyun paata nahi?",
        "Kyun todun khud se jo thay waaday,",
        "Ke ab yeh ishq nibhaana nahi?",
        "Mein modun tum se jo yeh chehra,",
        "Dobara nazar milaana nahi.",
        "Yeh duniya jaanay mera dard,",
        "Tujhe yeh nazar kyun aata nahi?"
    ]

    delays = [
        0.3, 0.3, 0.4, 0.3,
        0.3, 0.3, 0.3, 0.8
    ]

    print("\n🎵 Pal Pal 🎵\n")
    time.sleep(1.2)

    for i, line in enumerate(lyrics):
        for char in line:
            sys.stdout.write(char)
            sys.stdout.flush()
            time.sleep(0.05)  # letter delay
        print()  # new line after each lyric line
        time.sleep(delays[i])

# Call the function
print_lyrics()
