# HackMD MCP Server

A Model Context Protocol (MCP) server that interfaces with the [HackMD API](https://hackmd.io/@hackmd-api/developer-portal), allowing LLM clients to access and interact with HackMD notes, teams, user profiles, and history data.

## Features

- Get user profile information
- Create, read, update, and delete notes
- Manage team notes and collaborate with team members
- Access reading history
- List and manage teams
- **Dual transport support**: Both HTTP and STDIO transports
- **Cloud deployment ready**: Support Smithery and other platforms

## Requirements

- Node.js 18+

## Local Installation (STDIO Transport)

### Installing via Smithery

```bash
npx -y @smithery/cli install @yuna0x0/hackmd-mcp --client claude

# For other MCP clients:
npx -y @smithery/cli list clients
npx -y @smithery/cli install @yuna0x0/hackmd-mcp --client <client_name>
```

### Installing via mcp-get

```bash
npx @michaellatman/mcp-get@latest install hackmd-mcp
```

### Manual Installation

1. Add this server to your `mcp.json` / `claude_desktop_config.json`:

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

You may also optionally set the `HACKMD_API_URL` environment variable if you need to use a different HackMD API endpoint.

2. Restart your MCP client (e.g., Claude Desktop)
3. Use the tools to interact with HackMD

## Server Deployment (HTTP Transport)

### Self-Hosting
Follow the [Local Development](#local-development) instructions to set up the project locally, then run:
```bash
pnpm run start:http
```
This will start the server on port 8081 by default. You can change the port by setting the `PORT` environment variable.

### Cloud Deployment

You can deploy this MCP server to any cloud platform that supports Node.js server applications.

You can also deploy via MCP platforms like [Smithery](https://smithery.ai/server/@yuna0x0/hackmd-mcp).

## Configuration
### Environment Variables (STDIO Transport and HTTP Transport server where host provides the config)

When using the STDIO transport or hosting the HTTP transport server, you can pass configuration via environment variables:
- `HACKMD_API_TOKEN`: HackMD API Token (Required for all operations)
- `HACKMD_API_URL`: (Optional) HackMD API URL (Defaults to https://api.hackmd.io/v1)

> [!CAUTION]
> If you are hosting the HTTP transport server with token pre-configured, you should protect your endpoint and implement authentication before allowing users to access it. Otherwise, anyone can access your MCP server while using your HackMD token.

### HTTP Headers (HTTP Transport where user provides the config)

When using the HTTP transport, user can pass configuration via HTTP headers:
- `Hackmd-Api-Token`: HackMD API Token (Required for all operations)
- `Hackmd-Api-Url`: (Optional) HackMD API URL (Defaults to https://api.hackmd.io/v1)

If the user provides the token in the header, while the server also has `HACKMD_API_TOKEN` set, the header value will take precedence.

### Get a HackMD API Token

To get an API token, follow these steps:

1. Go to [HackMD settings](https://hackmd.io/settings#api).
2. Click on "Create API Token".
3. Copy the generated token and use it in your `.env` file or environment variables.

## Available Tools

### Profile Tools
- **get_user_info**: Get information about the authenticated user

### Teams Tools
- **list_teams**: List all teams accessible to the user

### History Tools
- **get_history**: Get user's reading history

### Team Notes Tools
- **list_team_notes**: List all notes in a team
- **create_team_note**: Create a new note in a team
- **update_team_note**: Update an existing note in a team
- **delete_team_note**: Delete a note in a team

### User Notes Tools
- **list_user_notes**: List all notes owned by the user
- **get_note**: Get a note by its ID
- **create_note**: Create a new note
- **update_note**: Update an existing note
- **delete_note**: Delete a note

## Example Usage

### Basic Note Management

```
Can you help me manage my HackMD notes?
```

### List Notes

```
Please list all my notes.
```

### Create a New Note

````
Create a new note with the title "Meeting Notes" and content:
```
# Meeting Notes

Discussion points:
- Item 1
- Item 2
```
````

### Team Collaboration

```
Show me all the teams I'm part of and list the notes in the first team.
```

## Local Development

This project uses [pnpm](https://pnpm.io) as its package manager.

Clone the repository and install dependencies:

```bash
git clone https://github.com/yuna0x0/hackmd-mcp.git
cd hackmd-mcp
pnpm install
```

### Configuration

1. Create a `.env` file by copying the example:
```bash
cp env.example .env
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
pnpm run inspector
```

Then open your browser to the provided URL (usually http://localhost:6274) to access the MCP Inspector interface. From there, you can:

1. Connect to your running HackMD MCP server
2. Browse available tools
3. Run tools with custom parameters
4. View the responses

This is particularly useful for testing your setup before connecting it to MCP clients like Claude Desktop.

## Docker

Pull from Docker Hub:
```bash
docker pull yuna0x0/hackmd-mcp
```

Docker build (Local Development):
```bash
docker build -t yuna0x0/hackmd-mcp .
```

Docker multi-platform build (Local Development):
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t yuna0x0/hackmd-mcp .
```

## Security Notice

This MCP server accepts your HackMD API token in the .env file, environment variable or HTTP header. Keep this information secure and never commit it to version control.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
