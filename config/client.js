import path from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  name: "task-ai-agent",
  version: "1.0.0"
});

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [path.join(__dirname, "server.js")]
});

await client.connect(transport);

const result = await client.listTools();

export { client, result };