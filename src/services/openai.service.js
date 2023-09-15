import fs from 'fs';
import OpenAI from 'openai';
import { config } from '../config.js';

class OpenAi {
  roles = {
    USER: 'user',
    SYSTEM: 'system',
    ASSISTANT: 'assistant'
  }

  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
  }

  async chat(messages) {
    try {
      const response = await this.openai.chat.completions.create({
        messages,
        model: 'gpt-3.5-turbo'
      });

      return response.choices[0].message;
    } catch (e) {
      console.error('Error: Chat:', e.message);
    }
  }

  async transcription(filepath) {
    try {
      const response = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(filepath),
        model: 'whisper-1'
      });

      return response.text;
    } catch (e) {
      console.error('Error: Transcription:', e.message);
    }
  }
}

export const openai = new OpenAi(config.OPENAI_API_KEY);
