import axios from "axios"; // For GitHub API calls
import { writeFile, mkdir } from 'fs/promises'; // For file operations
import { existsSync } from 'fs'; // To check directory existence
import { join } from 'path'; // For path handling
import { ReduxCMDHome } from "../modules/reduxCMDHome.js"; // Adjust path as needed
export class style {
  title = {
    text_font: "bold",
    content: "Test",
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
export async function entry(ctx) {
    const { input, output, prefix, args, commands } = ctx;
    output.reply('success')
}