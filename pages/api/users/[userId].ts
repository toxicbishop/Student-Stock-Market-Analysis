import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../src/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PATCH') {
    const { name, bio, college, profile_photo } = req.body;
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name, bio, college, profile_photo },
      });
      res.status(200).json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    // Sync/Register user (if not exists)
    const { email, name } = req.body;
    try {
      const user = await prisma.user.upsert({
        where: { id: userId },
        update: { name },
        create: { id: userId, email, name, hashed_password: '' },
      });
      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
