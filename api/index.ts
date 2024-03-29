import { VercelRequest, VercelResponse } from '@vercel/node';
import { ClaudeChatbot } from '../index';

const claude = new ClaudeChatbot();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message, imageData } = req.body;
    const response = await claude.sendMessage(message, imageData);
    res.status(200).json({ response });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
}
