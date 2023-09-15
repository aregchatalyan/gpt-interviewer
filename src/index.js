import { Telegraf } from 'telegraf';
import { code } from 'telegraf/format';
import { message } from 'telegraf/filters';
import { config } from './config.js';
import { openai } from './services/openai.service.js';
import { oggToMp3 } from './services/convert.service.js';
import { textToSpeech } from './services/speech.service.js';

const bot = new Telegraf(config.TG_TOKEN);

bot.command('start', async (ctx) => {
  await ctx.reply(code('Waiting for your voice or text message'));
});

bot.on(message('voice'), async (ctx) => {
  try {
    await ctx.reply(code('Waiting for an answer...'));

    const file_id = ctx.message.voice.file_id;
    const user_id = String(ctx.message.from.id);
    const file_link = await ctx.telegram.getFileLink(file_id);

    const ogg = await oggToMp3.create(file_link.href, user_id);
    const mp3 = await oggToMp3.toMp3(ogg, user_id);

    const text = await openai.transcription(mp3);

    await ctx.reply(code(`Your request: ${ text }`));

    const response = await openai.chat([ {
      content: text,
      role: openai.roles.USER
    } ]);

    await ctx.reply(response.content);

    const source = await textToSpeech.toSpeech(response.content);

    await ctx.sendAudio(
      { source },
      { title: 'Reply from Assistant', performer: 'ChatGPT' }
    );
  } catch (e) {
    console.error('Error: Voice Message:', e.message);
  }
});

bot.on(message('text'), async (ctx) => {
  try {
    await ctx.reply(code('Waiting for an answer...'));

    const response = await openai.chat(ctx.message.text);

    await ctx.reply(response.content);
  } catch (e) {
    console.error('Error: Voice Message:', e.message);
  }
});

console.log('App started.');

await bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
