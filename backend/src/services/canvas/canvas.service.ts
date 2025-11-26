import axios from 'axios';
import { googleCalendarService } from '../google-calendar/google-calendar.service.js';
import prisma from '../../shared/prisma.js';

// Dynamic import for ical package
let icalParser: any;
(async () => {
  icalParser = await import('ical');
})();

interface CanvasEvent {
  uid: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
}

export class CanvasService {
  /**
   * Parse .ics content and extract Canvas events
   */
  async parseICSContent(icsContent: string): Promise<CanvasEvent[]> {
    const events: CanvasEvent[] = [];

    try {
      // Ensure ical is loaded
      if (!icalParser) {
        icalParser = await import('ical');
      }
      
      const ical = icalParser.default || icalParser;
      const parsedData = ical.parseICS(icsContent);

      for (const key in parsedData) {
        const event = parsedData[key];

        // Only process VEVENT type
        if (event.type === 'VEVENT') {
          const startDate = event.start;
          const endDate = event.end || new Date(startDate.getTime() + 3600000); // Default 1 hour if no end

          events.push({
            uid: event.uid || key,
            summary: event.summary || 'Untitled Canvas Event',
            description: event.description || '',
            start: startDate,
            end: endDate,
            location: event.location,
          });
        }
      }
    } catch (error) {
      console.error('Error parsing ICS content:', error);
      throw new Error('Failed to parse ICS file');
    }

    return events;
  }

  /**
   * Fetch .ics file from URL
   */
  async fetchICSFromURL(icsUrl: string): Promise<string> {
    try {
      console.log('Fetching ICS from URL:', icsUrl);
      
      const response = await axios.get(icsUrl, {
        responseType: 'text',
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'text/calendar, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        maxRedirects: 5,
        validateStatus: (status) => status < 500 // Accept 4xx errors to provide better messages
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers['content-type']);
      
      // Check for authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new Error('Access denied. Your Canvas calendar feed URL may have expired or requires authentication. Try generating a new feed URL from Canvas.');
      }

      if (response.status === 404) {
        throw new Error('Calendar feed not found. Please verify the URL is correct and hasn\'t been changed or disabled.');
      }

      const content = response.data;
      console.log('First 200 chars of response:', content.substring(0, 200));

      // Validate that this is actually an ICS file
      if (content.includes('<!DOCTYPE') || content.includes('<html>') || content.includes('<HTML>')) {
        throw new Error('The URL returned a webpage instead of a calendar feed. This usually means:\n• You may need to be logged into Canvas\n• The feed URL may have expired\n• The URL might be incorrect\n\nTry generating a fresh calendar feed URL from your Canvas Calendar settings.');
      }

      if (!content.includes('BEGIN:VCALENDAR')) {
        throw new Error('Invalid calendar format. The URL must point to a valid .ics calendar feed. Make sure you copied the full feed URL that ends with .ics');
      }

      console.log('ICS file validated successfully');
      return content;
    } catch (error: any) {
      console.error('Error fetching ICS from URL:', error.message);
      if (error.message && (error.message.includes('webpage') || error.message.includes('Invalid calendar') || error.message.includes('Access denied') || error.message.includes('not found'))) {
        throw error;
      }
      if (error.code === 'ENOTFOUND') {
        throw new Error('Cannot reach Canvas server. Please check the URL domain and your internet connection.');
      }
      throw new Error('Failed to fetch Canvas calendar. Please check the URL and try again.');
    }
  }

