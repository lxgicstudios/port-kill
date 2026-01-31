---
name: Port Kill CLI
description: Find and kill processes by port. List port usage, free stuck ports. Developer utility. Free CLI tool.
tags: [port, process, kill, debugging, network, cli, developer]
---

# Port Kill CLI

Kill processes hogging your ports.

**Find. Kill. Free. That simple.**

## Quick Start

```bash
npm install -g port-kill-cli
```

```bash
# Kill process on port 3000
port-kill 3000

# List all port usage
port-kill list

# Find who's using port
port-kill find 8080
```

## Commands

```bash
# Kill by port
port-kill 3000

# Kill multiple ports
port-kill 3000 8080 5432

# Force kill
port-kill 3000 --force

# Find without killing
port-kill find 3000

# List all used ports
port-kill list

# List with process names
port-kill list --full

# Interactive mode
port-kill -i
```

## Example Output

```
$ port-kill find 3000

Port 3000:
  PID: 12345
  Process: node
  Command: node server.js
  User: kai
  Started: 10:30:22

Kill this process? [y/N]
```

## List Output

```
$ port-kill list

PORT    PID     PROCESS     COMMAND
3000    12345   node        node server.js
5432    1234    postgres    postgres -D /data
8080    5678    java        java -jar app.jar
27017   9999    mongod      mongod --dbpath
```

## Options

```bash
# Dry run (show what would be killed)
port-kill 3000 --dry-run

# Kill by process name
port-kill --name node

# Kill all node processes
port-kill --name node --all

# Quiet mode
port-kill 3000 -q
```

## Common Ports

```bash
# Free common dev ports
port-kill 3000 3001 8080 5173 5000

# Database ports
port-kill 5432 3306 27017 6379
```

## When to Use This

- Port already in use errors
- Stuck development servers
- Cleaning up processes
- Quick debugging
- Before starting services

---

**Built by [LXGIC Studios](https://lxgicstudios.com)**

🔗 [GitHub](https://github.com/lxgicstudios/port-kill) · [Twitter](https://x.com/lxgicstudios)
