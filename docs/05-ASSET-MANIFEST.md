# DEADLOCK: Asset Manifest (Narrative Overhaul)

## 🎨 Visual Assets (Images)

| Filename | Dimensions (px) | Format | Transparency | Composition/Angle | Description (Natural Language) | Feeling/Vibe |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `desk_nametag.png` | 512x512 | PNG | Yes (Background) | Frontal or slightly tilted. Frame visible. | A dirty, cracked mirror frame. Inside the frame, instead of a reflection, there is an ID card tucked into the corner reading "ALEX". The glass is grimy. | Uncanny, neglected, loss of identity. |
| `desk_fishbowl.png` | 512x512 | PNG | Yes (Background) | Side view of a round bowl. | A completely dry, dusty fishbowl. Scratched glass. Inside, there is a child's crude drawing of a fish taped to the back, "gasping" for water. No water, only dust. | Desolate, suffocating, mock-life. |
| `desk_coffee_matrix.png` | 512x512 | PNG | Yes (Background) | Top-down or slight angle spill. | A coffee mug knocked over. The liquid spilling out isn't brown fluid, but glowing green binary code/matrix rain that flows onto the desk surface. | Glitchy, surreal, reality-breaking. |
| `board_lung.png` | 800x600 | PNG | Yes (Background) | Medical diagram style. | A vintage anatomical diagram of human lungs. The bronchi look like rusted pipes. The word "AIR" is scribbled aggressively in red marker over them. | Clinical, rusted, desperate. |
| `board_defib.png` | 400x400 | PNG | Yes (Background) | Icon/Symbol style. | A warning symbol for high voltage or a defibrillator paddle icon. It looks like a stencil sprayed onto a wall. Gritty texture. | Dangerous, urgent, industrial. |
| `door_gasmask.png` | 1024x1024 | PNG | Yes (Window only) | Close-up (Macro) of eyes. | Seen through the small square window of the door. The reflective lenses of a gas mask. Behind the lenses, terrifyingly human eyes staring directly at the player. | Paranoia, invasion, judgement. |
| `door_light_leak.png` | 1024x1024 | PNG | Yes (Light only) | Door frame outline. | Beams of sickly yellow light piercing through the cracks of a closed door. The light looks viscous, like infection or pus entering a dark room. | Toxic, intrusive, sickening. |

---

## 🔊 Audio Assets (Sounds)

| Filename | Duration | Format | Type | Description (Natural Language) | Feeling/Vibe |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `voice_mom_goodboy.mp3` | 1-2 sec | MP3/WAV | Mono (Voice) | A mother's voice saying "Good boy..." or "Alex...". It starts warm but ends with a metallic/robotic distortion filter. | Twisted love, tragic, corrupted memory. |
| `voice_child_daddy.mp3` | 1-2 sec | MP3/WAV | Mono (Voice) | A young child screaming "Daddy!" or "Stop it!". High pitched, terrified. Sounds muffled as if from behind a heavy door. | Heartbreaking, confusing (guilt). |
| `voice_man_turnoff.mp3` | 2-3 sec | MP3/WAV | Mono (Voice) | An adult man shouting "Turn it off! It's not him!" or "Kill the power!". Desperate, angry, shouting over noise. | Urgent, hostile, reality-check. |
| `sfx_gasp_fan.mp3` | 3-4 sec | MP3/WAV | Stereo (SFX) | Starts as a sharp human intake of breath (gasp), then seamlessly crossfades into the whirring up of a high-speed CPU cooling fan. | Biomechanical horror, transformation. |
| `sfx_typing_flesh.mp3` | Loop or 10 hits | MP3/WAV | Mono (SFX) | Typing sounds, but instead of plastic clicks, it sounds like wet meat being slapped or fingers hitting raw steak. Wet, sticky impacts. | Visceral, gross, body horror. |
| `sfx_zap.mp3` | 0.5 sec | MP3/WAV | Stereo (SFX) | A sharp electrical discharge. Like a tazer or defibrillator. High frequency snap. | Painful, sudden, shocking. |

---

## 📝 Implementation Notes
- **Resolution**: All visual assets should be optimized for web (under 500KB if possible).
- **Audio Specs**: 44.1kHz, 16-bit preferred. Volumes normalized to -3dB.
- **Naming**: Please stick to the filenames exactly for easier integration.
