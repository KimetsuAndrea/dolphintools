import axios from "axios"; // For GitHub API calls
import { writeFile, mkdir } from 'fs/promises'; // For file operations
import { existsSync } from 'fs'; // To check directory existence
import { join } from 'path'; // For path handling
import { ReduxCMDHome } from "../modules/reduxCMDHome.js"; // Adjust path as needed
export class style {
  title = {
    text_font: "bold",
    content: "DolphinMenu 🐬",
    line_bottom: "default",
  };
  content = {
    text_font: "none",
    content: null,
  };
}
export const meta = {
    name: "dolphinmenu",
    description: "Manages Dolphin commands: install, update, list, search, and get info on commands.",
    author: "MrkimstersDev || 0xVoid",
    version: "1.0.0",
    usage: "{prefix}dolphinmenu <option> [file | keyword]",
    category: "Utilities",
    permissions: [2], // Admin-only access
    noPrefix: false,
    waitingTime: 1,
    otherNames: ["dolphinmenu", "dmenu"],
    requirement: "2.5.0",
    icon: "🐬",
    shopPrice: 0,
};

// GitHub repository details
const repoOwner = "KimetsuAndrea";
const repoName = "dolphintools";
const commandDir = "CommandFiles/commands/";
const repoCommandPath = "";

// Helper function to ensure directory exists
async function ensureDirectory(dirPath) {
    if (!existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

// Helper function to fetch, save, and load a command file from GitHub
async function fetchSaveAndLoadCommand(fileName, githubApi, commands, action = "install") {
    try {
        const repoFilePath = join(repoCommandPath, fileName);
        const localFilePath = join(commandDir, fileName);
        const response = await githubApi.get(`/repos/${repoOwner}/${repoName}/contents/${repoFilePath}`);
        const fileContent = Buffer.from(response.data.content, "base64").toString("utf8");
        
        await ensureDirectory(commandDir);
        await writeFile(localFilePath, fileContent, "utf8");
        
        // Use global.Cassidy.loadCommand to load the command
        const loadError = await global.Cassidy.loadCommand(fileName, commands, false, true);
        if (loadError) {
            throw loadError;
        }
        
        console.log(`Successfully ${action}ed and loaded ${fileName} to ${localFilePath}`);
        return { success: true, sha: response.data.sha };
    } catch (error) {
        console.error(`Error ${action}ing ${fileName}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Main entry function using ReduxCMDHome
export async function entry(ctx) {
    const { input, output, prefix, args, commands } = ctx;

    // Configure GitHub API
    const githubToken = process.env.GITHUB_TOKEN;
    const githubApi = axios.create({
        baseURL: "https://api.github.com",
        headers: {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": githubToken ? `token ${githubToken}` : "",
        },
    });

    const home = new ReduxCMDHome(
        {
            isHypen: true,
        },
        [
            {
                key: "install",
                description: "Installs and loads a specific Dolphin command file (Admin-only)",
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

                    const result = await fetchSaveAndLoadCommand(fileName, githubApi, commands, "install");
                    if (result.success) {
                        return output.reply(`✔ Successfully installed and loaded ${fileName} to ${commandDir}`);
                    } else {
                        return output.reply(`⚠️ Failed to install/load ${fileName}: ${result.error}`);
                    }
                }
            },
            {
                key: "update",
                description: "Updates and reloads a specific Dolphin command file (Admin-only)",
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

                    const result = await fetchSaveAndLoadCommand(fileName, githubApi, commands, "update");
                    if (result.success) {
                        return output.reply(
                            `✔ Updated and reloaded ${fileName} to latest version (SHA: ${result.sha.substring(0, 7)})\n` +
                            `File saved to ${commandDir}`
                        );
                    } else {
                        return output.reply(`⚠️ Failed to update/load ${fileName}: ${result.error}`);
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
            },
            {
                key: "search",
                description: "Searches for Dolphin command files by keyword",
                aliases: ["-search"],
                args: ["<keyword>"],
                async handler() {
                    const keyword = args[0];
                    if (!keyword) {
                        return output.reply(`⚠️ Please specify a keyword to search (e.g., ${prefix}dolphinmenu -search tuner)`);
                    }

                    try {
                        const response = await githubApi.get(`/repos/${repoOwner}/${repoName}/contents/${repoCommandPath}`);
                        const files = response.data
                            .filter(item => item.type === "file" && item.name.endsWith(".js") && item.name.toLowerCase().includes(keyword.toLowerCase()))
                            .map(item => item.name);

                        if (!files.length) {
                            return output.reply(`⚠️ No command files found matching "${keyword}" in ${repoOwner}/${repoName}`);
                        }

                        const fileList = files.map((file, index) => `${index + 1}. ${file}`).join("\n");
                        return output.reply(
                            `🔍 **Search Results for "${keyword}"** (${files.length}):\n` +
                            `${fileList}\n\n` +
                            `Use ${prefix}dolphinmenu -install <file> to install or -info <file> for details`
                        );
                    } catch (error) {
                        return output.reply(`⚠️ Failed to search commands: ${error.message}`);
                    }
                }
            },
            {
                key: "info",
                description: "Displays metadata about a specific Dolphin command file",
                aliases: ["-info"],
                args: ["<file>"],
                async handler() {
                    const fileName = args[0];
                    if (!fileName) {
                        return output.reply(`⚠️ Please specify a file to get info on (e.g., ${prefix}dolphinmenu -info dolphinTuner.js)`);
                    }
                    if (!fileName.endsWith(".js")) {
                        return output.reply(`⚠️ File must be a .js file (e.g., dolphinTuner.js)`);
                    }

                    try {
                        const repoFilePath = join(repoCommandPath, fileName);
                        const response = await githubApi.get(`/repos/${repoOwner}/${repoName}/contents/${repoFilePath}`);
                        const fileContent = Buffer.from(response.data.content, "base64").toString("utf8");

                        const metaMatch = fileContent.match(/export const meta = {([\s\S]*?)};/);
                        if (!metaMatch) {
                            return output.reply(`⚠️ No metadata found in ${fileName}`);
                        }
                        const metaStr = `{${metaMatch[1]}}`;
                        const meta = eval(`(${metaStr})`);

                        return output.reply(
                            `📋 **Command Info: ${fileName}**\n` +
                            `Description: ${meta.description || "N/A"}\n` +
                            `Author: ${meta.author || "Unknown"}\n` +
                            `Version: ${meta.version || "N/A"}\n` +
                            `Usage: ${meta.usage || "Not specified"}`
                        );
                    } catch (error) {
                        return output.reply(`⚠️ Failed to fetch info for ${fileName}: ${error.message}`);
                    }
                }
            }
        ]
    );

    home.runInContext(ctx);
}