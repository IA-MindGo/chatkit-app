#!/usr/bin/env node

// Cross-platform wrapper for starting the Python backend. Uses the existing
// shell/bat scripts depending on the host OS so that "npm run backend" works
// on Windows as well as Unix.

const { execSync } = require("child_process");
const os = require("os");

const isWin = os.platform().startsWith("win");
const command = isWin ? "backend\\scripts\\run.bat" : "bash backend/scripts/run.sh";

try {
  execSync(command, { stdio: "inherit" });
} catch (err) {
  process.exit(err.status || 1);
}
