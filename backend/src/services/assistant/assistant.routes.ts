import express, { Router } from 'express';
import { processNaturalLanguageInput } from './assistant.service.js';

const router: Router = Router();

router.post('/process', async (req: express.Request, res: express.Response) => {
  const { input, userId } = req.body;

  // Validate input
  if (!input || typeof input !== 'string' || !input.trim()) {
    return res.status(400).json({ 
      error: 'Invalid input. Please provide a task description.' 
    });
  }

  if (!userId || typeof userId !== 'number') {
    return res.status(400).json({ 
      error: 'User ID is required.' 
    });
  }

  try {
    const result = await processNaturalLanguageInput(input.trim(), userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing AI request:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to process your request. Please try again.' 
    });
  }
});

export default router;
