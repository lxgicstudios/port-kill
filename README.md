# @lxgicstudios/port-kill

Kill processes running on a specific port with one command.

No more `lsof | grep | awk | xargs kill`. Just `npx @lxgicstudios/port-kill 3000`.

## Installation

```bash
# Use directly with npx (recommended)
npx @lxgicstudios/port-kill 3000

# Or install globally
npm install -g @lxgicstudios/port-kill
```

## Usage

```bash
# Kill whatever is running on port 3000
npx @lxgicstudios/port-kill 3000

# Force kill (SIGKILL)
npx @lxgicstudios/port-kill 3000 -f

# List processes without killing
npx @lxgicstudios/port-kill 3000 --list

# Check if port is in use
npx @lxgicstudios/port-kill --check 3000

# Find available ports starting from 3000
npx @lxgicstudios/port-kill --find 3000
```

## Options

| Option | Description |
|--------|-------------|
| `-f, --force` | Force kill (SIGKILL on Unix, /F on Windows) |
| `-l, --list` | List processes on port without killing |
| `--check <port>` | Check if a port is in use |
| `--find <port>` | Find available ports starting from port |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## Programmatic API

```typescript
import { 
  killPort, 
  findProcessesOnPort, 
  isPortInUse, 
  findAvailablePort 
} from '@lxgicstudios/port-kill';

// Kill processes on port
const result = killPort(3000);
console.log(result.success); // true if killed

// Find what's running on a port
const processes = findProcessesOnPort(3000);
processes.forEach(p => console.log(p.pid, p.command));

// Check if port is in use
if (isPortInUse(3000)) {
  console.log('Port 3000 is busy');
}

// Find available ports
const available = findAvailablePort(3000, 5);
console.log('Available ports:', available);
```

## Cross-Platform

Works on:
- ✅ macOS
- ✅ Linux
- ✅ Windows

---

**Built by [LXGIC Studios](https://lxgicstudios.com)**

🔗 [GitHub](https://github.com/lxgicstudios/port-kill) · [Twitter](https://x.com/lxgicstudios)
