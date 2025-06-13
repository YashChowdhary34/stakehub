import client from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch admin chat templates
export async function GET() {
  try {
    // Get or create the settings record
    let settings = await client.setting.findFirst();

    if (!settings) {
      // Create a new settings record with default values if none exists
      settings = await client.setting.create({
        data: {
          estimatedReplyTime: 10,
          onlineStatus: false,
          adminChatTemplates: [],
          userChatTemplates: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      templates: settings.adminChatTemplates,
    });
  } catch (error) {
    console.error("Error fetching admin templates:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch templates",
      },
      { status: 500 }
    );
  }
}

// POST - Add, edit, or delete admin chat templates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, template, index } = body;

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: "Action is required",
        },
        { status: 400 }
      );
    }

    // Get or create the settings record
    let settings = await client.setting.findFirst();

    if (!settings) {
      settings = await client.setting.create({
        data: {
          estimatedReplyTime: 10,
          onlineStatus: false,
          adminChatTemplates: [],
          userChatTemplates: [],
        },
      });
    }

    const updatedTemplates = [...settings.adminChatTemplates];

    switch (action) {
      case "add":
        if (!template || typeof template !== "string" || !template.trim()) {
          return NextResponse.json(
            {
              success: false,
              error: "Template text is required",
            },
            { status: 400 }
          );
        }

        // Check if template already exists
        if (updatedTemplates.includes(template.trim())) {
          return NextResponse.json(
            {
              success: false,
              error: "Template already exists",
            },
            { status: 400 }
          );
        }

        updatedTemplates.push(template.trim());
        break;

      case "edit":
        if (
          typeof index !== "number" ||
          index < 0 ||
          index >= updatedTemplates.length
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid template index",
            },
            { status: 400 }
          );
        }

        if (!template || typeof template !== "string" || !template.trim()) {
          return NextResponse.json(
            {
              success: false,
              error: "Template text is required",
            },
            { status: 400 }
          );
        }

        // Check if the new template text already exists (excluding the current one)
        const existingIndex = updatedTemplates.findIndex(
          (t) => t === template.trim()
        );
        if (existingIndex !== -1 && existingIndex !== index) {
          return NextResponse.json(
            {
              success: false,
              error: "Template already exists",
            },
            { status: 400 }
          );
        }

        updatedTemplates[index] = template.trim();
        break;

      case "delete":
        if (
          typeof index !== "number" ||
          index < 0 ||
          index >= updatedTemplates.length
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid template index",
            },
            { status: 400 }
          );
        }

        updatedTemplates.splice(index, 1);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Use 'add', 'edit', or 'delete'",
          },
          { status: 400 }
        );
    }

    // Update the settings record
    const updatedSettings = await client.setting.update({
      where: { id: settings.id },
      data: {
        adminChatTemplates: updatedTemplates,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      templates: updatedSettings.adminChatTemplates,
      message: `Template ${action}${
        action === "add" ? "ed" : action === "edit" ? "ed" : "d"
      } successfully`,
    });
  } catch (error) {
    console.error("Error managing admin templates:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update templates",
      },
      { status: 500 }
    );
  }
}
