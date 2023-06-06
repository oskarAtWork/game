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

for note, timestamp in sh_timestamps:
    # print(f" [{note-42}, {int(timestamp)}], ")
    sh_attack_times.append([note-42, int(timestamp)])
print(f"sh_attack_times = {sh_attack_times}")

for note, timestamp in ba_timestamps:
    ba_attack_times.append([note-42, int(timestamp)])
print(f"ba_attack_times = {ba_attack_times}")

for note, timestamp in ko_timestamps:
    ko_attack_times.append([note-42, int(timestamp)])
print(f"ko_attack_times = {ko_attack_times}")

for note, timestamp in tb_timestamps:
    tb_attack_times.append([note-42, int(timestamp)])
print(f"tb_attack_times = {tb_attack_times}")