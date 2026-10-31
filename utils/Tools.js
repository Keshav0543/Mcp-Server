import Todo from "../config/dbSchema.js";
import { z } from "zod";

async function registerTodoTools(server){
server.registerTool(
  "add_task",
  {
    description: "Add a task to the user's to-do list",
    inputSchema: {
      title: z.string().min(1),
      dueDate: z.string(),
      priority: z.enum(["low", "medium", "high"]),
    },
  },
  async ({ title, dueDate, priority }) => {
    try {
    console.log("add_task called");
    console.log("Received:", { title, dueDate, priority });

      const todo = await Todo.create({
        title,
        dueDate,
        priority,
        completed:true
      });
      console.log("Todo saved:", todo._id.toString());
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              message: "Todo saved successfully",
              todo: {
                id: todo._id.toString(),
                title: todo.title,
                dueDate: todo.dueDate,
                priority: todo.priority,
                completed: todo.completed,
              },
            }),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Failed to save todo: ${error.message}`,
          },
        ],
      };
    }
  },
);

server.registerTool(
  "get_task_by_title",
  {
    description: "Find a todo task in the database by its exact title and return its details.",
    inputSchema: {
      title: z.string()
        .trim()
        .min(1, "Task title cannot be empty")
        .describe("The exact title of the todo task to find")
    }
  },
  async ({ title }) => {
    try {
      const todo = await Todo.findOne({
        title: title.trim()
      }).lean();

      if (!todo) {
        return {
          content: [
            {
              type: "text",
              text: `No todo task found with the title "${title}".`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              task: {
                id: todo._id.toString(),
                title: todo.title,
                dueDate: todo.dueDate,
                priority: todo.priority,
                completed: todo.completed,
                createdAt: todo.createdAt
              }
            })
          }
        ]
      };
    } catch (err) {
      console.error("get_task_by_title error:", err);

      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "Unable to fetch the todo task due to a database error."
          }
        ]
      };
    }
  }
);

server.registerTool(
  "delete_task_by_id",
  {
    description: "Delete a todo task permanently using its MongoDB ID.",
    inputSchema: {
      id: z.string()
        .regex(/^[a-fA-F0-9]{24}$/, "Invalid MongoDB task ID")
        .describe("The MongoDB ObjectId of the task to delete")
    }
  },
  async ({ id }) => {
    try {
      const result = await Todo.deleteOne({ _id: id });

      if (result.deletedCount === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No todo task found with ID "${id}".`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              message: "Todo task deleted successfully",
              id
            })
          }
        ]
      };
    } catch (err) {
      console.error("delete_task_by_id error:", err);

      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "Failed to delete the todo task due to a database error."
          }
        ]
      };
    }
  }
);
};

export default registerTodoTools;