# HackMD MCP Server
[![smithery badge](https://smithery.ai/badge/@yuna0x0/hackmd-mcp)](https://smithery.ai/server/@yuna0x0/hackmd-mcp)

This is a Model Context Protocol (MCP) server for interacting with the [HackMD API](https://hackmd.io/@hackmd-api/developer-portal). It allows AI assistants to perform operations such as:

- Get user information
- List user's notes
- Create, read, update, and delete notes
- View read history
- Work with team notes

## Requirements

- Node.js 18+

## Environment Variables

- `HACKMD_API_TOKEN`: **[Required]** Your HackMD API token
- `HACKMD_API_URL`: (Optional) HackMD API Endpoint URL. Default: `https://api.hackmd.io/v1`

You can get an API token from [HackMD settings](https://hackmd.io/settings#api).

## Install to Claude Desktop (or other MCP clients)

### Installing via Smithery

To install HackMD MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@yuna0x0/hackmd-mcp):

```bash
npx -y @smithery/cli install @yuna0x0/hackmd-mcp --client claude

# For other MCP clients, use the following command:
# List available clients
npx -y @smithery/cli list clients
# Install to other clients
npx -y @smithery/cli install @yuna0x0/hackmd-mcp --client <client_name>
```

### Installing via mcp-get

```bash
npx @michaellatman/mcp-get@latest install hackmd-mcp
```

### Manual Installation

1. Add this server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hackmd": {
      "command": "npx",
      "args": ["-y", "hackmd-mcp"],
      "env": {
        "HACKMD_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

2. Restart Claude Desktop
3. Use the tools to interact with your HackMD account

## Available Tools

### User API
- **get_user_info**: Get information about the authenticated user

### User Notes API
- **list_user_notes**: List all notes owned by the user
- **get_note**: Get a note by its ID
- **create_note**: Create a new note
- **update_note**: Update an existing note
- **delete_note**: Delete a note
- **get_history**: Get user's reading history

### Teams API
- **list_teams**: List all teams accessible to the user

### Team Notes API
- **list_team_notes**: List all notes in a team
- **create_team_note**: Create a new note in a team
- **update_team_note**: Update an existing note in a team
- **delete_team_note**: Delete a note in a team

## Example Usage

```
Can you help me manage my HackMD notes?
```

Then use commands like:

```
Please list all my notes.
```

## Local Development

This project uses [Bun](https://bun.sh) as its package manager. You should install it if you haven't already.

Clone the repository and install dependencies:

```bash
git clone https://github.com/yuna0x0/hackmd-mcp.git
cd hackmd-mcp
bun install
```

### Configuration

1. Create a `.env` file by copying the example:
```bash
cp .env.example .env
```

2. Edit the `.env` file and add your HackMD API token:
```
HACKMD_API_TOKEN=your_api_token
```

## Debugging with MCP Inspector

You can use the MCP Inspector to test and debug the HackMD MCP server:

```bash
npx @modelcontextprotocol/inspector -e HACKMD_API_TOKEN=your_api_token npx hackmd-mcp

# Use this instead when Local Development
bun run inspector
```

Then open your browser to the provided URL (usually http://localhost:5173) to access the MCP Inspector interface. From there, you can:

1. Connect to your running HackMD MCP server
2. Browse available tools
3. Run tools with custom parameters
4. View the responses

This is particularly useful for testing your setup before connecting it to Claude or another AI assistant.

## Docker

Pull from Docker Hub:
```bash
docker pull yuna0x0/hackmd-mcp
```

Docker build (Local Development):
```bash
docker build -t yuna0x0/hackmd-mcp .
```

## Security Notice

This MCP server requires your HackMD API token in the .env file or as an environment variable. Keep this information secure and never commit it to version control.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
