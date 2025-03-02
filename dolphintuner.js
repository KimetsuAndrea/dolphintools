import { UNIRedux } from "../modules/unisym.js";
import axios from "axios"; // Import axios for GitHub API calls
const fs = require("fs"); // Import fs for file operations

export const meta = {
    name: "dolphintuner",
    description: "Manages tuning, listing, resetting, updating (admin-only), and viewing commit history for game simulators.",
    author: "Grok 3 || xAI",
    version: "1.0.0",
    usage: "{prefix}dtuner <action>",
    category: "Utilities",
    permissions: [0], // Default permissions for the command (non-admin actions)
    noPrefix: false,
    waitingTime: 1,
    otherNames: ["dtuner", "raretune"],
    requirement: "2.5.0",
    icon: "🐬",
    shopPrice: 0, // As specified
};

/**
 * Helper function to format duration
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    if (seconds > 0) parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);
    return parts.length > 1 ? parts.slice(0, -1).join(", ") + " and " + parts.slice(-1) : parts[0] || "0 seconds";
}

/**
 * Helper function to calculate earnings per minute
 * @param {Object} item - Item object with priceA, priceB, chance, and delay
 * @returns {Array} [minEarnings, maxEarnings]
 */
function getEarnPerMinute(item) {
    if (!item || item.delay <= 0) return [0, 0];
    const attemptsPerMinute = 60 / item.delay;
    const minEarnings = item.priceA * item.chance * attemptsPerMinute;
    const maxEarnings = item.priceB * item.chance * attemptsPerMinute;
    return [minEarnings, maxEarnings];
}

const dangerousContext = (ctx) => {
    const money = { get() { throw new Error("Dolphin Tuner"); } };
    const dummy = new Proxy({}, { get: () => () => {}, set: () => true });
    const dctx = {
        money,
        input: {
            ...ctx.input,
            arguments: {
                original: [], // Ensure this is an iterable array
                raw: [],     // Added for compatibility
                parsed: []   // Added for potential simulator expectations
            },
            body: "",
            senderID: ctx.input.senderID || "dummy_user",
            propertyArray: ctx.input.propertyArray || [],
            isAdmin: ctx.input.isAdmin || false,
        },
        commandName: "dolphintuner",
        args: [],
        output: dummy,
        GameSimulator: ctx.GameSimulator,
    };
    dctx.GameSimulator = class extends ctx.GameSimulator {
        constructor(...args) { super(...args); }
        simulateAction(ctx = dctx) { return super.simulateAction(ctx); }
    };
    // Debug: Log the input structure to verify it’s iterable
    console.log('Dangerous context input structure:', JSON.stringify(dctx.input, handleCircular, 2));
    return dctx;
};

/**
 * Helper function to handle circular references in JSON.stringify
 */
function handleCircular(key, value) {
    const seen = new WeakSet();
    return (k, val) => {
        if (typeof val === 'object' && val !== null) {
            if (seen.has(val)) {
                return '[Circular Reference]';
            }
            seen.add(val);
        }
        if (typeof val === 'function') return '[Function]';
        return val;
    };
}

async function initializeSimulators(ctx, simulatorCommands) {
    const { GameSimulator, commands, output } = ctx;
    const dctx = dangerousContext(ctx);
    GameSimulator.instances = {};
    const simulatorData = {};

    for (const simName of simulatorCommands) {
        const target = commands[simName];
        if (!target) {
            console.log(`Simulator command not found: ${simName}`);
            await output.reply(`⚠️ Simulator command '${simName}' not found!`);
            continue;
        }

        try {
            console.log(`Triggering command: ${simName}`);
            console.log(`Command meta structure:`, JSON.stringify(target.meta, handleCircular, 2));
            await target.entry(dctx);
            const sim = GameSimulator.instances[simName];
            if (sim && sim.itemData) {
                simulatorData[simName] = sim;
                console.log(`Detected simulator ${simName} structure:`, 
                    JSON.stringify(sim, handleCircular, 2));
            }
        } catch (error) {
            console.log(`Error in ${simName}: ${error.message}`);
            console.log(`Error stack:`, error.stack);
            await output.reply(`⚠️ Failed to initialize ${simName}: ${error.message}`);
            continue;
        }
    }
    if (!Object.keys(simulatorData).length) {
        await output.reply("⚠️ No specified simulators detected!");
    }
    return simulatorData;
}

