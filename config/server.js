import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import main from "./db.js";
import registerTodoTools from "../utils/Tools.js";

const server = new McpServer({
  name: "task-manager",
  version: "1.0.0",
});

await main();

registerTodoTools(server);

// Connect the MCP server using STDIO
const transport = new StdioServerTransport();
await server.connect(transport);
