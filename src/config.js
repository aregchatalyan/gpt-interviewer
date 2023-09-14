import dotenv from 'dotenv';

dotenv.config();

export const env = {
  TG_TOKEN:       process.env.TG_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
}

const sanitize = (env) => {
  try {
    for (const variable in env) {
      if (!env[variable]) {
        throw new Error(`Error: Missing variable ${ variable } in environment.`);
      }

      const value = env[variable];
      if (value && typeof value === 'string' && !isNaN(value)) env[variable] = Number(value);
    }

    return env;
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

export const config = sanitize(env);
