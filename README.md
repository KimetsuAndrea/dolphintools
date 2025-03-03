# Dolphin Tools for Cassidy Bot 🐬

Welcome to **Dolphin Tools**, a suite of utilities designed to enhance the *Cassidy Bot* with command management features. Built with a dolphin-inspired theme, these tools allow admins to install, update, list, search, and get info on commands sourced from a GitHub repository, all integrated into the bot's command system.

This project is powered by [xAI's Grok](https://x.ai) and crafted for seamless use within Cassidy Bot's framework.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Dolphin Tools is built to streamline command management for Cassidy Bot. The core component, \`dolphinmenu.js\`, uses \`ReduxCMDHome\` to provide a robust interface for admins (permission level 2) to manage \`.js\` command files. Commands are fetched from a GitHub repository (\`KimetsuAndrea/dolphintools\`) and stored locally in \`CommandFiles/commands/\`, making it easy to extend the bot's functionality.

The project emphasizes:
- **Admin Control:** Restricted to permission level 2 users for security.
- **GitHub Integration:** Pulls commands directly from a centralized repo.
- **Dolphin Theme:** A playful, aquatic vibe with \`🐬\` flair.

---

## Features

- **Install Commands:** Download and install \`.js\` command files from GitHub into the bot.
- **Update Commands:** Refresh existing commands with the latest versions from the repo.
- **List Commands:** View all available \`.js\` files in the repository.
- **Search Commands:** Find commands by keyword for quick discovery.
- **Command Info:** Retrieve metadata (description, author, version) for any command file.

---

## Installation

### Prerequisites
- **Node.js**: v16 or higher.
- **Cassidy Bot**: A running instance with \`ReduxCMDHome\` module installed.
- **GitHub Token** (optional): For private repos or higher rate limits, set \`GITHUB_TOKEN\` in your environment.

### Steps
1. **Clone the Repository** (if applicable):
   ```bash
   git clone https://github.com/KimetsuAndrea/dolphintools.git
   cd dolphintools
   ```
   *Note:* If the repo is private, use your GitHub credentials or token.

2. **Install Dependencies**:
   Ensure \`axios\` and file system modules are available:
   ```bash
   npm install axios
   ```

3. **Place \`dolphinmenu.js\`**:
   Move \`dolphinmenu.js\` to your bot’s command directory (e.g., outside \`CommandFiles/commands/\` initially):
   ```bash
   cp dolphinmenu.js /path/to/cassidy-bot/commands/
   ```

4. **Configure Cassidy Bot**:
   - Ensure the bot loads commands from \`CommandFiles/commands/\`.
   - Verify \`ReduxCMDHome\` is accessible at \`../modules/reduxCMDHome.js\` (adjust path as needed).

5. **Set Environment Variables** (optional):
   Create a \`.env\` file or set the GitHub token:
   ```bash
   GITHUB_TOKEN=your_personal_access_token
   ```

6. **Run the Bot**:
   Start Cassidy Bot as usual. Dolphin Tools will be available via the \`+dolphinmenu\` command.

---

## Usage

Once installed, admins (permission level 2) can use Dolphin Tools via the bot’s prefix (assumed \`+\`). The commands are:

### Commands
| Command                       | Description                                      | Example                              |
|-------------------------------|--------------------------------------------------|--------------------------------------|
| \`+dolphinmenu -install <file>\`| Installs a \`.js\` command file from GitHub       | \`+dolphinmenu -install dolphinTuner.js\` |
| \`+dolphinmenu -update <file>\` | Updates a local command to the latest version   | \`+dolphinmenu -update dolphinTuner.js\`  |
| \`+dolphinmenu -list\`          | Lists all \`.js\` files in the GitHub repo        | \`+dolphinmenu -list\`             |
| \`+dolphinmenu -search <keyword>\` | Searches for commands by keyword             | \`+dolphinmenu -search tuner\`     |
| \`+dolphinmenu -info <file>\`   | Shows metadata for a command file              | \`+dolphinmenu -info dolphinTuner.js\` |

*Note:* Invalid subcommands (e.g., \`+dolphinmenu -foo\`) will not trigger a default response—behavior depends on \`ReduxCMDHome\`.

---

## Configuration

### Repository Details
Edit these constants in \`dolphinmenu.js\`:
- \`repoOwner\`: Your GitHub username (e.g., \`"KimetsuAndrea"\`).
- \`repoName\`: Your repository name (e.g., \`"dolphintools"\`).
- \`commandDir\`: Local storage path (default: \`"CommandFiles/commands/"\`).
- \`repoCommandPath\`: GitHub repo path (default: \`""\` for root directory).

### Permissions
- Set to \`[2]\` (admin-only) by default. Adjust in \`meta.permissions\` if needed (e.g., \`[0]\` for public access to some subcommands).

### Path Adjustments
- Update the import for \`ReduxCMDHome\` (e.g., \`../modules/reduxCMDHome.js\`) to match your bot’s structure.

---

## Contributing

We welcome contributions to Dolphin Tools! To get started:

1. **Fork the Repository**:
   Fork \`KimetsuAndrea/dolphintools\` on GitHub.

2. **Make Changes**:
   - Add new subcommands to \`dolphinmenu.js\`.
   - Enhance error handling or add new features (e.g., command versioning).

3. **Submit a Pull Request**:
   - Describe your changes in the PR.
   - Ensure code follows the dolphin theme (\`🐬\`) and Cassidy Bot conventions.

4. **Contact**:
   Reach out to the maintainers (e.g., **Liane Cagara**, **Symer [ MrkimstersDev ]**, **Delfin**, ) via Cassidy Bot’s community if needed.

---

## License

This project is unlicensed by default—feel free to use and modify it for Cassidy Bot. For formal licensing, consider adding a \`LICENSE\` file (e.g., MIT License) if distributing publicly.

---

*Built with 🐬 love by Grok 3 and the xAI team for Cassidy Bot, March 2025.*