/**
 * Handle the update command (restricted to bot admins)
 * @param {Object} ctx - Context object
 * @param {Object} output - Output object for replying
 * @param {number} timeA - Start time for ping calculation
 * @returns {Promise<void>}
 */
async function handleUpdate(ctx, output, timeA) {
    const { input, money } = ctx;
    const userData = await money.get(input.senderID) || {};

    // Check if user is a bot admin (permissions level 1 or higher)
    if (!input.isAdmin) {
        return output.reply(
            `⚠️ Only bot admins can use ${ctx.prefix}${ctx.commandName}-update!\n` +
            `Ping: ${Date.now() - timeA}ms`
        );
    }

    try {
        const repoOwner = "KimetsuAndrea"; // Replace with your GitHub username
        const repoName = "dolphintools"; // Replace with your repository name
        const filePath = "dolphintuner.js"; // Path to the file in the repo
        const githubToken = process.env.GITHUB_TOKEN; // Use environment variable for GitHub PAT (optional for public repos)

        // Configure GitHub API base URL
        const githubApi = axios.create({
            baseURL: "https://api.github.com",
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "Authorization": githubToken ? `token ${githubToken}` : "", // Add token if private repo or rate limits
            },
        });

        // Fetch the latest commit for the repository
        const commitsResponse = await githubApi.get(`/repos/${repoOwner}/${repoName}/commits?path=${filePath}&per_page=1`);
        const latestCommit = commitsResponse.data[0];

        if (!latestCommit) {
            throw new Error("No commits found for dolphintuner.js");
        }

        // Fetch the content of the latest commit for dolphintuner.js
        const contentResponse = await githubApi.get(`/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${latestCommit.sha}`);
        const fileContent = Buffer.from(contentResponse.data.content, "base64").toString("utf8");

        // 1. Write the file to disk
        fs.writeFileSync("./dolphintuner.js", fileContent, "utf8");
        console.log(`Successfully wrote updated dolphintuner.js to disk`);

        // 2. Reload or restart the bot/module to apply the update
        // Clear the require cache for dolphintuner.js to reload the module
        if (require.cache[require.resolve("./dolphintuner.js")]) {
            delete require.cache[require.resolve("./dolphintuner.js")];
        }
        // Note: This reloads the module in memory, but for a full bot restart, you might need a system-level restart
        // or a custom reload mechanism depending on your bot framework (e.g., CassidyBot system)
        
        const updateMessage = `✔ Updated DolphinTuner to the latest version (Commit ${latestCommit.sha})\n` +
                            `Message: ${latestCommit.commit.message}\n` +
                            `Author: ${latestCommit.commit.author.name}\n` +
                            `Date: ${new Date(latestCommit.commit.author.date).toLocaleString()}\n` +
                            `View Commit: ${latestCommit.html_url}\n` +
                            `Ping: ${Date.now() - timeA}ms`;

        return output.reply(updateMessage);
    } catch (error) {
        console.log(`Error updating DolphinTuner: ${error.message}`);
        console.log(`Error stack:`, error.stack);
        return output.reply(
            `⚠️ Failed to update DolphinTuner: ${error.message}\n` +
            `Ping: ${Date.now() - timeA}ms`
        );
    }
}

/**
 * Handle the commit history command
 * @param {Object} ctx - Context object
 * @param {Object} output - Output object for replying
 * @param {number} timeA - Start time for ping calculation
 * @returns {Promise<void>}
 */