  /**
   * Sync Canvas events to Google Calendar
   */
  async syncCanvasToGoogleCalendar(
    userId: number,
    icsUrl: string
  ): Promise<{ addedEvents: number; newEvents: CanvasEvent[] }> {
    try {
      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.google_access_token || !user.google_refresh_token) {
        throw new Error('Google Calendar not connected');
      }

      // Fetch ICS content
      const icsContent = await this.fetchICSFromURL(icsUrl);

      // Parse Canvas events
      const canvasEvents = await this.parseICSContent(icsContent);

      // Get existing Canvas events from database
      const existingCanvasTasks = await prisma.task.findMany({
        where: {
          user_id: userId,
          source: 'canvas',
        },
      });

      const existingEventIds = new Set(
        existingCanvasTasks.map(task => task.canvas_event_id).filter(Boolean)
      );

      // Filter out events that already exist
      const newCanvasEvents = canvasEvents.filter(
        event => !existingEventIds.has(event.uid)
      );

      let addedEvents = 0;

      // Add new events to Google Calendar with red color
      for (const canvasEvent of newCanvasEvents) {
        try {
          // Create event in Google Calendar with red color (colorId: '11')
          const gcEvent = await googleCalendarService.createEvent(
            user.google_access_token,
            user.google_refresh_token,
            {
              name: canvasEvent.summary,
              description: canvasEvent.description,
              startTime: canvasEvent.start,
              endTime: canvasEvent.end,
            }
          );

          // Try to update event color to red (colorId '11')
          // Note: This requires a separate API call to patch the event
          if (gcEvent.id) {
            try {
              await this.updateGoogleCalendarEventColor(
                user.google_access_token,
                user.google_refresh_token,
                gcEvent.id,
                '11' // Red color
              );
            } catch (colorError) {
              console.warn('Failed to set event color:', colorError);
              // Continue even if color update fails
            }
          }

          // Save to database
          await prisma.task.create({
            data: {
              user_id: userId,
              name: canvasEvent.summary,
              description: canvasEvent.description,
              start_time: canvasEvent.start,
              end_time: canvasEvent.end,
              source: 'canvas',
              canvas_event_id: canvasEvent.uid,
              google_event_id: gcEvent.id || undefined,
              color: 'red',
            },
          });

          addedEvents++;
        } catch (error) {
          console.error(`Failed to add Canvas event ${canvasEvent.summary}:`, error);
        }
      }

      // Update last sync time
      await prisma.user.update({
        where: { id: userId },
        data: { canvas_last_sync: new Date() },
      });

      return { addedEvents, newEvents: newCanvasEvents };
    } catch (error) {
      console.error('Error syncing Canvas to Google Calendar:', error);
      throw error;
    }
  }

  /**
   * Update Google Calendar event color
   */
  private async updateGoogleCalendarEventColor(
    accessToken: string,
    refreshToken: string | undefined,
    eventId: string,
    colorId: string
  ): Promise<void> {
    const { google } = await import('googleapis');
    const { OAuth2Client } = await import('google-auth-library');

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.patch({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: {
        colorId: colorId,
      },
    });
  }

  /**
   * Save Canvas ICS URL to user profile
   */
  async saveCanvasURL(userId: number, icsUrl: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { canvas_ics_url: icsUrl },
    });
  }

  /**
   * Get Canvas ICS URL for user
   */
  async getCanvasURL(userId: number): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { canvas_ics_url: true },
    });

    return user?.canvas_ics_url || null;
  }

  /**
   * Remove Canvas integration and delete all Canvas events
   */
  async removeCanvasIntegration(userId: number): Promise<{ deletedCount: number }> {
    try {
      // Fetch user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get all Canvas tasks
      const canvasTasks = await prisma.task.findMany({
        where: {
          user_id: userId,
          source: 'canvas',
        },
      });

      // Delete from Google Calendar if connected
      if (user.google_access_token && user.google_refresh_token) {
        for (const task of canvasTasks) {
          if (task.google_event_id) {
            try {
              await googleCalendarService.deleteEvent(
                user.google_access_token,
                user.google_refresh_token,
                task.google_event_id
              );
            } catch (error) {
              console.warn(`Failed to delete Google Calendar event ${task.google_event_id}:`, error);
            }
          }
        }
      }

      // Delete from database
      const deleteResult = await prisma.task.deleteMany({
        where: {
          user_id: userId,
          source: 'canvas',
        },
      });

      // Clear Canvas URL from user
      await prisma.user.update({
        where: { id: userId },
        data: {
          canvas_ics_url: null,
          canvas_last_sync: null,
        },
      });

      return { deletedCount: deleteResult.count };
    } catch (error) {
      console.error('Error removing Canvas integration:', error);
      throw error;
    }
  }
}

export const canvasService = new CanvasService();
