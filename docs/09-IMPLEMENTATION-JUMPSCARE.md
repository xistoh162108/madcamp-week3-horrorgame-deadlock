# Jumpscare Implementation Plan

We will implement 5 key jumpscares using the newly added assets.

## 1. Store & Audio Updates
### A. `audioSystem.ts`
- Preload new standalone SFX:
  - `sfx_digital_scream`
  - `sfx_breath_behind`
  - `sfx_door_slam_impact`
  - `sfx_jmpscare_sting` (Note spelling: `jmpscare`)
  - `sfx_many_whispers`

### B. `store.ts`
- Add `jumpscareState` to track:
  - `lastJumpscareTime`: Cooldown management.
  - `activeJumpscare`: ID of currently playing scare (to coordinate UI).
  - `triggeredJumpscares`: Set of IDs already seen (to prevent overuse).
- Add `triggerJumpscare(id: string)` action.

## 2. Component Updates

### A. `HallwaySection.tsx` (Door Scares)
- **Door Slam**:
  - Show `monster_hand_ignite.png` overlaid on door frame when `isDoorHeld` becomes true (if triggered).
  - Play `sfx_door_slam_impact`.
  - CSS: Rapid shake animation.
- **Inverted Face**:
  - Render `jumpscare_face_inverted.png` at top of doorway randomly during idle.
  - Play `sfx_jmpscare_sting`.

### B. `MonitorSection.tsx` (Monitor Scares)
- **Boot Glitch**:
  - When `bootTimer` starts (OFF -> BOOTING), 5% chance.
  - Show `monitor_glitch_face.png` instead of Bio-Kernel logo.
  - Play `sfx_digital_scream`.
- **Reflection**:
  - When switching ON -> OFF.
  - Show `reflection_monster_shadow.png` overlay with low opacity (30%) fading out.
  - Play `sfx_breath_behind`.

### C. `ChalkboardSection.tsx` (Environment)
- **Bloody Lung**:
  - Check logic on mount: if `sanity` low (or random), use `board_lung_bloody.png` instead of normal.
  - Silent change (psychological).

### D. `Global/Layout` (Cursor)
- **Insect Cursor**:
  - Add global CSS class `.cursor-insect`.
  - Trigger randomly during typing tasks.

## 3. Asset Mapping
| ID | Asset | Type | Note |
|---|---|---|---|
| DO_SLAM | `monster_hand_ignite.png` | Image | On trigger `startHoldingDoor` |
| DO_SLAM_SFX | `sfx_door_slam_impact.mp3` | Audio | Sync with visual |
| MN_GLITCH | `monitor_glitch_face.png` | Image | On Boot |
| MN_SCREAM | `sfx_digital_scream.mp3` | Audio | |
| MN_REFLECT | `reflection_monster_shadow.png` | Image | On Shutdown |
| MN_BREATH | `sfx_breath_behind.mp3` | Audio | |
| HL_INV_FACE | `jumpscare_face_inverted.png` | Image | Random Idle |
| HL_STING | `sfx_jmpscare_sting.mp3` | Audio | **Typo in filename** |
| BD_BLOODY | `board_lung_bloody.png` | Image | State based |
| MS_CURSOR | `cursor_insect.png` | Image | CSS based |

## 4. Execution Order
1.  **Audio System**: Register new sounds.
2.  **Store**: Add jumpscare state/actions.
3.  **UI - Hallway**: Implement Door Slam & Inverted Face.
4.  **UI - Monitor**: Implement Boot Glitch & Reflection.
5.  **UI - Other**: Board & Cursor.
