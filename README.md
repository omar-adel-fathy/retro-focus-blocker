# Retro Focus Blocker v1.2

Retro Chrome extension for study discipline.

## v1.2 guard update

The camera guard was rebuilt because basic face detection fails when you tilt your head or move slightly.

New guard logic:

- Face detection when supported
- Body/scene calibration
- Motion fallback
- Last-seen grace period
- Loud looping siren inside the guard page
- “I’m here / recalibrate” button
- “Siren even without focus timer” setting
- Missing-seconds threshold setting

## Install

1. Unzip the folder.
2. Open `chrome://extensions`.
3. Enable Developer Mode.
4. Click **Load unpacked**.
5. Select the `retro_focus_blocker_v1_2` folder.

## Important limits

Chrome extensions cannot stop you from closing Chrome, muting your OS, or shutting down the laptop.
For that, this would need a native desktop app.
