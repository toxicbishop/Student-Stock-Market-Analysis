import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../src/lib/db';
import yahooFinance from 'yahoo-finance2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { proposal_id, voter_id, vote: voteValue } = req.body;

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposal_id },
      include: { group: { include: { members: true } } }
    });

    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    if (proposal.status !== 'open') return res.status(400).json({ error: `Already ${proposal.status}` });

    // Check duplicate vote
    const existing = await prisma.vote.findFirst({ where: { proposal_id, voter_id } });
    if (existing) return res.status(400).json({ error: 'Already voted' });

    // Record vote
    await prisma.vote.create({
      data: { proposal_id, voter_id, vote: voteValue }
    });

    // Strategy: Update status and potentially execute
    const allVotes = await prisma.vote.findMany({ where: { proposal_id } });
    const yesCount = allVotes.filter(v => ['yes', 'disagree_but_allow'].includes(v.vote)).length;
    const noCount = allVotes.filter(v => v.vote === 'no').length;
    const totalMembers = proposal.group.members.length;

    let newStatus: any = proposal.status;
    const mode = proposal.group.vote_mode;

    if (mode === 'majority') {
      const majority = Math.floor(totalMembers / 2) + 1;
      if (yesCount >= majority) newStatus = 'executed';
      else if (noCount >= majority) newStatus = 'rejected';
    } else {
      if (yesCount === totalMembers) newStatus = 'executed';
      else if (noCount >= 1) newStatus = 'rejected';
    }

    if (newStatus === 'executed') {
      await _executeGroupTrade(proposal.id);
    }

    await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: newStatus }
    });

    res.status(200).json({ status: newStatus });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

async function _executeGroupTrade(proposalId: string) {
    const proposal = await prisma.proposal.findUnique({ 
        where: { id: proposalId }, 
        include: { group: true } 
    });
    if (!proposal) return;

    try {
        const quote = await yahooFinance.quote(`${proposal.ticker}.NS`);
        const price = (quote as any).regularMarketPrice || proposal.price_at_proposal;
        const cost = price * proposal.quantity;

        if (proposal.action === 'BUY') {
            if (proposal.group.virtual_corpus < cost) return;
            await prisma.group.update({ where: { id: proposal.group_id }, data: { virtual_corpus: { decrement: cost } } });
            
            const existing = await prisma.groupHolding.findFirst({ where: { group_id: proposal.group_id, ticker: proposal.ticker } });
            if (existing) {
                const newQty = existing.quantity + proposal.quantity;
                const newAvg = (existing.quantity * existing.avg_buy_price + cost) / newQty;
                await prisma.groupHolding.update({ where: { id: existing.id }, data: { quantity: newQty, avg_buy_price: newAvg } });
            } else {
                await prisma.groupHolding.create({ data: { group_id: proposal.group_id, ticker: proposal.ticker, quantity: proposal.quantity, avg_buy_price: price } });
            }
        } else {
             await prisma.group.update({ where: { id: proposal.group_id }, data: { virtual_corpus: { increment: cost } } });
             await prisma.groupHolding.deleteMany({ where: { group_id: proposal.group_id, ticker: proposal.ticker, quantity: proposal.quantity } });
        }
    } catch (e) {
        console.error("Group trade execution failed", e);
    }
}
