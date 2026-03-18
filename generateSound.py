# Generate a short metallic spring recoil / stop sound for a mechanical dial
import math, wave, struct, random
from playsound3 import playsound

sample_rate = 44100

def write_wav(path, samples):
    with wave.open(path, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        frames = b"".join(struct.pack("<h", max(-32767, min(32767, int(s)))) for s in samples)
        wf.writeframes(frames)

duration = 0.25
samples = []

for i in range(int(sample_rate * duration)):
    t = i / sample_rate
    
    f1 = 10
    f2 = 30
    f3 = 40
    
    val = (
        1.6 * math.sin(f1 * t*2*math.pi) +
        0.6 * math.sin(f2 * t*2*math.pi) +
        0.3 * math.sin(f3 * t*2*math.pi)
    )
    
    attack = min(1, t * 120)
    decay = math.exp(-4.5 * t)
    env = attack * decay
    
    noise = (random.random() - 0.5) * 0.3 * math.exp(-20*t)
    
    samples.append((val + noise) * env * 20000)

path = "./sound.wav"
write_wav(path, samples)
playsound(path)