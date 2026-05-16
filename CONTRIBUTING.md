# Contributing to Retro Focus Blocker

Thanks for your interest in contributing to Retro Focus Blocker.

This project is a lightweight, privacy-first Chrome extension for helping students, coders, and builders stay focused during deep work sessions.

## Project Goals

Retro Focus Blocker should stay:

- Lightweight
- Privacy-first
- Easy to install locally
- Simple to understand
- Useful for real focus sessions
- Consistent with the retro CRT-style interface

Please avoid adding unnecessary dependencies, tracking, or complex systems unless they clearly improve the project.

## Good First Contributions

Good starter ideas:

- Improve the retro UI
- Add more timer presets
- Improve blocked page copy
- Add import/export settings
- Add focus streak tracking
- Improve accessibility and keyboard navigation
- Improve Presence Guard logic
- Add Firefox support
- Add more blocked-site presets
- Improve README screenshots or demo GIFs

## Local Development

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/retro-focus-blocker.git
cd retro-focus-blocker
```

2. Open Chrome and go to:

```text
chrome://extensions
```

3. Enable **Developer Mode**.

4. Click **Load unpacked**.

5. Select the project folder.

6. After editing files, reload the extension from `chrome://extensions`.

## Pull Request Guidelines

Before opening a pull request:

1. Test the extension locally.
2. Keep the extension lightweight.
3. Do not add tracking scripts or analytics by default.
4. Do not upload camera frames, browsing data, or user settings to any server.
5. Keep the retro visual style consistent.
6. Use clear commit messages.
7. Explain what changed and why.
8. Include screenshots or a short demo when changing UI.

## Privacy Rules

Because this extension includes optional camera-based Presence Guard, privacy is extremely important.

Do not add code that:

- Uploads camera frames
- Tracks users across websites
- Sends blocked-site data to a server
- Adds analytics without clear disclosure
- Collects personal data without consent
- Stores sensitive data unnecessarily

If a contribution changes data handling, update `PRIVACY.md`.

## Code Style

This project uses:

- Chrome Extension Manifest V3
- Vanilla JavaScript
- HTML
- CSS

No framework is required.

Keep code readable and simple. Prefer small, focused changes over large rewrites.

## Reporting Bugs

When reporting a bug, include:

- Chrome version
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots or console errors if useful

## Feature Requests

When suggesting a feature, explain:

- The problem it solves
- Who it helps
- How it fits the focus/distraction-blocking goal
- Whether it affects privacy or permissions

## Thank You

Every improvement helps make Retro Focus Blocker more useful for students, coders, and builders who want stronger focus habits.
