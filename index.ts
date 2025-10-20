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

dotenv.config({ quiet: true });

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

// Helper function to create JSON-RPC error responses
function createJsonRpcError(code: number, message: string) {
  return {
    jsonrpc: "2.0" as const,
    error: { code, message },
    id: null,
  };
}

// Get allowed HackMD API URLs from environment
function getAllowedApiUrls(): string[] {
  const allowedUrls = process.env.ALLOWED_HACKMD_API_URLS;
  if (!allowedUrls || allowedUrls.trim().length === 0) {
    return [DEFAULT_HACKMD_API_URL];
  }
  return allowedUrls
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
}

// Validate if the provided API URL is allowed
function isAllowedApiUrl(url: string): boolean {
  const allowedUrls = getAllowedApiUrls();
  return allowedUrls.includes(url);
}

// Parse configuration from header or query parameters (for Smithery)
function parseConfig(req: Request): { config?: any; error?: any } {
  const hackmdApiTokenHeader =
    req.headers[HACKMD_API_TOKEN_HEADER.toLowerCase()];
  const hackmdApiUrlHeader = req.headers[HACKMD_API_URL_HEADER.toLowerCase()];

  const config: any = {};

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
    return { config };
  }

  // Smithery passes config as base64-encoded JSON in query parameters
  const configParam = req.query.config;
  if (typeof configParam === "string" && configParam.trim().length > 0) {
    try {
      const smitheryConfig = JSON.parse(
        Buffer.from(configParam, "base64").toString(),
      );

      return { config: smitheryConfig };
    } catch (error) {
      return {
        error: createJsonRpcError(
          -32000,
          "Bad Request: Invalid base64-encoded config parameter",
        ),
      };
    }
  }

  // Return empty config if nothing found
  return { config };
}

// Create MCP server with HackMD integration
function createServer({ config }: { config: z.infer<typeof ConfigSchema> }) {
  const server = new McpServer({
    name: "hackmd-mcp",
    version: "1.5.5",
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
    // Parse configuration with URL validation
    const parseResult = parseConfig(req);

    // Check for parsing errors
    if (parseResult.error) {
      return res.status(400).json(parseResult.error);
    }

    const rawConfig = parseResult.config || {};

    // Check if API token is available (from header, query param, or env var)
    const hackmdApiToken =
      rawConfig.hackmdApiToken || process.env.HACKMD_API_TOKEN;

    if (!hackmdApiToken || hackmdApiToken.trim().length === 0) {
      return res
        .status(400)
        .json(
          createJsonRpcError(
            -32000,
            `Bad Request: Please provide a HackMD API token via header '${HACKMD_API_TOKEN_HEADER}'.`,
          ),
        );
    }

    // Extract API URL from config or use default
    const hackmdApiUrl =
      rawConfig.hackmdApiUrl ||
      process.env.HACKMD_API_URL ||
      DEFAULT_HACKMD_API_URL;

    // Validation of the API URL
    if (!isAllowedApiUrl(hackmdApiUrl)) {
      return res
        .status(400)
        .json(
          createJsonRpcError(
            -32000,
            `Bad Request: HackMD API URL "${hackmdApiUrl}" is not in the allowed list`,
          ),
        );
    }

    // Validate and parse configuration
    const config = ConfigSchema.parse({
      hackmdApiToken,
      hackmdApiUrl,
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
      res.status(500).json(createJsonRpcError(-32603, "Internal server error"));
    }
  }
});

// SSE notifications not supported in stateless mode
app.get("/mcp", async (req: Request, res: Response) => {
  res
    .writeHead(405)
    .end(JSON.stringify(createJsonRpcError(-32000, "Method not allowed.")));
});

// Session termination not needed in stateless mode
app.delete("/mcp", async (req: Request, res: Response) => {
  res
    .writeHead(405)
    .end(JSON.stringify(createJsonRpcError(-32000, "Method not allowed.")));
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
