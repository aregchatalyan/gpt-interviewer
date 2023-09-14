import fs from 'fs';
import url from 'url';
import path from 'path';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

class OggToMp3 {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path);
  }

  async toMp3(ogg, mp3) {
    try {
      const mp3_dir = path.join(path.dirname(ogg), `${ mp3 }.mp3`);

      return new Promise((resolve, reject) => {
        ffmpeg(ogg)
          .inputOption('-t 30')
          .output(mp3_dir)
          .on('end', () => {
            fs.promises.unlink(ogg);
            resolve(mp3_dir);
          })
          .on('error', (err) => reject(err.message))
          .run();
      });
    } catch (e) {
      console.error('Error: Create Mp3:', e.message);
    }
  }

  async create(url, filename) {
    try {
      const response = await axios({ method: 'GET', url, responseType: 'stream' });

      const ogg_dir = path.join(__dirname, '../../voices', `${ filename }.ogg`);

      return new Promise((resolve) => {
        const stream = fs.createWriteStream(ogg_dir);

        response.data.pipe(stream);

        stream.on('finish', () => resolve(ogg_dir));
      });
    } catch (e) {
      console.error('Error: Create Ogg:', e.message);
    }
  }
}

export const oggToMp3 = new OggToMp3();
