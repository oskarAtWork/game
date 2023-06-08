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

attack_times = []

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
    
    raise Exception(f"Oh no, chromatic note {chromatic} outside bounds")


for note, timestamp in sh_timestamps:
    attack_times.append({
        "note": toDiatonic(note-43),
        "ms": int(timestamp),
        "bird": "silkeshäger"
    })

for note, timestamp in ba_timestamps:
    attack_times.append({
        "note": toDiatonic(note-55),
        "ms": int(timestamp),
        "bird": "biatare"
    })

for note, timestamp in ko_timestamps:
    attack_times.append({
        "note": toDiatonic(note-67),
        "ms": int(timestamp),
        "bird": "k?"
    })

for note, timestamp in tb_timestamps:
    attack_times.append({
        "note": toDiatonic(note-67),
        "ms": int(timestamp),
        "bird": "tajga"
    })

def print_list(ls):
    def print_entry(entry):
        output = "{\n"
        output += "\t\tnote: " + str(entry['note']) + ",\n"
        output += "\t\tms: " + str(entry['ms']) + ",\n"
        output += "\t\tbird: '" + str(entry['bird']) + "'\n"
        output += "\t}"
        return output


    abc = [print_entry(x) for x in ls]

    return "[" + ", ".join(abc) + "\n]"


type = "{note: number, ms: number, bird: BirdType}"

txt = f"""export type BirdType = 'biatare' | 'silkeshäger' | 'k?' | 'tajga';
export type OpponentSong = {type}[];

export const attack_times = {print_list(attack_times)} satisfies OpponentSong;

"""

with open('./src/new-songs/base.ts', 'w') as f:
    f.write(txt)