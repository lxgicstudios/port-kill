#!/usr/bin/env node

import { findProcessesOnPort, killPort, findAvailablePort, isPortInUse } from './index.js';

const args = process.argv.slice(2);

const HELP = `
port-kill - Kill processes running on a specific port

USAGE:
  npx @lxgicstudios/port-kill <port>        Kill processes on port
  npx @lxgicstudios/port-kill <port> -f     Force kill (SIGKILL)
  npx @lxgicstudios/port-kill <port> --list List processes without killing
  npx @lxgicstudios/port-kill --find <port> Find next available port
  npx @lxgicstudios/port-kill --check <port> Check if port is in use

OPTIONS:
  -f, --force     Force kill processes (SIGKILL on Unix, /F on Windows)
  -l, --list      List processes on port without killing
  --find <port>   Find available ports starting from specified port
  --check <port>  Check if a specific port is in use
  -h, --help      Show this help message
  -v, --version   Show version

EXAMPLES:
  npx @lxgicstudios/port-kill 3000         Kill whatever is on port 3000
  npx @lxgicstudios/port-kill 8080 -f      Force kill on port 8080
  npx @lxgicstudios/port-kill 3000 --list  See what's running on 3000
  npx @lxgicstudios/port-kill --find 3000  Find free port starting at 3000
  npx @lxgicstudios/port-kill --check 80   Check if port 80 is in use

Built by LXGIC Studios · https://github.com/lxgicstudios/port-kill
`;

function colorize(text: string, color: string): string {
  const colors: Record<string, string> = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
  };
  return `${colors[color] || ''}${text}${colors.reset}`;
}

function printError(msg: string): void {
  console.error(colorize('✗ ', 'red') + msg);
}

function printSuccess(msg: string): void {
  console.log(colorize('✓ ', 'green') + msg);
}

function printInfo(msg: string): void {
  console.log(colorize('ℹ ', 'blue') + msg);
}

async function main(): Promise<void> {
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    console.log(HELP);
    process.exit(0);
  }

  if (args.includes('-v') || args.includes('--version')) {
    console.log('1.0.0');
    process.exit(0);
  }

  // Handle --find flag
  const findIdx = args.indexOf('--find');
  if (findIdx !== -1) {
    const portArg = args[findIdx + 1];
    const port = parseInt(portArg, 10);
    
    if (isNaN(port) || port < 1 || port > 65535) {
      printError('Invalid port number. Must be between 1 and 65535.');
      process.exit(1);
    }

    const available = findAvailablePort(port, 5);
    if (available.length > 0) {
      printSuccess(`Available ports starting from ${port}:`);
      available.forEach(p => console.log(`  ${colorize(p.toString(), 'cyan')}`));
    } else {
      printError(`No available ports found starting from ${port}`);
    }
    process.exit(0);
  }

  // Handle --check flag
  const checkIdx = args.indexOf('--check');
  if (checkIdx !== -1) {
    const portArg = args[checkIdx + 1];
    const port = parseInt(portArg, 10);
    
    if (isNaN(port) || port < 1 || port > 65535) {
      printError('Invalid port number. Must be between 1 and 65535.');
      process.exit(1);
    }

    if (isPortInUse(port)) {
      const procs = findProcessesOnPort(port);
      printInfo(`Port ${port} is ${colorize('IN USE', 'red')}`);
      procs.forEach(p => {
        console.log(`  PID ${colorize(p.pid.toString(), 'yellow')}: ${p.command}`);
      });
      process.exit(1);
    } else {
      printSuccess(`Port ${port} is ${colorize('AVAILABLE', 'green')}`);
      process.exit(0);
    }
  }

  // Main port argument
  const portArg = args.find(a => !a.startsWith('-'));
  if (!portArg) {
    printError('Please specify a port number.');
    console.log(HELP);
    process.exit(1);
  }

  const port = parseInt(portArg, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    printError('Invalid port number. Must be between 1 and 65535.');
    process.exit(1);
  }

  const force = args.includes('-f') || args.includes('--force');
  const listOnly = args.includes('-l') || args.includes('--list');

  // List mode
  if (listOnly) {
    const processes = findProcessesOnPort(port);
    if (processes.length === 0) {
      printInfo(`No processes running on port ${port}`);
    } else {
      printInfo(`Processes on port ${colorize(port.toString(), 'cyan')}:`);
      processes.forEach(p => {
        console.log(`  PID ${colorize(p.pid.toString(), 'yellow')}: ${p.command}${p.user ? ` (${p.user})` : ''}`);
      });
    }
    process.exit(0);
  }

  // Kill mode
  console.log(`${colorize('→', 'blue')} Finding processes on port ${colorize(port.toString(), 'cyan')}...`);
  
  const result = killPort(port, force);

  if (result.processes.length === 0) {
    printInfo(`No processes found on port ${port}`);
    process.exit(0);
  }

  if (result.success) {
    printSuccess(`Killed ${result.processes.length} process(es) on port ${port}:`);
    result.processes.forEach(p => {
      console.log(`  PID ${colorize(p.pid.toString(), 'yellow')}: ${p.command}`);
    });
  } else {
    printError(`Failed to kill processes on port ${port}`);
    if (result.error) {
      console.error(`  ${result.error}`);
    }
    process.exit(1);
  }
}

main().catch(err => {
  printError(err.message || 'An unexpected error occurred');
  process.exit(1);
});
