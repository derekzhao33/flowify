# AI Assistant Setup Guide

## Overview
I've created an AI-powered scheduling assistant for your Calendar that uses GPT-4o to intelligently parse natural language and create tasks automatically.

## What's Been Implemented

### Backend (Node.js + Express + Prisma)

1. **AI Assistant Service** (`backend/src/services/assistant/assistant.service.ts`)
   - Integrates with OpenAI's GPT-4o model
   - Parses natural language input to extract task details
   - Analyzes user's existing tasks for pattern recognition
   - Estimates duration and due dates based on patterns
   - Checks for scheduling conflicts
   - Creates tasks in the database

2. **AI Assistant Routes** (`backend/src/services/assistant/assistant.routes.ts`)
   - `POST /api/assistant/process` - Processes natural language input
   - Returns: AI response message, tasks created, missing info, conflicts

3. **Updated Prisma Schema** (`backend/prisma/schema.prisma`)
   - Added optional fields to Task model: `name`, `description`, `priority`, `color`

4. **Configuration** (`backend/src/config/config.ts`)
   - Added `OPENAI_API_KEY` configuration

### Frontend (React)

1. **Updated Calendar Component** (`frontend/app/src/pages/Calender.jsx`)
   - AI-powered input field
   - Sliding response panel that appears above input
   - Real-time processing indicator
   - Success/warning/error states with color-coded messages
   - Automatic task addition to calendar after AI processing

2. **AI Response Panel Features**
   - Shows AI message (1-2 sentences, straight to the point)
   - Displays number of tasks created
   - Shows missing information warnings
   - Alerts about scheduling conflicts
   - Auto-dismisses after 5 seconds on success
   - Manual close button

## Setup Instructions

### 1. Add Your OpenAI API Key

Create a `.env` file in the `backend` directory:

\`\`\`bash
cd backend
cp .env.example .env
\`\`\`

Edit `.env` and add your OpenAI API key:

\`\`\`env
OPENAI_API_KEY=sk-your-actual-api-key-here
DATABASE_URL="postgresql://user:password@localhost:5432/scheduledb"
PORT=3000
NODE_ENV=development
\`\`\`

### 2. Run Database Migration

Update your database schema with the new Task fields:

\`\`\`bash
cd backend
npx prisma migrate dev --name add_task_fields
npx prisma generate
\`\`\`

### 3. Start the Backend

\`\`\`bash
cd backend
npm run dev
\`\`\`

### 4. Start the Frontend

\`\`\`bash
cd frontend/app
npm run dev
\`\`\`

## How to Use

### Natural Language Examples

The AI can understand various formats:

1. **Basic time range:**
   - "meeting from 2-4pm"
   - "workout at 6am for 2 hours"
   - "an event from 2 to 4"

2. **With task name:**
   - "work on math at 6pm, it will take two hours"
   - "project meeting tomorrow at 3pm"

3. **Multiple tasks:**
   - "meeting at 2pm and workout at 6pm"
   - "breakfast at 8am, lunch at 12pm, dinner at 7pm"

4. **With due dates:**
   - "i have smth due in two days at 7pm"
   - "finish report by tomorrow"
   - "study for exam next Monday"

5. **With priority:**
   - "urgent meeting at 3pm"
   - "low priority task tomorrow"

### AI Features

1. **Smart Time Estimation:**
   - If you don't specify duration, AI estimates based on your previous tasks
   - Learns from your scheduling patterns

2. **Conflict Detection:**
   - AI checks your existing calendar
   - Warns you about overlapping tasks
   - Still creates the task but notifies you

3. **Missing Information Handling:**
   - AI asks for missing details (time, date)
   - Suggests defaults based on patterns
   - Clear error messages

4. **Pattern Learning:**
   - Analyzes your last 50 tasks
   - Finds your preferred work hours
   - Calculates average task duration
   - Uses this data to make smart suggestions

## API Endpoints

### POST /api/assistant/process

**Request:**
\`\`\`json
{
  "input": "meeting from 2pm to 4pm tomorrow",
  "userId": 1
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "message": "Created 1 task successfully.",
  "tasks": [
    {
      "name": "meeting",
      "date": "2025-11-24",
      "startTime": "14:00",
      "endTime": "16:00",
      "priority": "medium"
    }
  ],
  "tasksCreated": 1
}
\`\`\`

**Response (With Conflicts):**
\`\`\`json
{
  "message": "Created 1 task successfully. Warning: 1 scheduling conflict detected.",
  "tasks": [...],
  "tasksCreated": 1,
  "conflicts": [
    "\"meeting\" at 14:00 overlaps with 1 existing task(s)"
  ]
}
\`\`\`

**Response (Missing Info):**
\`\`\`json
{
  "message": "Cannot create task. Missing: Start time missing for \"meeting\".",
  "tasks": [],
  "tasksCreated": 0,
  "missingInfo": [
    "Start time missing for \"meeting\""
  ]
}
\`\`\`

## Technical Details

### GPT-4o System Prompt
The AI is instructed to:
- Extract task name, date, time range, priority
- Handle 12/24 hour formats and AM/PM
- Calculate relative dates (tomorrow, next week, etc.)
- Estimate durations based on task type and user patterns
- Return structured JSON for easy parsing

### Pattern Recognition
The system analyzes:
- Average task duration from past tasks
- Most common start times
- Task completion patterns
- Scheduling preferences

### Conflict Detection
Checks for overlaps by:
- Comparing start/end times
- Same-day task analysis
- Providing detailed conflict messages

## Future Enhancements (Not Yet Implemented)

- Voice input via microphone button
- Multi-day task scheduling
- Recurring task patterns
- Time zone handling
- Calendar sync (Google Calendar, etc.)
- Smart rescheduling suggestions
- Task priority learning

## Troubleshooting

### "Failed to process your request"
- Check if backend is running on port 3000
- Verify OPENAI_API_KEY is set in .env
- Check browser console for CORS errors

### "Property 'task' does not exist on type 'PrismaClient'"
- Run: `npx prisma generate`
- Restart the backend server

### No tasks appearing in calendar
- Check if tasks are being created in database
- Verify userId matches in frontend and backend
- Check browser console for errors

## Notes

- The AI uses GPT-4o which requires an OpenAI API key with credits
- Each request costs approximately $0.01-0.03 depending on context
- Tasks are stored in PostgreSQL database
- Frontend keeps local state synchronized with backend
- User ID is currently hardcoded as 1 (needs auth integration)

## Questions?

If you need help or want to add more features, let me know!
