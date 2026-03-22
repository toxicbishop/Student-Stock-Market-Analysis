import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, created_by, initial_contribution, vote_mode } = req.body;
    
    try {
      const inviteCode = 'TL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const group = await prisma.group.create({
        data: {
          name,
          created_by,
          invite_code: inviteCode,
          virtual_corpus: initial_contribution,
          vote_mode: vote_mode || 'majority',
          members: {
            create: {
              user_id: created_by,
              contribution: initial_contribution,
              units_held: initial_contribution / 100.0, // Initial NAV 100
            }
          }
        }
      });

      res.status(201).json(group);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // List all groups for a user
    const { user_id } = req.query;
    if (!user_id || typeof user_id !== 'string') return res.status(400).json({ error: 'User ID required' });

    try {
      const groups = await prisma.group.findMany({
        where: { members: { some: { user_id: user_id } } },
        include: { _count: { select: { members: true } } }
      });
      res.status(200).json(groups);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