async function handleCommitHistory(ctx, output, timeA) {
    try {
        const repoOwner = "KimetsuAndrea"; // Replace with your GitHub username
        const repoName = "dolphintools"; // Replace with your repository name
        const githubToken = process.env.GITHUB_TOKEN; // Use environment variable for GitHub PAT (optional for public repos)

        // Configure GitHub API base URL
        const githubApi = axios.create({
            baseURL: "https://api.github.com",
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "Authorization": githubToken ? `token ${githubToken}` : "", // Add token if private repo or rate limits
            },
        });

        // Fetch the latest 5 commits for the repository (adjust per_page as needed)
        const commitsResponse = await githubApi.get(`/repos/${repoOwner}/${repoName}/commits?per_page=5`);
        const commits = commitsResponse.data;

        if (!commits.length) {
            throw new Error("No commits found for the repository");
        }

        const commitHistory = commits
            .map((commit, index) => 
                `➜ ${index + 1}. Commit ${commit.sha.substring(0, 7)} - ${commit.commit.message}\n` +
                `Author: ${commit.commit.author.name}\n` +
                `Date: ${new Date(commit.commit.author.date).toLocaleString()}\n` +
                `Link: ${commit.html_url}`
            )
            .join("\n\n");

        return output.reply(
            `📜 DolphinTuner Commit History (Latest 5 commits as of ${new Date().toLocaleString()}):\n\n${commitHistory}\n` +
            `Ping: ${Date.now() - timeA}ms`
        );
    } catch (error) {
        console.log(`Error fetching commit history: ${error.message}`);
        console.log(`Error stack:`, error.stack);
        return output.reply(
            `⚠️ Failed to fetch commit history: ${error.message}\n` +
            `Ping: ${Date.now() - timeA}ms`
        );
    }
}

