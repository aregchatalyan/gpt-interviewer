import axios from 'axios';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

class TextToSpeech {
  async getToken() {
    try {
      const token = jwt.sign({
          iss: config.GOOGLE_APIS.client_email,
          scope: 'https://www.googleapis.com/auth/cloud-platform',
          aud: 'https://www.googleapis.com/oauth2/v4/token',
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
          iat: Math.floor(Date.now() / 1000)
        }, config.GOOGLE_APIS.private_key, { algorithm: 'RS256' }
      );

      const response = await axios.post('https://www.googleapis.com/oauth2/v4/token', {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token
      });

      return response.data.access_token;
    } catch (e) {
      console.error('Error: Get Token:', e.message);
    }
  }

  async toSpeech(text) {
    try {
      const access_token = await this.getToken();

      const response = await axios({
        url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
        method: 'POST',
        data: {
          input: { text },
          voice: {
            languageCode: 'ru-RU',
            name: 'ru-RU-Wavenet-D'
          },
          audioConfig: {
            pitch: 0,
            speakingRate: 1.50,
            audioEncoding: 'MP3',
            effectsProfileId: [ 'small-bluetooth-speaker-class-device' ]
          }
        },
        headers: {
          Authorization: `Bearer ${ access_token }`,
          'Content-Type': 'application/json'
        }
      });

      return Buffer.from(response.data.audioContent, 'base64');
    } catch (e) {
      console.error('Error: Text To Speech:', e);
    }
  }
}

export const textToSpeech = new TextToSpeech();
