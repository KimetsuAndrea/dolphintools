import { UNIRedux } from "../modules/unisym.js";
import axios from "axios"; // Import axios for GitHub API calls
const fs = require("fs"); // Import fs for file operations
import { ReduxCMDHome } from "../modules/reduxCMDHome.js"; // Import ReduxCMDHome for subcommand handling
export class style {
  title = {
    text_font: "bold",
    content: "DolphinToolKit 🐬",
    line_bottom: "default",
  };
  content = {
    text_font: "none",
    content: null,
  };
}
export const meta = {
    name: "dolphintuner",
    description: "Manages tuning, listing, resetting, updating (admin-only), and viewing commit history for game simulators.",
    author: "Grok 3 || xAI || Liane || Nica || MrkimstersDev",
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

const closeTexts = [
    "The dolphins are sleeping now! Come back later when they're ready to play! Opens Only 5:30pm to 6pm! ",
    "Shop's closed! The dolphins swam off for a lunch break! Opens Only 5:30pm to 6pm!",
    "Sorry, friend! Our fins are tied up until later today! Opens Only 5:30pm to 6pm!",
    "The tide's out! Check back when the dolphins ride the waves again! Opens Only 5:30pm to 6pm!",
    "Dolphin HQ is napping! Return when the sun's higher in the sky! Opens Only 5:30pm to 6pm!",
    "We're on a fish-finding mission! Back soon—swim by later! Opens Only 5:30pm to 6pm!",
    "Closed for a splash break! Catch us when the water’s warm again! Opens Only 5:30pm to 6pm!",
    "The dolphins are practicing their flips—see you when the show’s ready! Opens Only 5:30pm to 6pm!"
];

const defaultSimulatorCommands = ["plantita", "resto", "harvest", "beekeep", "chop", "cook", "garden", "brew", "farm", "minecraft", "trawl", "dig", "treasure", "explorer", "deepseadiver", "wizardsforge"];

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
 * @returns {Promise<void>}
 */
async function handleUpdate(ctx, output) {
    const { input, money } = ctx;
    const userData = await money.get(input.senderID) || {};

    // Check if user is a bot admin (permissions level 1 or higher)
    if (!input.isAdmin) {
        return output.reply(
            `⚠️ Only bot admins can use +${ctx.prefix}${ctx.commandName}-update!`
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
                `View Commit: ${latestCommit.html_url}`
            );
        }

        const updateMessage = `✔ Updated DolphinTuner to the latest version (Commit ${latestCommit.sha})\n` +
                            `Message: ${latestCommit.commit.message}\n` +
                            `Author: ${latestCommit.commit.author.name}\n` +
                            `Date: ${new Date(latestCommit.commit.author.date).toLocaleString()}\n` +
                            `View Commit: ${latestCommit.html_url}`;

        return output.reply(updateMessage);
    } catch (error) {
        console.log(`Error updating DolphinTuner: ${error.message}`);
        console.log(`Error stack:`, error.stack);
        return output.reply(
            `⚠️ Failed to update DolphinTuner: ${error.message}`
        );
    }
}

/**
 * Handle the commit history command
 * @param {Object} ctx - Context object
 * @param {Object} output - Output object for replying
 * @returns {Promise<void>}
 */
async function handleCommitHistory(ctx, output) {
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
            `📜 DolphinTuner Commit History (Latest 5 commits as of ${new Date().toLocaleString()}):\n\n${commitHistory}`
        );
    } catch (error) {
        console.log(`Error fetching commit history: ${error.message}`);
        console.log(`Error stack:`, error.stack);
        return output.reply(
            `⚠️ Failed to fetch commit history: ${error.message}`
        );
    }
}

/**
 * Helper function to format simulator commands based on target
 * @param {string} target - Target simulator or "all"
 * @returns {string[]} List of simulator commands
 */
function getSimulatorCommands(target, defaultSimulatorCommands) {
    return target && target.toLowerCase() !== "all" ? [target] : defaultSimulatorCommands;
}

/**
 * Helper function to find the closest matching simulator name
 * @param {string} input - User input to match
 * @param {string[]} simulators - Array of valid simulator names
 * @returns {string|null} Closest match or null if no close match
 */
function findClosestMatch(input, simulators) {
    if (!input || typeof input !== 'string') return null;
    input = input.toLowerCase().trim();
    let closestMatch = null;
    let minDistance = Infinity;

    for (const simulator of simulators) {
        const distance = levenshteinDistance(input, simulator.toLowerCase());
        if (distance < minDistance) {
            minDistance = distance;
            closestMatch = simulator;
        }
    }

    // Consider a match "close" if the Levenshtein distance is <= 2 (configurable threshold)
    return minDistance <= 2 ? closestMatch : null;
}

/**
 * Helper function to calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Levenshtein distance
 */
function levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1).fill(null)
        .map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = a[j - 1] === b[i - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, // Deletion
                matrix[i][j - 1] + 1, // Insertion
                matrix[i - 1][j - 1] + cost // Substitution
            );
        }
    }

    return matrix[b.length][a.length];
}

