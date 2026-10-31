import axios from "axios";
import Instruction from "./prompt.js";
import { client } from "./client.js";

let chatHistory = [];

const tools = [
  {
    functionDeclarations: [
      {
        name: "add_task",
        description: "Add a task to the user's to-do list",
        parameters: {
          type: "OBJECT",
          properties: {
            title: {
              type: "STRING",
              description: "The task title",
            },
            dueDate: {
              type: "STRING",
              description: "Due date in YYYY-MM-DD format",
            },
            priority: {
              type: "STRING",
              enum: ["low", "medium", "high"],
              description: "Task priority",
            },
          },
          required: ["title", "dueDate", "priority"],
        },
      },
      {
        name: "get_task_by_title",
        description: "Fetch a todo task from the database by its exact title",
        parameters: {
          type: "OBJECT",
          properties: {
            title: {
              type: "STRING",
              description: "The exact title of the todo task to find",
            },
          },
          required: ["title"],
        },
      },

      {
        name: "delete_task_by_id",
        description:
          "Permanently delete a todo task from the database using its MongoDB ID. Use this tool when the user explicitly requests deletion of a specific task.",
        parameters: {
          type: "OBJECT",
          properties: {
            id: {
              type: "STRING",
              description:
                "The MongoDB ObjectId of the todo task to delete (24-character hexadecimal string)",
            },
          },
          required: ["id"],
        },
      },
    ],
  },
];

const allowedTools = ["add_task", "get_task_by_title", "delete_task_by_id"];

async function geminiCall() {
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        systemInstruction: {
          parts: [{ text: Instruction }],
        },

        contents: chatHistory,
        tools,
      },

      {
        headers: {
          "x-goog-api-key": process.env.GOOGLE_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (err) {
    console.log("Error: ", err.message);
    return err.message;
  }
}

async function modelCall(query) {
  chatHistory.push({ role: "user", parts: [{ text: query }] });
  const res = await geminiCall();
  const candidate = res.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const functionCall = parts.find((part) => part.functionCall)?.functionCall;
  if (!functionCall) {
    const answer = parts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    chatHistory.push({ role: "model", parts });
    return answer || "Gemini returned no text or function call.";
  }

  console.log("Function requested:", functionCall.name);
  console.log("Arguments:", functionCall.args);
  if (!allowedTools.includes(functionCall.name)) {
    throw new Error(`Unknown Tool:${functionCall.name}`);
  }

  const result = await client.callTool({
    name: functionCall.name,
    arguments: functionCall.args,
  });
  //Mcp server response send to gemini
  console.log("MCP result:", result);
  chatHistory.push({ role: "user", parts });

  chatHistory.push({
    role: "user",
    parts: [
      {
        functionResponse: {
          name: functionCall.name,
          response: {
            result: result.content,
          },
        },
      },
    ],
  });

  const finalresponse = await geminiCall();
  const finalParts = finalresponse.candidates?.[0]?.content?.parts ?? [];
  chatHistory.push({ role: "model", parts: finalParts });
  return finalParts
    .filter((part) => part.text)
    .map((part) => part.text)
    .join("\n");
}

export default modelCall;
