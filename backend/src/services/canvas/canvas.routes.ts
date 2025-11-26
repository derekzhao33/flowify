import { Router } from 'express';
import type { Request, Response } from 'express';
import { canvasService } from './canvas.service.js';

const router = Router();

/**
 * Save Canvas .ics URL and perform initial sync
 * POST /api/canvas/setup
 */
router.post('/setup', async (req: Request, res: Response) => {
  try {
    const { userId, icsUrl } = req.body;

    if (!userId || !icsUrl) {
      return res.status(400).json({ error: 'userId and icsUrl are required' });
    }

    // Validate URL format
    try {
      new URL(icsUrl);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Save Canvas URL
    await canvasService.saveCanvasURL(userId, icsUrl);

    // Perform initial sync
    const syncResult = await canvasService.syncCanvasToGoogleCalendar(userId, icsUrl);

    res.json({
      message: 'Canvas integration set up successfully',
      addedEvents: syncResult.addedEvents,
      newEvents: syncResult.newEvents,
    });
  } catch (error) {
    console.error('Error setting up Canvas integration:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to set up Canvas integration',
    });
  }
});

/**
 * Sync Canvas events (triggered manually or by interval)
 * POST /api/canvas/sync
 */
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get Canvas URL from user profile
    const icsUrl = await canvasService.getCanvasURL(userId);

    if (!icsUrl) {
      return res.status(404).json({ error: 'Canvas not set up for this user' });
    }

    // Sync events
    const syncResult = await canvasService.syncCanvasToGoogleCalendar(userId, icsUrl);

    res.json({
      message: 'Canvas events synced successfully',
      addedEvents: syncResult.addedEvents,
      newEvents: syncResult.newEvents,
    });
  } catch (error) {
    console.error('Error syncing Canvas events:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to sync Canvas events',
    });
  }
});

/**
 * Get Canvas integration status
 * GET /api/canvas/status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Valid userId is required' });
    }

    const icsUrl = await canvasService.getCanvasURL(userId);

    res.json({
      isConnected: !!icsUrl,
      icsUrl: icsUrl || null,
    });
  } catch (error) {
    console.error('Error getting Canvas status:', error);
    res.status(500).json({
      error: 'Failed to get Canvas status',
    });
  }
});

/**
 * Remove Canvas integration
 * DELETE /api/canvas/remove
 */
router.delete('/remove', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await canvasService.removeCanvasIntegration(userId);

    res.json({
      message: 'Canvas integration removed successfully',
      deletedEventsCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error removing Canvas integration:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to remove Canvas integration',
    });
  }
});

export default router;
