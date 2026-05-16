# Retro Focus Blocker v1.2.0

A retro-style Chrome extension that helps students, coders, and builders stay locked in during deep work sessions.

It blocks distracting websites during timed focus sessions, suggests rest breaks when the session ends, supports controlled short breaks, and includes an optional camera-based Presence Guard for extra accountability.

> Built for studying, exams, coding sessions, deep work, and anyone who keeps losing time to social apps.

---

## Demo

|                                                                                                                                                |                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| <img width="345" alt="Retro Focus Blocker demo image" src="https://github.com/user-attachments/assets/ad85be94-c0c0-46ad-9acd-d84c33b3f3c4" /> | <img width="345" alt="Retro Focus Blocker demo image" src="https://github.com/user-attachments/assets/81450729-a59c-4bf7-9cc0-ffe41146c15d" /> |
| <img width="345" alt="Retro Focus Blocker demo image" src="https://github.com/user-attachments/assets/7b509aa9-ea58-498a-874d-70fdf3c784fa" /> | <img width="345" alt="Retro Focus Blocker demo image" src="https://github.com/user-attachments/assets/e3ace5cc-be06-4763-be47-5ec0828db6fc" /> |
| <img width="345" alt="Retro Focus Blocker demo image" src="https://github.com/user-attachments/assets/805ef5be-81ab-4e19-8d47-bf6a1f806769" /> | <img width="345" alt="Retro Focus Blocker demo image" src="https://github.com/user-attachments/assets/84a1b7ea-a9e7-4877-9edc-a68fec420328" /> |

---

## Install

1. Download or clone this repository.
2. Open Chrome.
3. Go to:

```text
chrome://extensions
```

4. Enable **Developer Mode**.
5. Click **Load unpacked**.
6. Select the `retro_focus_blocker_v1_2` folder.
7. Pin the extension to your Chrome toolbar.
8. Start a focus session.

---

## Quick Start

1. Click the Retro Focus Blocker icon.
2. Choose a focus session: `25m`, `50m`, `90m`, `120m`, or custom.
3. Start the session.
4. Distracting sites are blocked until the timer ends.
5. When the session finishes, take the suggested rest break.
6. Start the next focus block.

---

## Why This Exists

Most focus tools are too soft.

They either remind you gently, or they block websites without creating a full focus loop.

Retro Focus Blocker creates a simple discipline system:

1. Start a focus session.
2. Distracting sites are blocked.
3. Optional Spotify study music opens.
4. When the session ends, a rest break is suggested.
5. You take a controlled break.
6. You return to focus.
7. Optional Presence Guard helps keep you accountable.

The goal is not to create a perfect lockdown app.

The goal is to add enough friction that you stop impulsive scrolling and return to the work.

---

## Features

### Focus Timer

* 25-minute focus session
* 50-minute focus session
* 90-minute focus session
* 120-minute focus session
* Custom focus time
* Countdown timer in the popup
* Retro CRT-style interface

### Website Blocking

By default, the extension blocks common distraction sites:

* YouTube
* YouTube Studio
* Instagram
* TikTok
* LinkedIn
* Facebook
* X / Twitter
* Reddit
* Discord
* WhatsApp Web

You can edit the blocked sites list from the extension popup.

### Retro Blocked Page

When you open a blocked site during a focus session, you are redirected to a retro terminal-style blocked screen with a countdown.

### Rest System

When a focus session ends, Retro Focus Blocker opens a rest popup and suggests a break time.

| Focus Session | Suggested Rest |
| ------------- | -------------- |
| 25 minutes    | 5 minutes      |
| 50 minutes    | 10 minutes     |
| 90 minutes    | 15 minutes     |
| 120 minutes   | 20 minutes     |

You can also start a custom rest timer.

### 2-Minute Bathroom / Water Break

During a focus session, you can start a short controlled break.

Useful for:

* Bathroom
* Water
* Stretching
* Quick movement

Social sites stay blocked during this break.

### Sound Alerts

Retro Focus Blocker includes retro beep/siren-style alerts for:

* Focus complete
* Rest complete
* Presence Guard missing alert
* Manual sound test

Note: browser extensions cannot override your operating system volume or play sound if your device is muted.

### Optional Presence Guard

Presence Guard is an optional camera-based accountability window.

It can detect whether someone is present in front of the laptop using browser camera access.

Depending on browser support, it uses:

* Face detection when available
* Body / scene calibration
* Motion / presence fallback
* Last-seen grace period
* Manual recalibration

If you disappear for too long during a focus session, it can trigger an alert.

