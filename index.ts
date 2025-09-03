#!/usr/bin/env node

import express, { Request, Response } from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { API } from "@hackmd/api";
import dotenv from "dotenv";
import { z } from "zod";
import { registerAllTools } from "./tools/index.js";
import { ConfigSchema } from "./utils/schemas.js";
import {
  HACKMD_API_TOKEN_HEADER,
  HACKMD_API_URL_HEADER,
  DEFAULT_HACKMD_API_URL,
} from "./utils/constants.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// CORS configuration for browser-based MCP clients
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    exposedHeaders: [
      "Mcp-Session-Id",
      HACKMD_API_TOKEN_HEADER,
      HACKMD_API_URL_HEADER,
    ],
    allowedHeaders: [
      "Content-Type",
      "mcp-session-id",
      HACKMD_API_TOKEN_HEADER,
      HACKMD_API_URL_HEADER,
    ],
  }),
);

app.use(express.json());

// Parse configuration from header or query parameters (for Smithery)
function parseConfig(req: Request) {
  const hackmdApiTokenHeader =
    req.headers[HACKMD_API_TOKEN_HEADER.toLowerCase()];
  const hackmdApiUrlHeader = req.headers[HACKMD_API_URL_HEADER.toLowerCase()];

  let config: any = {};

  if (
    typeof hackmdApiTokenHeader === "string" &&
    hackmdApiTokenHeader.trim().length > 0
  ) {
    config.hackmdApiToken = hackmdApiTokenHeader;
  }

  if (
    typeof hackmdApiUrlHeader === "string" &&
    hackmdApiUrlHeader.trim().length > 0
  ) {
    config.hackmdApiUrl = hackmdApiUrlHeader;
  }

  // If any config found in headers, return it
  if (Object.keys(config).length > 0) {
    return config;
  }

  // Smithery passes config as base64-encoded JSON in query parameters
  const configParam = req.query.config;
  if (typeof configParam === "string" && configParam.trim().length > 0) {
    const smitheryConfig = JSON.parse(
      Buffer.from(configParam, "base64").toString(),
    );
    return smitheryConfig;
  }

  // Return empty config if nothing found
  return config;
}

// Create MCP server with HackMD integration
function createServer({ config }: { config: z.infer<typeof ConfigSchema> }) {
  const server = new McpServer({
    name: "hackmd-mcp",
    version: "1.4.0",
  });

  // Initialize HackMD API client with config
  const client = new API(config.hackmdApiToken, config.hackmdApiUrl);

  // Register all tools
  registerAllTools(server, client);

  return server;
}

// Handle MCP requests at /mcp endpoint
app.post("/mcp", async (req: Request, res: Response) => {
  try {
    // Parse configuration
    const rawConfig = parseConfig(req);

    // Check if API token is available (from header, query param, or env var)
    const hackmdApiToken =
      rawConfig.hackmdApiToken || process.env.HACKMD_API_TOKEN;

    if (!hackmdApiToken || hackmdApiToken.trim().length === 0) {
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: `Bad Request: Please provide a HackMD API token via header '${HACKMD_API_TOKEN_HEADER}'.`,
        },
        id: null,
      });
    }

    // Validate and parse configuration with fallbacks to environment variables
    const config = ConfigSchema.parse({
      hackmdApiToken,
      hackmdApiUrl:
        rawConfig.hackmdApiUrl ||
        process.env.HACKMD_API_URL ||
        DEFAULT_HACKMD_API_URL,
    });

    const server = createServer({ config });
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    // Clean up on request close
    res.on("close", () => {
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

// SSE notifications not supported in stateless mode
app.get("/mcp", async (req: Request, res: Response) => {
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    }),
  );
});

// Session termination not needed in stateless mode
app.delete("/mcp", async (req: Request, res: Response) => {
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    }),
  );
});

// Main function to start the server in the appropriate mode
async function main() {
  const transport = process.env.TRANSPORT || "stdio";

  if (transport === "http") {
    // Run in HTTP mode
    app.listen(PORT, () => {
      console.log(`MCP HTTP Server listening on port ${PORT}`);
    });
  } else {
    if (transport !== "stdio") {
      console.warn(
        `Unknown TRANSPORT "${transport}", defaulting to "stdio" mode.`,
      );
    }

    // Run in STDIO mode for backward compatibility
    const API_TOKEN = process.env.HACKMD_API_TOKEN;
    if (!API_TOKEN) {
      console.error("Error: HACKMD_API_TOKEN is required");
      process.exit(1);
    }

    const config = ConfigSchema.parse({
      hackmdApiToken: API_TOKEN,
      hackmdApiUrl: process.env.HACKMD_API_URL || DEFAULT_HACKMD_API_URL,
    });

    // Create server with configuration
    const server = createServer({ config });

    // Start receiving messages on stdin and sending messages on stdout
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    console.error("MCP Server running in stdio mode");
  }
}

// Start the server
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
