import { Telegraf, session } from 'telegraf';
import { code } from 'telegraf/format';
import { message } from 'telegraf/filters';
import { config } from './config.js';
import { openai } from './services/openai.service.js';
import { oggToMp3 } from './services/convert.service.js';

const bot = new Telegraf(config.TG_TOKEN);

bot.use(session());

const INITIAL_SESSION = {
  messages: []
}

bot.command('new', async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply('I\'m waiting for your questions :)');
});

bot.on(message('voice'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;

  try {
    await ctx.reply(code('Waiting for an answer...'));

    const file_id = ctx.message.voice.file_id;
    const user_id = String(ctx.message.from.id);
    const file_link = await ctx.telegram.getFileLink(file_id);

    const ogg = await oggToMp3.create(file_link.href, user_id);
    const mp3 = await oggToMp3.toMp3(ogg, user_id);

    const text = await openai.transcription(mp3);

    await ctx.reply(code(`Your request: ${ text }`));

    ctx.session.messages.push({
      content: text,
      role:    openai.roles.USER
    });

    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({
      content: response.content,
      role:    openai.roles.ASSISTANT
    });

    await ctx.reply(response.content);
  } catch (e) {
    console.error('Error: Voice Message:', e.message);
  }
});

bot.on(message('text'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;

  try {
    await ctx.reply(code('Waiting for an answer...'));

    ctx.session.messages.push({
      content: ctx.message.text,
      role:    openai.roles.USER
    });

    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({
      content: response.content,
      role:    openai.roles.ASSISTANT
    });

    await ctx.reply(response.content);
  } catch (e) {
    console.error('Error: Voice Message:', e.message);
  }
});

console.log('App started.');

await bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