Presence Guard is optional and can be ignored if you do not want to use your camera.

### Spotify Support

Retro Focus Blocker can open a Spotify URL when a focus session starts.

Default URL:

```text
https://open.spotify.com/collection/tracks
```

You can replace it with any Spotify playlist, album, or liked songs URL.

Note: direct playback control requires Spotify API setup, OAuth, and usually Spotify Premium. This extension does not include fake account access or unsafe credentials.

---

## What This Extension Can and Cannot Do

### It can:

* Block websites during focus sessions
* Show a blocked page
* Open Spotify links
* Show notifications
* Play browser-based alerts
* Use camera permission for optional presence detection
* Add friction against distraction

### It cannot:

* Stop you from closing Chrome
* Stop you from disabling the extension
* Stop your laptop from shutting down
* Override muted device volume
* Force Spotify playback without API setup
* Fully lock your whole operating system

For true OS-level lockdown, this would need a native desktop app, not only a Chrome extension.

---

## Project Structure

```text
retro-focus-blocker/
├── manifest.json
├── background.js
├── popup.html
├── popup.css
├── popup.js
├── blocked.html
├── blocked.css
├── blocked.js
├── rest.html
├── rest.css
├── rest.js
├── presence.html
├── presence.css
├── presence.js
├── sharedAudio.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## Development

Clone the repo:

```bash
git clone https://github.com/omar-adel-fathy/retro-focus-blocker.git
cd retro-focus-blocker
```

Load it in Chrome:

```text
chrome://extensions → Developer Mode → Load unpacked → select folder
```

After editing files, reload the extension from `chrome://extensions`.

---

## Tech Stack

* Chrome Extension Manifest V3
* Vanilla JavaScript
* HTML
* CSS
* Chrome Storage API
* Chrome Alarms API
* Chrome Notifications API
* Chrome Declarative Net Request API
* Browser MediaDevices API
* Browser Audio API

No framework is required.

---

## Privacy

Retro Focus Blocker is designed to be privacy-first.

* No external database
* No analytics by default
* No tracking scripts
* No selling user data
* Settings are stored locally in Chrome storage
* Camera access is optional
* Camera access is only used for Presence Guard
* Camera frames are not uploaded anywhere

If you fork this project and add analytics, sync, or cloud features, clearly disclose that in your version.

---

## Good First Issues

Want to contribute? Here are useful starter ideas:

* Improve the retro UI
* Add more timer presets
* Improve blocked page copy
* Add import/export settings
* Add focus streak tracking
* Improve Presence Guard logic
* Add accessibility improvements
* Add Firefox support
* Add a focus history dashboard
* Add custom blocked site groups

---

## Roadmap

Possible future improvements:

* Better task system
* Focus history dashboard
* Daily streaks
* Reward points system
* Custom blocked groups
* Import/export settings
* Website allowlist
* Pomodoro presets
* Better rest recommendation logic
* Local statistics
* Optional cloud sync
* Native desktop version
* Mobile companion app
* Study group mode

---

## Open Source + SaaS Direction

This project can stay open-source while also becoming a bigger product.

Possible SaaS version:

* User accounts
* Study streaks
* Focus analytics
* Team / school dashboards
* Shared study rooms
* Accountability partners
* Parent / teacher mode
* AI study coach
* Calendar-based focus plans
* Cross-device blocking
* Native desktop app with stronger lock controls

Suggested model:

* Keep the Chrome extension open-source.
* Build paid cloud features around sync, teams, analytics, and AI coaching.
* Keep privacy and transparency as the main trust advantage.

---

## Contributing

Contributions are welcome.

Before opening a pull request:

1. Keep the extension lightweight.
2. Do not add tracking.
3. Do not add unnecessary dependencies.
4. Test the extension locally through `chrome://extensions`.
5. Keep the retro style consistent.
6. Respect user privacy.

---

## Known Limitations

* Hard Mode cannot stop users from disabling the extension.
* Audio alerts depend on browser and system volume.
* Presence Guard needs camera permission.
* Face detection support depends on the browser.
* Some websites may use alternate domains that need to be added manually.

---

## License

MIT License.

You can use, modify, fork, and distribute this project. Attribution is appreciated.

---

## Credits

Created as a personal focus experiment for students, builders, coders, and people who need stronger discipline systems.

Retro style inspired by old terminals, CRT monitors, and early computer interfaces.

---

## Disclaimer

This tool is not medical, psychological, or productivity advice.

It is a browser extension that adds friction against distraction. Use it responsibly and do not rely on it as the only system for studying, mental health, productivity, or discipline.
