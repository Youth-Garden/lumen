import { spawn } from 'child_process';
import * as path from 'path';

export function runSeedNgsl(): Promise<void> {
  return new Promise((resolve, reject) => {
    const backendRoot = path.resolve(__dirname, '../../../../backend');
    const child = spawn('npx', ['ts-node', '-r', 'tsconfig-paths/register', 'src/scripts/seed-ngsl-vocabulary.ts'], {
      cwd: backendRoot,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Seeder process exited with code ${code}`));
    });
  });
}

if (require.main === module) {
  runSeedNgsl().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
