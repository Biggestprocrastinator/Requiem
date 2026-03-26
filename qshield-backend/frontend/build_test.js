const { execSync } = require('child_process');
const fs = require('fs');

try {
  execSync('npx vite build', { encoding: 'utf8', stdio: 'pipe' });
  console.log("Build succeeded");
} catch (e) {
  let errStr = (e.stdout || '') + '\n' + (e.stderr || '');
  // remove carriage returns that hide output in console
  errStr = errStr.replace(/\r/g, ''); 
  fs.writeFileSync('error_utf8.txt', errStr, 'utf8');
  console.log("Build failed, error written to error_utf8.txt");
}
