import axios from "axios"; // For GitHub API calls
import { writeFile, mkdir } from 'fs/promises'; // For file operations
import { existsSync } from 'fs'; // To check directory existence
import { join } from 'path'; // For path handling
import { ReduxCMDHome } from "../modules/reduxCMDHome.js"; // Adjust path as needed

export const meta = {
 name: "dolphinmenu",
 description: "Manages Dolphin commands: install, update, and list available commands.",
 author: "Grok 3 || xAI || Liane || Nica || MrkimstersDev",
 version: "1.0.0",
 usage: "{prefix}dolphinmenu <option> [file]",
 category: "Utilities",
 permissions: [2], // Changed to level 2 permissions
 noPrefix: false,
 waitingTime: 1,
 otherNames: ["dolphinmenu", "dmenu"],
 requirement: "2.5.0",
 icon: "🐬",
 shopPrice: 0,
};

// GitHub repository details
const repoOwner = "KimetsuAndrea"; // Replace with your GitHub username
const repoName = "dolphintools"; // Replace with your repository name
const commandDir = "CommandFiles/commands/"; // Local target directory
const repoCommandPath = ""; // Main directory of the repo (no subfolder)

// Helper function to ensure directory exists
async function ensureDirectory(dirPath) {
 if (!existsSync(dirPath)) {
 await mkdir(dirPath, { recursive: true });
 console.log(`Created directory: ${dirPath}`);
 }
}

// Helper function to fetch and save a command file from GitHub
async function fetchAndSaveCommand(fileName, githubApi, action = "install") {
 try {
 const repoFilePath = join(repoCommandPath, fileName); // Root-level file in repo
 const localFilePath = join(commandDir, fileName); // Local CommandFiles/commands/
 const response = await githubApi.get(`/repos/${repoOwner}/${repoName}/contents/${repoFilePath}`);
 const fileContent = Buffer.from(response.data.content, "base64").toString("utf8");
 
 await ensureDirectory(commandDir);
 await writeFile(localFilePath, fileContent, "utf8");
 console.log(`Successfully ${action}ed ${fileName} to ${localFilePath}`);
 return { success: true, sha: response.data.sha };
 } catch (error) {
 console.error(`Error ${action}ing ${fileName}: ${error.message}`);
 return { success: false, error: error.message };
 }
}

// Main entry function using ReduxCMDHome
export async function entry(ctx) {
 const { input, output, prefix, args } = ctx;

 // Configure GitHub API (shared across subcommands)
 const githubToken = process.env.GITHUB_TOKEN; // Optional, for private repos or rate limits
 const githubApi = axios.create({
 baseURL: "https://api.github.com",
 headers: {
 "Accept": "application/vnd.github.v3+json",
 "Authorization": githubToken ? `token ${githubToken}` : "",
 },
 });

 const home = new ReduxCMDHome(
 {
 isHypen: true, // Enable hyphen-based subcommands (e.g., -install)
 },
 [
 {
 key: "install",
 description: "Installs a specific Dolphin command file (Admin-only)",
 aliases: ["-install"],
 args: ["<file>"],
 async handler() {
 if (!input.isAdmin) {
 return output.reply(`⚠️ Only bot admins (permission level 2) can use ${prefix}dolphinmenu -install!`);
 }
 const fileName = args[0];
 if (!fileName) {
 return output.reply(`⚠️ Please specify a file to install (e.g., ${prefix}dolphinmenu -install dolphinTuner.js)`);
 }
 if (!fileName.endsWith(".js")) {
 return output.reply(`⚠️ File must be a .js file (e.g., dolphinTuner.js)`);
 }

 const result = await fetchAndSaveCommand(fileName, githubApi, "install");
 if (result.success) {
 return output.reply(`✔ Successfully installed ${fileName} to ${commandDir}`);
 } else {
 return output.reply(`⚠️ Failed to install ${fileName}: ${result.error}`);
 }
 }
 },
 {
 key: "update",
 description: "Updates a specific Dolphin command file to the latest version (Admin-only)",
 aliases: ["-update"],
 args: ["<file>"],
 async handler() {
 if (!input.isAdmin) {
 return output.reply(`⚠️ Only bot admins (permission level 2) can use ${prefix}dolphinmenu -update!`);
 }
 const fileName = args[0];
 if (!fileName) {
 return output.reply(`⚠️ Please specify a file to update (e.g., ${prefix}dolphinmenu -update dolphinTuner.js)`);
 }
 if (!fileName.endsWith(".js")) {
 return output.reply(`⚠️ File must be a .js file (e.g., dolphinTuner.js)`);
 }

 const result = await fetchAndSaveCommand(fileName, githubApi, "update");
 if (result.success) {
 return output.reply(
 `✔ Updated ${fileName} to latest version (SHA: ${result.sha.substring(0, 7)})\n` +
 `File saved to ${commandDir}`
 );
 } else {
 return output.reply(`⚠️ Failed to update ${fileName}: ${result.error}`);
 }
 }
 },
 {
 key: "list",
 description: "Lists available Dolphin command files from the repository",
 aliases: ["-list"],
 async handler() {
 try {
 const response = await githubApi.get(`/repos/${repoOwner}/${repoName}/contents/${repoCommandPath}`);
 const files = response.data
 .filter(item => item.type === "file" && item.name.endsWith(".js"))
 .map(item => item.name);

 if (!files.length) {
 return output.reply(`⚠️ No command files found in ${repoOwner}/${repoName}`);
 }

 const fileList = files.map((file, index) => `${index + 1}. ${file}`).join("\n");
 return output.reply(
 `📜 **Available Dolphin Commands** (${files.length}):\n` +
 `${fileList}\n\n` +
 `Use ${prefix}dolphinmenu -install <file> to install or -update <file> to update`
 );
 } catch (error) {
 return output.reply(`⚠️ Failed to fetch command list: ${error.message}`);
 }
 }
 }
 ]
 );
 home.runInContext(ctx);
}