#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { API } from "@hackmd/api";
import { registerAllTools } from "./tools/index.js";

// Load environment variables
dotenv.config();

// Get API token from environment
const API_TOKEN = process.env.HACKMD_API_TOKEN;
if (!API_TOKEN) {
  console.error("Error: HACKMD_API_TOKEN is required");
  process.exit(1);
}
const API_URL = process.env.HACKMD_API_URL;

// Initialize HackMD API client
const client = new API(API_TOKEN, API_URL);

// Create an MCP server for HackMD API
const server = new McpServer({
  name: "hackmd-mcp",
  version: "1.3.1",
});

// Register all tools
registerAllTools(server, client);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
