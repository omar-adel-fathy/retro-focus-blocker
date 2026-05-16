# Security Policy

Retro Focus Blocker is a Chrome extension that helps users block distracting websites during focus sessions.

Because the extension may interact with browser permissions, website blocking, local storage, notifications, audio, and optional camera access, security and privacy reports are welcome.

## Supported Versions

Security updates are currently considered for the latest public version of the project.

| Version | Supported |
|---|---|
| 1.x | Yes |
| Older versions | No |

## Reporting a Vulnerability

Please report security issues responsibly.

If you find a vulnerability, open a GitHub issue only if the issue does not expose sensitive exploit details.

For sensitive reports, contact the maintainer privately if contact information is available on the repository profile.

When reporting, include:

- A clear description of the issue
- Steps to reproduce
- Affected files or features
- Browser and operating system
- Potential impact
- Suggested fix, if known

## Security Areas of Interest

Important areas include:

- Chrome extension permissions
- Declarative Net Request rules
- Blocked-site matching behavior
- Local storage handling
- Optional camera-based Presence Guard
- Notification behavior
- Audio alert behavior
- Any future cloud sync or account features

## Privacy-Sensitive Issues

Please report any behavior that could cause:

- Camera frames to be uploaded unexpectedly
- Blocked-site lists to leave the device unexpectedly
- User settings to be exposed
- Focus session data to be leaked
- Unwanted tracking or analytics
- Overly broad host permissions
- Unsafe third-party scripts or dependencies

## Extension Permissions

Contributors should keep permissions as narrow as possible.

Do not add broad permissions unless they are necessary for the extension to work.

Avoid permissions that collect more data than needed.

## Dependency Policy

This project should remain lightweight.

Avoid unnecessary dependencies.

Do not add third-party tracking scripts, analytics SDKs, or remote code execution patterns.

## Camera Safety

Presence Guard must remain optional.

Camera access should only be requested when the user chooses to use Presence Guard.

Camera data should be processed locally by default.

Do not store, upload, or share camera frames unless a future version clearly discloses this and receives user consent.

## Responsible Disclosure

Please give maintainers reasonable time to review and fix reported issues before public disclosure.

## Disclaimer

Retro Focus Blocker is a browser extension. It is not a full security product, parental control system, school monitoring system, or operating-system-level lockdown tool.
