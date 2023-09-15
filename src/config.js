import dotenv from 'dotenv';

dotenv.config();

const isJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export const env = {
  TG_TOKEN: process.env.TG_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_APIS: process.env.GOOGLE_APIS
}

const sanitize = (env) => {
  try {
    for (const variable in env) {
      if (!env[variable]) {
        throw new Error(`Error: Missing variable ${ variable } in environment.`);
      }

      const value = env[variable];
      if (value && typeof value === 'string' && !isNaN(value)) env[variable] = Number(value);
      if (value && typeof value === 'string' && isJSON(value)) env[variable] = JSON.parse(value);
    }

    return env;
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

export const config = sanitize(env);
