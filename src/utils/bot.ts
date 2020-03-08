import { config } from 'dotenv';

// eslint-disable-next-line
const Telegraf = require('telegraf');

config();

export const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
