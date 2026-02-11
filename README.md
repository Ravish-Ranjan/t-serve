# T Serve

A lightweight, terminal-based service manager for Linux systems using systemctl. Manage your system services with an intuitive TUI (Terminal User Interface).


## Features

- **Clean Terminal UI** - Beautiful, keyboard-driven interface using blessed
- **Quick Service Control** - Start, stop, restart services with simple key commands
- **Real-time Status** - View service status, PID, memory usage at a glance
- **Service Management** - Enable, disable, mask, and unmask services
- **Custom Service Lists** - Add and remove services from your watch list
- **Secure** - Password prompts for sudo operations
- **Keyboard Shortcuts** - Efficient navigation without touching the mouse

## Screenshots

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

## Installation

### Prerequisites

- Node.js >= 12.0.0
- npm or yarn
- Linux system with systemd
- sudo privileges

### Install Dependencies

```bash
npm install blessed
```

Or if using yarn:

```bash
yarn add blessed
```

### Clone Repository

```bash
git clone https://github.com/Ravish-Ranjan/t-serve.git
cd t-serve
npm install
```

## Usage

Run the application:

```bash
node index.js
```

### Keyboard Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| `a` | Add Service | Add a new service to your watch list |
| `s` | Start | Start the selected service |
| `r` | Restart | Restart the selected service |
| `x` | Stop | Stop the selected service |
| `m` | Mask | Mask the selected service |
| `u` | Unmask | Unmask the selected service |
| `e` | Enable | Enable the selected service at boot |
| `d` | Disable | Disable the selected service at boot |
| `Backsp` or `Del` | Delete | Remove service from watch list (with confirmation) |
| `↑/↓` | Navigate | Move through the service list |
| `Esc` | Cancel | Cancel input dialogs |
| `q` or `Ctrl+C` | Quit | Exit the application |

## Configuration

Services are stored in `services.db` in the same directory as the application. The file is created automatically with default services (docker, ollama, ssh) on first run.

| |
|---|
|docker|
|nginx|
|postgresql|
|redis|

## How It Works

T Serve uses `systemctl` commands under the hood to manage services:

- **Status Display**: Runs `systemctl status <service>` to fetch real-time information
- **Service Control**: Executes `systemctl start/stop/restart/enable/disable/mask/unmask <service>` with sudo
- **Password Security**: Uses `sudo -S` to securely handle password input for privileged operations

## Security Notes

- Passwords are entered via a censored input field (shown as asterisks)
- Passwords are passed securely to sudo via stdin
- Passwords are not stored or logged
- Always verify the service name before performing operations

## Troubleshooting

### "Command not found: systemctl"

This application requires systemd. Ensure you're running on a systemd-based Linux distribution (Ubuntu 16.04+, Debian 8+, Fedora, Arch, etc.).

### Permission Denied

Make sure you have sudo privileges and enter the correct password when prompted.

### Service Not Found

The service name must match exactly as it appears in systemd. Use `systemctl list-units --type=service` to see available services.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the GNU GPL2 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [blessed](https://github.com/chjj/blessed) - A high-level terminal interface library for node.js
- Inspired by the need for a simple, keyboard-driven service manager

## Author

Project Link: [https://github.com/Ravish-Ranjan/t-serve](https://github.com/Ravish-Ranjan/t-serve)

---
If you find this project useful, please consider giving it a star on GitHub!
