import { Router, Request, Response } from 'express';
import { getEvents, getStats } from '../db/database';

const router = Router();

// GET /api/events - Get all events with optional filtering
router.get('/events', (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const filters: any = {};
    if (category) {
      filters.category = category;
    }
    if (search) {
      filters.search = search;
    }

    const events = getEvents(filters);
    res.json(events);

  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/stats - Get event statistics
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = getStats();
    res.json(stats);

  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/scrape - Trigger scraping (for testing/demo)
router.post('/scrape', async (req: Request, res: Response) => {
  try {
    res.json({
      message: 'Scraping is done via the seed script. Run: npm run seed',
      hint: 'This endpoint is for future implementation of on-demand scraping'
    });

  } catch (error: any) {
    console.error('Error triggering scrape:', error);
    res.status(500).json({ error: 'Failed to trigger scraping' });
  }
});

export default router;
