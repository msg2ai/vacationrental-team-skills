#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync, spawnSync } = require("child_process");

const REPO_URL_PRIMARY = "https://github.com/msg2ai/vacationrental-team-skills.git";

const SKILL_FOLDERS = [
  "vacationrental-general-manager",
  "vacationrental-bookings-reservations",
  "vacationrental-owner-relations",
  "vacationrental-marketing-distribution",
  "vacationrental-housekeeping-maintenance",
  "vacationrental-finance-trust",
  "vacationrental-guest-experience",
  "vacationrental-vibe-coder",
];

function getSkillsDir() {
  const home =
    process.env.HOME ||
    process.env.USERPROFILE ||
    (process.env.HOMEDRIVE && process.env.HOMEPATH
      ? process.env.HOMEDRIVE + process.env.HOMEPATH
      : null);
  if (!home) {
    console.error("Error: Could not determine home directory.");
    process.exit(1);
  }
  return path.join(home, ".claude", "skills", "vacationrental-team-skills");
}

function printBanner() {
  console.log("");
  console.log("  Vacation Rental Team Skills for Claude");
  console.log("  8 skills — one for every seat in your property mgmt office, plus a Vibe Coder for the direct-booking site");
  console.log("  Built by MSG2AI — https://msg2ai.xyz");
  console.log("");
}

function printUsage() {
  console.log("Usage: npx vacationrental-team-skills <command>");
  console.log("");
  console.log("Commands:");
  console.log("  install     Install skills to ~/.claude/skills/");
  console.log("  uninstall   Remove skills from ~/.claude/skills/");
  console.log("  update      Update skills to the latest version");
  console.log("  list        List all available skills");
  console.log("  help        Show this help message");
  console.log("");
}

function ensureGit() {
  try {
    execSync("git --version", { stdio: "ignore" });
  } catch {
    console.error("Error: Git is not installed.");
    console.error("Install Git from https://git-scm.com and try again.");
    process.exit(1);
  }
}

function cloneRepo(targetDir) {
  try {
    execSync(`git clone "${REPO_URL_PRIMARY}" "${targetDir}"`, { stdio: "inherit" });
    return REPO_URL_PRIMARY;
  } catch {
    return null;
  }
}

function printPostInstall(skillsDir) {
  console.log("");
  console.log("──────────────────────────────────────────────────────────");
  console.log("  Done! 8 vacation-rental team skills are now installed.");
  console.log("──────────────────────────────────────────────────────────");
  console.log("");
  console.log("  Skills:");
  for (const skill of SKILL_FOLDERS) console.log("    - " + skill);
  console.log("");
  console.log("  Recommended first steps:");
  console.log("");
  console.log("  1) Set up your shared Knowledge Base (Drive / Dropbox / Notion).");
  console.log("     Every skill reads from and writes to it. The General Manager");
  console.log("     skill creates the canonical folder structure on first run.");
  console.log("");
  console.log("  2) Open Claude Code and try a prompt like:");
  console.log('       "Bootstrap our portfolio from our Airbnb host profile"');
  console.log('       "Draft this month\'s owner statements for all 47 properties"');
  console.log('       "Build the pricing strategy for our beach properties for July"');
  console.log("");
}

function install() {
  const skillsDir = getSkillsDir();

  if (fs.existsSync(skillsDir)) {
    console.log("Skills are already installed at:");
    console.log("  " + skillsDir);
    console.log("");
    console.log("Run 'npx vacationrental-team-skills update' to get the latest version.");
    return;
  }

  ensureGit();

  const parentDir = path.dirname(skillsDir);
  fs.mkdirSync(parentDir, { recursive: true });

  console.log("Installing skills to:");
  console.log("  " + skillsDir);
  console.log("");

  const usedUrl = cloneRepo(skillsDir);

  if (!usedUrl) {
    console.error("");
    console.error("Error: Failed to clone the vacationrental-team-skills repository.");
    console.error("Tried: " + REPO_URL_PRIMARY);
    console.error("Check your internet connection and that github.com is reachable.");
    process.exit(1);
  }

  const expected = [...SKILL_FOLDERS, "docs", ".claude-plugin", "README.md"];
  const missing = expected.filter((rel) => !fs.existsSync(path.join(skillsDir, rel)));
  if (missing.length > 0) {
    console.error("");
    console.error("Warning: install completed but expected files are missing:");
    for (const m of missing) console.error("  - " + m);
    console.error("Run 'npx vacationrental-team-skills update' to retry.");
  }

  printPostInstall(skillsDir);
}

function uninstall() {
  const skillsDir = getSkillsDir();
  if (!fs.existsSync(skillsDir)) {
    console.log("Skills are not installed. Nothing to remove.");
    return;
  }
  fs.rmSync(skillsDir, { recursive: true, force: true });
  console.log("Skills removed from:");
  console.log("  " + skillsDir);
  console.log("");
}

function update() {
  const skillsDir = getSkillsDir();
  if (!fs.existsSync(skillsDir)) {
    console.log("Skills are not installed yet. Running install instead...");
    console.log("");
    install();
    return;
  }
  ensureGit();
  console.log("Updating skills...");
  console.log("");
  try {
    execSync("git pull", { cwd: skillsDir, stdio: "inherit" });
  } catch {
    console.error("");
    console.error("Error: Failed to update. Try uninstalling and reinstalling.");
    process.exit(1);
  }
  console.log("");
  console.log("Skills updated to the latest version.");
  console.log("");
}

function list() {
  console.log("Available skills:");
  console.log("");
  console.log("  vacationrental-general-manager           General Manager (Sofia)");
  console.log("  vacationrental-bookings-reservations     Reservations Manager (Marco)");
  console.log("  vacationrental-owner-relations           Owner Relations Lead (James)");
  console.log("  vacationrental-marketing-distribution    Marketing & Distribution (Priya)");
  console.log("  vacationrental-housekeeping-maintenance  Housekeeping & Maintenance Coordinator (Tom)");
  console.log("  vacationrental-finance-trust             Finance & Trust Accounting (Amelia)");
  console.log("  vacationrental-guest-experience          Guest Experience Lead (Lena)");
  console.log("  vacationrental-vibe-coder                Head of Web / Vibe Coder (Noor)");
  console.log("");

  const skillsDir = getSkillsDir();
  if (fs.existsSync(skillsDir)) {
    console.log("Status: Installed at " + skillsDir);
  } else {
    console.log("Status: Not installed");
    console.log("Run 'npx vacationrental-team-skills install' to install.");
  }
  console.log("");
}

printBanner();
const command = process.argv[2] || "help";
switch (command) {
  case "install":
  case "i":
    install();
    break;
  case "uninstall":
  case "remove":
    uninstall();
    break;
  case "update":
  case "upgrade":
    update();
    break;
  case "list":
  case "ls":
    list();
    break;
  case "help":
  case "--help":
  case "-h":
    printUsage();
    break;
  default:
    console.log("Unknown command: " + command);
    console.log("");
    printUsage();
    process.exit(1);
}
