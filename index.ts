import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  messages: Message[];
}

class ClaudeChatbot {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private conversation: Message[] = [];

  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY || '';
    this.baseUrl = 'https://api.anthropic.com/v3';
  }

  async sendMessage(message: string, imageData?: Buffer): Promise<string> {
    const userMessage: Message = { role: 'user', content: message };
    this.conversation.push(userMessage);

    try {
      const formData = new FormData();
      formData.append('prompt', this.conversation.map((m) => `${m.role}: ${m.content}`).join('\n'));
      formData.append('max_tokens', '1024');
      formData.append('stop_sequences', '\nUser:');
      if (imageData) {
        formData.append('image', imageData, 'image.png');
      }

      const response = await axios.post<ChatResponse>(`${this.baseUrl}/complete`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-API-Key': this.apiKey,
        },
      });

      if (response.status !== 200) {
        throw new Error(`Claude API returned ${response.status}: ${response.statusText}`);
      }

      const assistantMessage = response.data.messages.pop();
      if (!assistantMessage || assistantMessage.role !== 'assistant') {
        throw new Error('Invalid response from Claude API');
      }

      this.conversation.push(assistantMessage);
      return assistantMessage.content;
    } catch (error) {
      console.error('Error communicating with Claude API:', error);
      if (error.response) {
        console.error('API response:', error.response.data);
      }
      return 'I'm sorry, there seems to be an error communicating with the Claude API.';
    }
  }
}

// Usage example
const claude = new ClaudeChatbot();

async function main() {
  const userInput = prompt('Enter your message for Claude: ');
  let imageData: Buffer | undefined;

  const imageOption = prompt('Do you want to include an image? (y/n)');
  if (imageOption.toLowerCase() === 'y') {
    const imagePath = prompt('Enter the path to the image file: ');
    imageData = fs.readFileSync(imagePath);
  }

  const response = await claude.sendMessage(userInput, imageData);
  console.log('Claude:', response);
}

main();
