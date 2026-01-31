import { execSync, exec } from 'child_process';
import { platform } from 'os';

export interface ProcessInfo {
  pid: number;
  command: string;
  user?: string;
}

export interface KillResult {
  success: boolean;
  port: number;
  processes: ProcessInfo[];
  error?: string;
}

/**
 * Find processes running on a specific port
 */
export function findProcessesOnPort(port: number): ProcessInfo[] {
  const os = platform();
  const processes: ProcessInfo[] = [];

  try {
    let output: string;

    if (os === 'win32') {
      output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      const pids = new Set<number>();

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(pid) && pid > 0) {
          pids.add(pid);
        }
      }

      for (const pid of pids) {
        try {
          const taskInfo = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: 'utf8' });
          const match = taskInfo.match(/"([^"]+)"/);
          processes.push({
            pid,
            command: match ? match[1] : 'unknown'
          });
        } catch {
          processes.push({ pid, command: 'unknown' });
        }
      }
    } else {
      // macOS and Linux
      try {
        output = execSync(`lsof -i :${port} -t 2>/dev/null`, { encoding: 'utf8' });
        const pids = output.trim().split('\n').filter(Boolean).map(p => parseInt(p, 10));

        for (const pid of pids) {
          try {
            const psOutput = execSync(`ps -p ${pid} -o comm= 2>/dev/null`, { encoding: 'utf8' });
            processes.push({
              pid,
              command: psOutput.trim() || 'unknown'
            });
          } catch {
            processes.push({ pid, command: 'unknown' });
          }
        }
      } catch {
        // Try alternative method with lsof
        try {
          output = execSync(`lsof -i :${port} 2>/dev/null`, { encoding: 'utf8' });
          const lines = output.trim().split('\n').slice(1); // Skip header

          for (const line of lines) {
            const parts = line.split(/\s+/);
            if (parts.length >= 2) {
              const pid = parseInt(parts[1], 10);
              if (!isNaN(pid) && !processes.find(p => p.pid === pid)) {
                processes.push({
                  pid,
                  command: parts[0],
                  user: parts[2]
                });
              }
            }
          }
        } catch {
          // No processes found
        }
      }
    }
  } catch {
    // No processes found on this port
  }

  return processes;
}

/**
 * Kill all processes on a specific port
 */
export function killPort(port: number, force: boolean = false): KillResult {
  const processes = findProcessesOnPort(port);

  if (processes.length === 0) {
    return {
      success: true,
      port,
      processes: [],
      error: `No processes found on port ${port}`
    };
  }

  const os = platform();
  const killed: ProcessInfo[] = [];
  const errors: string[] = [];

  for (const proc of processes) {
    try {
      if (os === 'win32') {
        execSync(`taskkill ${force ? '/F' : ''} /PID ${proc.pid}`, { encoding: 'utf8' });
      } else {
        execSync(`kill ${force ? '-9' : '-15'} ${proc.pid} 2>/dev/null`, { encoding: 'utf8' });
      }
      killed.push(proc);
    } catch (err) {
      errors.push(`Failed to kill PID ${proc.pid}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return {
    success: killed.length > 0,
    port,
    processes: killed,
    error: errors.length > 0 ? errors.join('; ') : undefined
  };
}

/**
 * Find available ports starting from a base port
 */
export function findAvailablePort(startPort: number, count: number = 1): number[] {
  const available: number[] = [];
  let port = startPort;

  while (available.length < count && port < 65535) {
    const processes = findProcessesOnPort(port);
    if (processes.length === 0) {
      available.push(port);
    }
    port++;
  }

  return available;
}

/**
 * Check if a port is in use
 */
export function isPortInUse(port: number): boolean {
  return findProcessesOnPort(port).length > 0;
}