export async function entry(ctx) {
    const timeA = Date.now();
    const { input, output, GameSimulator, args, money, commands, prefix, commandName } = ctx;
    const userData = await money.get(input.senderID);
    const tuneCost = 0; // As specified, cost is 0

    // Define the list of default simulator commands
    const defaultSimulatorCommands = ["beekeep", "plantita"]; // Default list for tuning actions

    const [sub] = args;

    if (!sub) {
        // Show command help if no subcommand is provided
        const helpText = `
${UNIRedux.arrow} Welcome to DolphinTuner™ 🐬
Available Actions:
${prefix}${commandName}-tune <all | simulator> - Automatically tunes three rarest items for all or a specific simulator
${prefix}${commandName}-list <all | simulator> - Lists rare items for all or a specific simulator
${prefix}${commandName}-reset <all | simulator> - Resets tuning data for all or a specific simulator
${prefix}${commandName}-update - Updates DolphinTuner code based on the latest GitHub commit (Admin-only)
${prefix}${commandName}-comH - Views the commit history or change logs from GitHub
Tune Cost: 💷${tuneCost.toLocaleString()}
Ping: ${Date.now() - timeA}ms
        `;
        return output.reply(helpText);
    }

    // Handle commands without <all | simulator> (update, comH)
    if (sub.toLowerCase() === "update") {
        return handleUpdate(ctx, output, timeA);
    } else if (sub.toLowerCase() === "comh") {
        return handleCommitHistory(ctx, output, timeA);
    }

    // Handle commands with <all | simulator> (tune, list, reset)
    const [action, target] = args;

    if (!action) {
        const items = [
            { name: "tune", icon: "🐬", desc: "Automatically tunes three rarest items for all or a specific simulator" },
            { name: "list", icon: "📜", desc: "Lists rare items for all or a specific simulator" },
            { name: "reset", icon: "🔄", desc: "Resets tuning data for all or a specific simulator" }
        ].map(i => `${prefix}${commandName}-${i.name} <all | simulator>\n[${i.icon} ${i.desc}]`).join("\n");
        return output.reply(
            `${UNIRedux.arrow} Welcome to DolphinTuner™ 🐬\n\n${items}\n` +
            `Tune Cost: 💷${tuneCost.toLocaleString()}\n` +
            `Ping: ${Date.now() - timeA}ms`
        );
    }

    // Determine simulator commands based on target (all or specific simulator)
    let simulatorCommands = defaultSimulatorCommands;
    if (target && target.toLowerCase() !== "all") {
        simulatorCommands = [target]; // Use only the specified simulator
    }

    const simulatorData = await initializeSimulators(ctx, simulatorCommands);
    const rareItems = Object.entries(simulatorData)
        .flatMap(([key, sim]) => {
            // Check if there are items with rarity > 15% (chance < 0.15)
            const hasHigherRarity = sim.itemData.some(item => item.chance <= 0.15);
            if (hasHigherRarity) {
                // Tune items with rarity <= 15% (chance <= 0.15)
                return sim.itemData
                    .filter(item => item.chance <= 0.15)
                    .map(item => ({ simKey: key, item }));
            } else {
                // If no items have rarity <= 15%, tune the three rarest items (lowest chance, including 0%)
                return sim.itemData
                    .sort((a, b) => a.chance - b.chance) // Sort by chance (ascending, largest to smallest rarity)
                    .slice(0, 3) // Take up to 3 items with lowest chance (highest rarity, including 0%)
                    .map(item => ({ simKey: key, item }));
            }
        })
        .filter(item => item); // Remove undefined entries

    const simulatorStates = Object.fromEntries(
        Object.entries(simulatorData).map(([key, val]) => {
            const {
                [key + "Stamp"]: actionStamp,
                [key + "MaxZ"]: actionMax = val.initialStorage,
                [key + "Total"]: totalItems = {},
                [key + "Tune"]: actionTune = [],
            } = userData || {};
            return [key, { actionStamp, actionMax, totalItems, actionTune }];
        })
    );

    const opts = [
        {
            name: "tune",
            icon: "🐬",
            desc: "Automatically tunes three rarest items (largest to smallest rarity, including 0% if no > 15% rarity) for specified or all simulators",
            async callback() {
                const { battlePoints = 0 } = userData || {};
                if (battlePoints < tuneCost) {
                    return output.reply(
                        `❌ Insufficient funds! You have **💷${battlePoints.toLocaleString()}**, need **💷${tuneCost.toLocaleString()}**`
                    );
                }

                if (!rareItems.length) {
                    return output.reply(`⚠️ No rare items found in ${target ? `simulator ${target}` : "specified simulators"}!`);
                }

                // Group rare items by simulator for per-simulator tuning
                const itemsBySimulator = {};
                rareItems.forEach(({ simKey, item }) => {
                    if (!itemsBySimulator[simKey]) itemsBySimulator[simKey] = [];
                    itemsBySimulator[simKey].push(item);
                });

                const updateData = { battlePoints: battlePoints - tuneCost };
                let totalTunedItems = 0;

                // Process each specified simulator
                for (const [simKey, items] of Object.entries(itemsBySimulator)) {
                    // Sort items by rarity (largest to smallest, highest rarity percentage = lowest chance)
                    const sortedItems = items.sort((a, b) => a.chance - b.chance); // Sort by chance (ascending, lowest chance first = largest rarity)
                    const availableItems = sortedItems.length;

                    // Ensure exactly 3 items are tuned, or all if fewer than 3 exist
                    const itemsToTune = sortedItems.slice(0, Math.min(3, availableItems));

                    if (itemsToTune.length > 0) {
                        updateData[simKey + "Tune"] = itemsToTune.map(item => item.name);
                        updateData[simKey + "Stamp"] = Date.now();
                        totalTunedItems += itemsToTune.length;
                    }
                }

                if (totalTunedItems === 0) {
                    return output.reply(`⚠️ No rare items available to tune automatically in ${target ? `simulator ${target}` : "specified simulators"}!`);
                }

                await money.set(input.senderID, updateData);

                const tunedList = Object.entries(itemsBySimulator).flatMap(([simKey, items]) => {
                    const sortedItems = items.sort((a, b) => a.chance - b.chance);
                    const itemsToTune = sortedItems.slice(0, Math.min(3, sortedItems.length));
                    return itemsToTune.map((item, index) => {
                        return `➜ ${index + 1}. ${item.icon} **${item.name}**`;
                    });
                }).join("\n");

                return output.reply(
                    `✔ Automatically tuned ${totalTunedItems} rare items in ${target ? `simulator ${target}` : "specified simulators"}!\n` +
                    `Cost: 💷${tuneCost.toLocaleString()}\n\n` +
                    `${tunedList}\n` +
                    `Ping: ${Date.now() - timeA}ms`
                );
            }
        },
        {
            name: "list",
            icon: "📜",
            desc: "Lists all rare items (largest to smallest rarity, including 0% if no > 15% rarity) available for tuning in specified or all simulators",
            async callback() {
                if (!rareItems.length) {
                    return output.reply(`⚠️ No rare items found in ${target ? `simulator ${target}` : "specified simulators"}!`);
                }

                const itemList = Object.entries(simulatorData).flatMap(([simKey, sim]) => {
                    // Check if there are items with rarity > 15% (chance < 0.15)
                    const hasHigherRarity = sim.itemData.some(item => item.chance <= 0.15);
                    const sortedItems = hasHigherRarity
                        ? sim.itemData
                            .filter(item => item.chance <= 0.15)
                            .sort((a, b) => a.chance - b.chance) // Sort by chance (ascending, largest to smallest rarity)
                        : sim.itemData
                            .sort((a, b) => a.chance - b.chance) // Sort all items by chance (ascending) if no > 15% rarity
                            .slice(0, 3); // Take up to 3 items with lowest chance (highest rarity, including 0%)

                    return sortedItems.map((item, index) => 
                        `➜ ${index + 1}. ${item.icon} **${item.name}** (From: ${simKey})\n` +
                        `Rarity: ${Math.round(100 - item.chance * 100)}%`
                    );
                }).join("\n");

                return output.reply(
                    `📜 Rare Items Available (${rareItems.length}) in ${target ? `simulator ${target}` : "specified simulators"} (Largest to Smallest Rarity):\n\n${itemList}\n\n` +
                    `Use ${prefix}${commandName}-tune ${target ? target : "all"} to automatically tune up to three rarest items`
                );
            }
        },
        {
            name: "reset",
            icon: "🔄",
            desc: "Resets tuning data for specified or all simulators",
            async callback() {
                const updateData = {};
                let totalResetItems = 0;

                // Process each specified simulator
                for (const simKey of simulatorCommands) {
                    const tuneKey = simKey + "Tune";
                    const stampKey = simKey + "Stamp";
                    if (userData[tuneKey] || userData[stampKey]) {
                        updateData[tuneKey] = [];
                        updateData[stampKey] = null;
                        totalResetItems += (userData[tuneKey]?.length || 0);
                    }
                }

                if (totalResetItems === 0) {
                    return output.reply(`⚠️ No tuning data to reset in ${target ? `simulator ${target}` : "specified simulators"}!`);
                }

                await money.set(input.senderID, { ...userData, ...updateData });

                return output.reply(
                    `✔ Reset ${totalResetItems} tuned items in ${target ? `simulator ${target}` : "specified simulators"}!\n` +
                    `Ping: ${Date.now() - timeA}ms`
                );
            }
        },
        {
            name: "update",
            icon: "🔄",
            desc: "Updates DolphinTuner code based on the latest GitHub commit (Admin-only)",
            async callback() {
                // Check if user is a bot admin (permissions level 1 or higher)
                if (!ctx.input.isAdmin) {
                    return output.reply(
                        `⚠️ Only bot admins can use ${ctx.prefix}${ctx.commandName}-update!\n` +
                        `Ping: ${Date.now() - timeA}ms`
                    );
                }

                try {
                    const repoOwner = "KimetsuAndrea"; // Replace with your GitHub username
                    const repoName = "dolphintools"; // Replace with your repository name
                    const filePath = "dolphintuner.js"; // Path to the file in the repo
                    const githubToken = process.env.GITHUB_TOKEN; // Use environment variable for GitHub PAT (optional for public repos)

                    // Configure GitHub API base URL
                    const githubApi = axios.create({
                        baseURL: "https://api.github.com",
                        headers: {
                            "Accept": "application/vnd.github.v3+json",
                            "Authorization": githubToken ? `token ${githubToken}` : "", // Add token if private repo or rate limits
                        },
                    });

                    // Fetch the latest commit for the repository
                    const commitsResponse = await githubApi.get(`/repos/${repoOwner}/${repoName}/commits?path=${filePath}&per_page=1`);
                    const latestCommit = commitsResponse.data[0];

                    if (!latestCommit) {
                        throw new Error("No commits found for dolphintuner.js");
                    }

                    // Fetch the content of the latest commit for dolphintuner.js
                    const contentResponse = await githubApi.get(`/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${latestCommit.sha}`);
                    const fileContent = Buffer.from(contentResponse.data.content, "base64").toString("utf8");

                    // 1. Write the file to disk
                    fs.writeFileSync("./dolphintuner.js", fileContent, "utf8");
                    console.log(`Successfully wrote updated dolphintuner.js to disk`);

                    // 2. Reload or restart the bot/module to apply the update
                    // Clear the require cache for dolphintuner.js to reload the module
                    if (require.cache[require.resolve("./dolphintuner.js")]) {
                        delete require.cache[require.resolve("./dolphintuner.js")];
                    }

                    // Attempt to reload the module dynamically
                    try {
                        // Reload the module
                        const updatedModule = require("./dolphintuner.js");
                        // Optionally, you can reinitialize or rebind the command if your bot system supports it
                        console.log("DolphinTuner module reloaded successfully");
                    } catch (reloadError) {
                        console.log(`Error reloading DolphinTuner module: ${reloadError.message}`);
                        console.log(`Error stack:`, reloadError.stack);
                        // Fallback: Warn user but proceed with success message
                        return output.reply(
                            `✔ Updated DolphinTuner to the latest version (Commit ${latestCommit.sha}), but module reload failed: ${reloadError.message}\n` +
                            `Message: ${latestCommit.commit.message}\n` +
                            `Author: ${latestCommit.commit.author.name}\n` +
                            `Date: ${new Date(latestCommit.commit.author.date).toLocaleString()}\n` +
                            `View Commit: ${latestCommit.html_url}\n` +
                            `Ping: ${Date.now() - timeA}ms`
                        );
                    }

                    const updateMessage = `✔ Updated DolphinTuner to the latest version (Commit ${latestCommit.sha})\n` +
                                        `Message: ${latestCommit.commit.message}\n` +
                                        `Author: ${latestCommit.commit.author.name}\n` +
                                        `Date: ${new Date(latestCommit.commit.author.date).toLocaleString()}\n` +
                                        `View Commit: ${latestCommit.html_url}\n` +
                                        `Ping: ${Date.now() - timeA}ms`;

                    return output.reply(updateMessage);
                } catch (error) {
                    console.log(`Error updating DolphinTuner: ${error.message}`);
                    console.log(`Error stack:`, error.stack);
                    return output.reply(
                        `⚠️ Failed to update DolphinTuner: ${error.message}\n` +
                        `Ping: ${Date.now() - timeA}ms`
                    );
                }
            }
        },
        {
            name: "comh",
            icon: "📜",
            desc: "Views the commit history or change logs from GitHub",
            async callback() {
                try {
                    const repoOwner = "KimetsuAndrea"; // Replace with your GitHub username
                    const repoName = "dolphintools"; // Replace with your repository name
                    const githubToken = process.env.GITHUB_TOKEN; // Use environment variable for GitHub PAT (optional for public repos)

                    // Configure GitHub API base URL
                    const githubApi = axios.create({
                        baseURL: "https://api.github.com",
                        headers: {
                            "Accept": "application/vnd.github.v3+json",
                            "Authorization": githubToken ? `token ${githubToken}` : "", // Add token if private repo or rate limits
                        },
                    });

                    // Fetch the latest 5 commits for the repository (adjust per_page as needed)
                    const commitsResponse = await githubApi.get(`/repos/${repoOwner}/${repoName}/commits?per_page=5`);
                    const commits = commitsResponse.data;

                    if (!commits.length) {
                        throw new Error("No commits found for the repository");
                    }

                    const commitHistory = commits
                        .map((commit, index) => 
                            `➜ ${index + 1}. Commit ${commit.sha.substring(0, 7)} - ${commit.commit.message}\n` +
                            `Author: ${commit.commit.author.name}\n` +
                            `Date: ${new Date(commit.commit.author.date).toLocaleString()}\n` +
                            `Link: ${commit.html_url}`
                        )
                        .join("\n\n");

                    return output.reply(
                        `📜 DolphinTuner Commit History (Latest 5 commits as of ${new Date().toLocaleString()}):\n\n${commitHistory}\n` +
                        `Ping: ${Date.now() - timeA}ms`
                    );
                } catch (error) {
                    console.log(`Error fetching commit history: ${error.message}`);
                    console.log(`Error stack:`, error.stack);
                    return output.reply(
                        `⚠️ Failed to fetch commit history: ${error.message}\n` +
                        `Ping: ${Date.now() - timeA}ms`
                    );
                }
            }
        }
    ];

    const handler = opts.find(i => i.name === sub.toLowerCase());

    if (!handler) {
        const items = opts.map(i => {
            if (i.name === "update" || i.name === "comh") {
                return `${prefix}${commandName}-${i.name}\n[${i.icon} ${i.desc}]`;
            }
            return `${prefix}${commandName}-${i.name} <all | simulator>\n[${i.icon} ${i.desc}]`;
        }).join("\n");
        return output.reply(
            `${UNIRedux.arrow} Welcome to DolphinTuner™ 🐬\n\n${items}\n` +
            `Tune Cost: 💷${tuneCost.toLocaleString()}\n` +
            `Ping: ${Date.now() - timeA}ms`
        );
    }

    return handler.callback();
}