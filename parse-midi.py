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
timestamps = get_note_timestamps('./assets/bird_attack_music/sh_attack.mid')

for note, timestamp in timestamps:
    print(f" [{note-42}, {int(timestamp)}], ")