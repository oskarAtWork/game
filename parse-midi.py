import mido


def get_note_timestamps(midi_file):
    mid = mido.MidiFile(midi_file)

    note_timestamps = []

    time = 0
    for msg in mid:
        time += msg.time

        if msg.type == 'note_on':
            note_timestamps.append((msg.note, time * 1000))

    return note_timestamps


# Usage example
sh_timestamps = get_note_timestamps('./assets/bird_attack_music/sh_attack.mid')
ba_timestamps = get_note_timestamps('./assets/bird_attack_music/ba_attack.mid')
tb_timestamps = get_note_timestamps('./assets/bird_attack_music/tb_attack.mid')
ko_timestamps = get_note_timestamps('./assets/bird_attack_music/ko_attack.mid')

sh_attack_times = []
ba_attack_times = []
tb_attack_times = []
ko_attack_times = []

name =""

def toDiatonic(chromatic):
    """
    0  G
    1  G#
    2  A
    3  A#
    4  B
    5  C
    6  C#
    7  D
    8  D#
    9  E
    10 F
    11 F#
    12 G
    """

    if chromatic == 0:
        return 0 # G
    if chromatic == 1 or chromatic == 2:
        return 1 # Ab och A -> A
    if chromatic == 3 or chromatic == 4:
        return 2 # Bb och B -> B
    if chromatic == 5 or chromatic == 6:
        return 3 #C och C#
    if chromatic == 7:
        return 4 #D
    if chromatic == 8 or chromatic == 9:
        return 6 #Eb och E
    if chromatic == 10 or chromatic == 11:
        return 7 #F och F#
    if chromatic == 12:
        return 8 #G
    
    raise Exception(f"Oh no, {name} chromatic note {chromatic} outside bounds")



for note, timestamp in sh_timestamps:
    name="sh"
    sh_attack_times.append([toDiatonic(note-43), int(timestamp)])

for note, timestamp in ba_timestamps:
    name ="ba"
    ba_attack_times.append([toDiatonic(note-55), int(timestamp)])

for note, timestamp in ko_timestamps:
    name ="ko"
    ko_attack_times.append([toDiatonic(note-67), int(timestamp)])

for note, timestamp in tb_timestamps:
    name="tb"
    tb_attack_times.append([toDiatonic(note-67), int(timestamp)])

txt = f"""export type OpponentSong = [number, number][];

export const sh_attack_times = {sh_attack_times} satisfies OpponentSong;
export const ba_attack_times = {ba_attack_times} satisfies OpponentSong;
export const ko_attack_times = {ko_attack_times} satisfies OpponentSong;
export const tb_attack_times = {tb_attack_times} satisfies OpponentSong;
"""

with open('./src/new-songs/base.ts', 'w') as f:
    f.write(txt)