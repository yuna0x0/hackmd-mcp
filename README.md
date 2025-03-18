# HackMD MCP Server

This is a Model Context Protocol (MCP) server for interacting with the HackMD API. It allows AI assistants to perform operations such as:

- Get user information
- List user's notes
- Create, read, update, and delete notes
- View read history
- Work with team notes

## Installation

Clone the repository and install dependencies with Bun:

```bash
git clone https://github.com/yourusername/hackmd-mcp.git
cd hackmd-mcp
bun install
```

## Configuration

### Option 1: Using a .env file

1. Create a `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your HackMD API token:
   ```
   HACKMD_API_TOKEN=your_api_token_here
   ```

### Option 2: Using environment variables inline

You can also provide the API token directly when running the server:

```bash
HACKMD_API_TOKEN=your_api_token_here bun start
```

You can get an API token from [HackMD settings](https://hackmd.io/settings#api).

## Requirements

- Bun (or Node.js 18+)
- HackMD API token

## Usage

### Start the MCP server

#### Local installation:

```bash
bun start
```

#### Using bunx (without cloning):

```bash
HACKMD_API_TOKEN=your_token_here bunx hackmd-mcp
```

### Debugging with MCP Inspector

You can use the MCP Inspector to test and debug the HackMD MCP server:

```bash
# Using a local installation
npx @modelcontextprotocol/inspector bun run index.ts

# With environment variables
npx @modelcontextprotocol/inspector -e HACKMD_API_TOKEN=your_token_here bun run index.ts

# Using bunx
npx @modelcontextprotocol/inspector bunx hackmd-mcp
```

Then open your browser to the provided URL (usually http://localhost:5173) to access the MCP Inspector interface. From there, you can:

1. Connect to your running HackMD MCP server
2. Browse available tools
3. Run tools with custom parameters
4. View the responses

This is particularly useful for testing your setup before connecting it to Claude or another AI assistant.

### Using with Claude Desktop or other MCP clients

1. Add this server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hackmd": {
      "command": "bun",
      "args": ["run", "/path/to/hackmd-mcp/index.ts"]
    }
  }
}
```

2. Restart Claude Desktop
3. Use the tools to interact with your HackMD account

## Available Tools

- **get_user_info**: Get information about the authenticated user
- **list_user_notes**: List all notes owned by the user
- **get_note**: Get a specific note by ID
- **create_note**: Create a new note
- **update_note**: Update an existing note
- **delete_note**: Delete a note
- **get_history**: View reading history
- **list_teams**: List available teams
- **list_team_notes**: List notes in a team

## Example Usage in Claude

```
Can you help me manage my HackMD notes?
```

Then use commands like:

```
Please list all my notes.
```

## Security Notice

This MCP server requires your HackMD API token in the .env file or as an environment variable. Keep this information secure and never commit it to version control.

## Building

To build a standalone version of the server:

```bash
bun run build
```

This will create a build in the `dist` directory.