export async function entry(ctx) {
    const { input, output, GameSimulator, args, money, commands, prefix, commandName, isTimeAvailable, userData } = ctx;

    // Time availabilitisTimeAvailable to 6:00 PM)
    const a = (17 * 60 + 30) * 60 * 1000; // 5:30 PM in milliseconds
    const b = 18 * 60 * 60 * 1000; // 6:00 PM in milliseconds
    let isAvailable = isTimeAvailable(a, b);

    if (!isAvailable) {
        return output.reply(`✦ ${
            closeTexts[Math.floor(Math.random() * closeTexts.length)]
        }\n\n**Try again later!**`);
    }
    
    const home = new ReduxCMDHome(
        {
            isHypen: true, // Enable hyphen-based subcommands (e.g., -tune, -list)
        },
        [
            {
                key: "tune",
                description: "Automatically tunes three rarest items for all or a specific simulator",
                aliases: ["-tune"], // Add hyphen alias for consistency
                args: ["<all | simulator>"], // Expect <all | simulator> as an argument
                async handler() {
    if (!ctx.input.isAdmin) {
      if (args[0]?.toLowerCase() === "all") {
            return output.reply('❌ Only admins can use the "all" command!');
        }
                    }

    const target = args[0] || "all"; // Get the target from args (default to "all")
    
    // Check if target is valid or find closest match
    if (target.toLowerCase() !== "all") {
        const normalizedTarget = target.toLowerCase();
        const isValidSimulator = defaultSimulatorCommands.includes(normalizedTarget);
        if (!isValidSimulator) {
            const closestMatch = findClosestMatch(normalizedTarget, defaultSimulatorCommands);
            if (closestMatch) {
                return output.reply(
                    `⚠️ Game simulator "${target}" not found!\n` +
                    `Did you mean "${closestMatch.charAt(0).toUpperCase() + closestMatch.slice(1).toLowerCase()}"?`
                );
            } else {
                return output.reply(
                    `⚠️ Game simulator "${target}" not found!`
                );
            }
        }
    }

    const simulatorCommands = getSimulatorCommands(target, defaultSimulatorCommands);

    const simulatorData = await initializeSimulators(ctx, simulatorCommands);
    const rareItems = Object.entries(simulatorData)
        .flatMap(([key, sim]) => {
            const hasHigherRarity = sim.itemData.some(item => item.chance > 0);
            if (hasHigherRarity) {
                return sim.itemData
                    .filter(item => item.chance >= 0 && item.chance <= 1)
                    .sort((a, b) => a.chance - b.chance)
                    .slice(0, 3)
                    .map(item => ({ simKey: key, item }));
            } else {
                return sim.itemData
                    .sort((a, b) => a.chance - b.chance)
                    .slice(0, 3)
                    .map(item => ({ simKey: key, item }));
            }
        })
        .filter(item => item);

    const { battlePoints = 0 } = userData || {};
    if (battlePoints < tuneCost) {
        return output.reply(
            `❌ Insufficient funds! You have **💷${battlePoints.toLocaleString()}**, need **💷${tuneCost.toLocaleString()}**`
        );
    }

    if (!rareItems.length) {
        return output.reply(`⚠️ No rare items found in ${target === "all" ? "specified simulators" : `simulator ${target}`}!`);
    }

    const itemsBySimulator = {};
    rareItems.forEach(({ simKey, item }) => {
        if (!itemsBySimulator[simKey]) itemsBySimulator[simKey] = [];
        itemsBySimulator[simKey].push(item);
    });

    const updateData = { battlePoints: battlePoints - tuneCost };
    let totalTunedItems = 0;

    for (const [simKey, items] of Object.entries(itemsBySimulator)) {
        const sortedItems = items.sort((a, b) => a.chance - b.chance);
        const itemsToTune = sortedItems.slice(0, Math.min(3, sortedItems.length));

        if (itemsToTune.length > 0) {
            updateData[simKey + "Tune"] = itemsToTune.map(item => item.name);
            updateData[simKey + "Stamp"] = Date.now();
            totalTunedItems += itemsToTune.length;
        }
    }

    if (totalTunedItems === 0) {
        return output.reply(`⚠️ No rare items available to tune automatically in ${target === "all" ? "specified simulators" : `simulator ${target}`}!`);
    }

    const isAlreadyTuned = simulatorCommands.some(simKey => {
        const tuneKey = simKey + "Tune";
        return userData[tuneKey] && userData[tuneKey].length > 0;
    });
    let i;
    if (isAlreadyTuned) {
        const message = `You already tuned this Game, to proceed try to react 👍 in this message`;
        const z = await output.quickWaitReact(message, {
            authorOnly: true,
            emoji: "👍",
        });
        i = z.self;
        if (!z.self) {
            return output.edit(`❌ Action cancelled. No 👍 reaction received from the author.`, i.messageID);
        }
    }
    await money.set(input.senderID, updateData);

    const tunedOutput = Object.entries(itemsBySimulator).map(([simKey, items]) => {
        const sortedItems = items.sort((a, b) => a.chance - b.chance);
        const itemsToTune = sortedItems.slice(0, Math.min(3, sortedItems.length));
        const itemList = itemsToTune.map((item, index) => 
            `\n➜ ${index + 1}. ${item.icon} **${item.name}**`
        ).join("");
        return `${simKey.charAt(0).toUpperCase() + simKey.slice(1).toLowerCase()}:${itemList}`;
    }).join("\n\n");

    if (i) {
        await output.edit(`🔃 | Proceeding with tuning...`, i.messageID);
        setTimeout(async () => {
            return await output.edit(
                `✔ Automatically tune ${totalTunedItems} rare items in ${target === "all" ? "specified simulators" : `simulator ${target}`}!\n` +
                `Cost: 💷${tuneCost.toLocaleString()}\n\n` +
                `${tunedOutput}`, i.messageID
            );
        }, 2000);
    } else {
        return output.reply(
            `✔ Automatically tune ${totalTunedItems} rare items in ${target === "all" ? "specified simulators" : `simulator ${target}`}!\n` +
            `Cost: 💷${tuneCost.toLocaleString()}\n\n` +
            `${tunedOutput}`
        );
    }
}
            },
            {
                key: "list",
                description: "Lists all rare items for all or a specific simulator",
                aliases: ["-list"], // Add hyphen alias for consistency
                args: ["<all | simulator>"], // Expect <all | simulator> as an argument
                async handler() {
                    const target = args[0] || "all"; // Get the target from args (default to "all")
                    const simulatorCommands = getSimulatorCommands(target, defaultSimulatorCommands);

                    const simulatorData = await initializeSimulators(ctx, simulatorCommands);
                    const rareItems = Object.entries(simulatorData)
                        .flatMap(([key, sim]) => {
                            const hasHigherRarity = sim.itemData.some(item => item.chance <= 0.15);
                            const sortedItems = hasHigherRarity
                                ? sim.itemData.filter(item => item.chance <= 0.15).sort((a, b) => a.chance - b.chance)
                                : sim.itemData.sort((a, b) => a.chance - b.chance).slice(0, 3);
                            return sortedItems.map(item => ({ simKey: key, item }));
                        })
                        .filter(item => item);

                    if (!rareItems.length) {
                        return output.reply(`⚠️ No rare items found in ${target === "all" ? "specified simulators" : `simulator ${target}`}!`);
                    }

                    // Format the response for each simulator with the new line style
                    const itemList = Object.entries(simulatorData).map(([simKey, sim]) => {
                        const hasHigherRarity = sim.itemData.some(item => item.chance <= 0.15);
                        const sortedItems = hasHigherRarity
                            ? sim.itemData.filter(item => item.chance <= 0.15).sort((a, b) => a.chance - b.chance)
                            : sim.itemData.sort((a, b) => a.chance - b.chance).slice(0, 3);
                        const itemsOutput = sortedItems.map((item, index) => 
                            `\n➜ ${index + 1}. ${item.icon} **${item.name}**\n` +
                            `Rarity: ${Math.round(100 - item.chance * 100)}%`
                        ).join("");
                        return `${simKey.charAt(0).toUpperCase() + simKey.slice(1).toLowerCase()}:${itemsOutput}`;
                    }).join("\n\n");

                    return output.reply(
                        `📜 Rare Items Available (${rareItems.length}) in ${target === "all" ? "specified simulators" : `simulator ${target}`} (Largest to Smallest Rarity):\n\n${itemList}\n\n` +
                        `Use +${prefix}${commandName}-tune ${target === "all" ? "all" : target} to automatically tune up to three rarest items`
                    );
                }
            },
            {
                key: "reset",
                description: "Resets tuning data for all or a specific simulator",
                aliases: ["-reset"], // Add hyphen alias for consistency
                args: ["<all | simulator>"], // Expect <all | simulator> as an argument
                async handler() {
                    const target = args[0] || "all"; // Get the target from args (default to "all")
                    const simulatorCommands = getSimulatorCommands(target, defaultSimulatorCommands);

                    const updateData = {};
                    let totalResetItems = 0;

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
                        return output.reply(`⚠️ No tuning data to reset in ${target === "all" ? "specified simulators" : `simulator ${target}`}!`);
                    }

                    await money.set(input.senderID, { ...userData, ...updateData });

                    return output.reply(
                        `✔ Reset ${totalResetItems} tuned items in ${target === "all" ? "specified simulators" : `simulator ${target}`}!`
                    );
                }
            },
            {
                key: "comh",
                description: "Views the commit history or change logs from GitHub",
                aliases: ["-comh"], // Add hyphen alias for consistency
                async handler() {
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
                            `📜 DolphinTuner Commit History (Latest 5 commits as of ${new Date().toLocaleString()}):\n\n${commitHistory}`
                        );
                    } catch (error) {
                        console.log(`Error fetching commit history: ${error.message}`);
                        console.log(`Error stack:`, error.stack);
                        return output.reply(
                            `⚠️ Failed to fetch commit history: ${error.message}`
                        );
                    }
                }
            }
        ]
    );

    home.runInContext(ctx);
}
