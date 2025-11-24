import OpenAI from 'openai';
import config from '../../config/config.js';
import prisma from '../../shared/prisma.js';
import { format, addDays } from 'date-fns';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
  baseURL: 'https://models.inference.ai.azure.com',
});

interface ParsedTask {
  name: string;
  description?: string;
  startTime: string; // ISO format or time string
  endTime: string;
  date: string; // YYYY-MM-DD
  priority?: 'low' | 'medium' | 'high';
  estimatedDuration?: number; // in minutes
}

interface AIResponse {
  message: string;
  tasks: ParsedTask[];
  tasksCreated: number;
  missingInfo?: string[];
  conflicts?: string[];
}

interface DbTask {
  id: number;
  start_time: Date;
  end_time: Date;
  user_id: number;
}

// Get user's existing tasks for pattern analysis
async function getUserTasks(userId: number): Promise<DbTask[]> {
  return await prisma.task.findMany({
    where: { user_id: userId },
    orderBy: { start_time: 'desc' },
    take: 50, // Get recent 50 tasks for pattern analysis
  });
}

// Analyze patterns from existing tasks
function analyzeTaskPatterns(tasks: DbTask[]): {
  averageDuration: number;
  commonStartHour: number;
  typicalTaskLength: Record<string, number>;
} {
  if (tasks.length === 0) {
    return {
      averageDuration: 60, // default 1 hour
      commonStartHour: 9, // default 9 AM
      typicalTaskLength: {},
    };
  }

  // Calculate average duration
  const durations = tasks.map(task => {
    const start = new Date(task.start_time);
    const end = new Date(task.end_time);
    return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
  });
  const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

  // Find most common start hour
  const startHours = tasks.map(task => new Date(task.start_time).getHours());
  const hourFrequency: Record<number, number> = {};
  startHours.forEach(hour => {
    hourFrequency[hour] = (hourFrequency[hour] || 0) + 1;
  });
  const commonStartHour = parseInt(
    Object.entries(hourFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || '9'
  );

  return {
    averageDuration: Math.round(averageDuration),
    commonStartHour,
    typicalTaskLength: {},
  };
}

// Check for conflicts with existing tasks
function checkConflicts(
  newTask: { startTime: Date; endTime: Date },
  existingTasks: DbTask[]
): DbTask[] {
  return existingTasks.filter(task => {
    const existingStart = new Date(task.start_time);
    const existingEnd = new Date(task.end_time);
    
    // Check if times overlap
    return (
      (newTask.startTime >= existingStart && newTask.startTime < existingEnd) ||
      (newTask.endTime > existingStart && newTask.endTime <= existingEnd) ||
      (newTask.startTime <= existingStart && newTask.endTime >= existingEnd)
    );
  });
}

// Process natural language input with GPT-4o
export async function processNaturalLanguageInput(
  input: string,
  userId: number
): Promise<AIResponse> {
  try {
    // Get user's existing tasks for context and pattern analysis
    const existingTasks = await getUserTasks(userId);
    const patterns = analyzeTaskPatterns(existingTasks);

    // Create context for GPT
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const currentTime = format(new Date(), 'HH:mm');
    const dayOfWeek = format(new Date(), 'EEEE');

    const systemPrompt = `You are a smart scheduling assistant. Extract task/event details from natural language.

Context:
- Current date: ${currentDate} (${dayOfWeek})
- Current time: ${currentTime}
- User's average task duration: ${patterns.averageDuration} minutes
- User's preferred start time: ${patterns.commonStartHour}:00

Extract and return a JSON object with a "tasks" array. Each task must have these fields:
- name: string (required)
- description: string (optional)
- date: string (YYYY-MM-DD format, required)
- startTime: string (HH:mm format, required)
- endTime: string (HH:mm format, required)
- priority: 'low' | 'medium' | 'high' (default: medium)

Rules:
1. If no date is mentioned, use today (${currentDate})
2. "tomorrow" = ${format(addDays(new Date(), 1), 'yyyy-MM-dd')}
3. "in X days" = calculate from today
4. If no duration given, use user's average (${patterns.averageDuration} min) or estimate based on task type
5. If only start time given, calculate end time using estimated duration
6. If "from X to Y" or "X - Y", extract both times
7. Handle 12/24 hour formats and am/pm
8. Extract priority from words like "urgent", "important", "later"
9. Multiple tasks can be created from one input (e.g., "meeting at 2pm and workout at 6pm")

CRITICAL: Your response must be ONLY valid JSON in this exact format:
{"tasks": [{"name": "...", "date": "...", "startTime": "...", "endTime": "...", "priority": "medium"}]}

Do not include any markdown formatting, code blocks, or explanatory text. Return ONLY the raw JSON object.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // GitHub Models supports gpt-4o
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
      temperature: 0.3,
      // Note: GitHub Models may not support response_format, so we'll handle JSON parsing manually
    });

    let responseContent = completion.choices[0]?.message?.content || '{"tasks": []}';
    let parsedResponse;
    
    try {
      // Remove markdown code blocks if present (```json ... ```)
      responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      parsedResponse = JSON.parse(responseContent);
    } catch (e) {
      console.error('Failed to parse AI response:', responseContent);
      
      // Try to extract JSON object from the response
      const jsonMatch = responseContent.match(/\{[\s\S]*"tasks"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          // If that fails, try to extract just the tasks array
          const tasksMatch = responseContent.match(/\[[\s\S]*\]/);
          if (tasksMatch) {
            parsedResponse = { tasks: JSON.parse(tasksMatch[0]) };
          } else {
            parsedResponse = { tasks: [] };
          }
        }
      } else {
        parsedResponse = { tasks: [] };
      }
    }

    const tasks: ParsedTask[] = Array.isArray(parsedResponse.tasks) 
      ? parsedResponse.tasks 
      : parsedResponse.tasks 
        ? [parsedResponse.tasks]
        : [];

    // Validate and check for missing information
    const missingInfo: string[] = [];
    const validTasks: ParsedTask[] = [];
    const conflicts: string[] = [];

    for (const task of tasks) {
      // Check for required fields
      if (!task.name) {
        missingInfo.push('Task name is required');
        continue;
      }
      if (!task.date) {
        task.date = currentDate;
      }
      if (!task.startTime) {
        missingInfo.push(`Start time missing for "${task.name}"`);
        continue;
      }
      if (!task.endTime) {
        // Estimate end time based on patterns
        const timeParts = task.startTime.split(':').map(Number);
        const hours = timeParts[0] || 0;
        const minutes = timeParts[1] || 0;
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + patterns.averageDuration;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        task.endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
      }

      // Combine date and time for conflict checking
      const startDateTime = new Date(`${task.date}T${task.startTime}`);
      const endDateTime = new Date(`${task.date}T${task.endTime}`);

      // Check for conflicts
      const taskConflicts = checkConflicts(
        { startTime: startDateTime, endTime: endDateTime },
        existingTasks
      );

      if (taskConflicts.length > 0) {
        conflicts.push(
          `"${task.name}" at ${task.startTime} overlaps with ${taskConflicts.length} existing task(s)`
        );
      }

      validTasks.push(task);
    }

    // Create tasks in database
    let tasksCreated = 0;
    for (const task of validTasks) {
      try {
        const startDateTime = new Date(`${task.date}T${task.startTime}`);
        const endDateTime = new Date(`${task.date}T${task.endTime}`);

        await prisma.task.create({
          data: {
            start_time: startDateTime,
            end_time: endDateTime,
            user_id: userId,
          },
        });
        tasksCreated++;
      } catch (error) {
        console.error('Error creating task:', error);
      }
    }

    // Generate response message
    let message = '';
    if (tasksCreated > 0) {
      message = `Created ${tasksCreated} task${tasksCreated > 1 ? 's' : ''} successfully.`;
      if (conflicts.length > 0) {
        message += ` Warning: ${conflicts.length} scheduling conflict${conflicts.length > 1 ? 's' : ''} detected.`;
      }
    } else if (missingInfo.length > 0) {
      message = `Cannot create task. Missing: ${missingInfo.join(', ')}.`;
    } else {
      message = 'Could not understand the request. Please provide task details.';
    }

    return {
      message,
      tasks: validTasks,
      tasksCreated,
      missingInfo: missingInfo.length > 0 ? missingInfo : undefined,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
    };
  } catch (error) {
    console.error('Error processing natural language input:', error);
    throw new Error('Failed to process your request. Please try again.');
  }
}
