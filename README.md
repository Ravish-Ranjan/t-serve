# T-Serve

> A lightweight, terminal-based service manager for Linux systems using systemctl.

Manage your system services with an intuitive TUI (Terminal User Interface) — no mouse needed.

[![npm version](https://img.shields.io/npm/v/@ravishranjan/t-serve)](https://www.npmjs.com/package/@ravishranjan/t-serve)
[![License: GPL-2.0](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
[![Platform: Linux](https://img.shields.io/badge/platform-linux-lightgrey)](https://github.com/Ravish-Ranjan/t-serve)

---

## Preview

```
┌─ Services ──────────────┐┌─ Status Output ────────────────────────────────┐
│ > docker                ││ docker - Docker Application Container Engine   │
│   ollama                ││ Active   : active (running) since...           │
│   ssh                   ││ Disabled : no                                  │
│                         ││ Masked   : no                                  │
│                         ││ Main PID : 1234                                │
│                         ││ Memory   : 45.2M                               │
│                         ││                                                │
│                         ││                                                │
│                         ││                                                │
│                         ││                                                │
│                         ││                                                │
│                         ││                                                │
│                         ││                                                │
│                         ││                                                │
└─────────────────────────┘└────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────────────────┐
│ [A] Add | [S] Start | [R] Restart | [X] Stop | [M] Mask | [U] UnMask      │
│ [E] Enable | [D] Disable | [Backsp/Del] Delete | [Q] Quit                 │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Installation

### Via npm (recommended)

```bash
npm install -g @ravishranjan/t-serve
```

Then run it from anywhere:

```bash
t-serve
```

### Via git (for development)

```bash
git clone https://github.com/Ravish-Ranjan/t-serve.git
cd t-serve
npm install
node index.js
```

---

## Prerequisites

- Node.js >= 16.0.0
- Linux system with systemd
- sudo privileges

---

## Features

- **Clean Terminal UI** — keyboard-driven interface built with blessed
- **Quick Service Control** — start, stop, restart with a single keypress
- **Real-time Status** — view service status, PID, and memory usage at a glance
- **Service Management** — enable, disable, mask, and unmask services
- **Custom Watch List** — add and remove services you care about
- **Secure** — password prompts for sudo operations, never stored or logged
- **Mouse-free** — efficient keyboard navigation throughout

---

## Keyboard Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| `a` | Add Service | Add a new service to your watch list |
| `s` | Start | Start the selected service |
| `r` | Restart | Restart the selected service |
| `x` | Stop | Stop the selected service |
| `e` | Enable | Enable the selected service at boot |
| `d` | Disable | Disable the selected service at boot |
| `m` | Mask | Mask the selected service |
| `u` | Unmask | Unmask the selected service |
| `Backsp` / `Del` | Delete | Remove service from watch list (with confirmation) |
| `↑` / `↓` | Navigate | Move through the service list |
| `Esc` | Cancel | Cancel input dialogs |
| `q` / `Ctrl+C` | Quit | Exit the application |

---

## How It Works

T-Serve wraps `systemctl` commands under the hood:

- **Status Display** — runs `systemctl status <service>` to fetch real-time info
- **Service Control** — executes `systemctl start/stop/restart/enable/disable/mask/unmask <service>` with sudo
- **Data Storage** — service watch list is persisted in a local `services.db` SQLite file, created automatically on first run
- **Password Security** — uses `sudo -S` to securely handle password input via stdin

---

## Security Notes

- Passwords are entered via a censored input field (shown as asterisks)
- Passwords are passed to sudo via stdin and never stored or logged
- Always verify the service name before performing destructive operations

---

## Troubleshooting

**"Command not found: systemctl"**  
T-Serve requires systemd. Make sure you're on a systemd-based distro (Ubuntu 16.04+, Debian 8+, Fedora, Arch, etc.).

**"Permission Denied"**  
Ensure you have sudo privileges and enter the correct password when prompted.

**"Service Not Found"**  
Service names must match exactly as they appear in systemd. Run the following to see all available services:
```bash
systemctl list-units --type=service
```

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

Licensed under the [GNU GPL v2.0](LICENSE).

---

## Author

**Ravish Ranjan** — [github.com/Ravish-Ranjan](https://github.com/Ravish-Ranjan)

If you find this project useful, consider giving it a ⭐ on [GitHub](https://github.com/Ravish-Ranjan/t-serve)!