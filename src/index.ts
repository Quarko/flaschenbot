import 'reflect-metadata';
import { config } from 'dotenv';
import { connect } from './database';
import { CronJob } from 'cron';
import { authHandler } from './middleware';
import { stopHandler, welcomeHandler } from './service/subscription';
import { postCodeHandler, postCodeChangeHandler } from './service/postCode';
import { userInformJob, webScrapingJob } from './service/job';
import { statusHandler } from './service/status';
import { helpHandler } from './service/help';
import * as Sentry from '@sentry/node';

// eslint-disable-next-line
const Telegraf = require('telegraf');
// eslint-disable-next-line
const session = require('telegraf/session');

config();

if(process.env.NODE_ENV !== 'development') {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
}

connect(process.env.DATABASE_URL)
    .then(async () => {
        const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

        const job = new CronJob(
            '0 0 9 * * *',
            async () => {
                console.log('Running daily job to identify offers...');
                await webScrapingJob();
                await userInformJob(bot);
            },
            () => {
                    console.log("Successfully ran daily job...")
            },
            true,
            'Europe/Berlin',
        );

        job.start();

        bot.use(session());
        bot.use(authHandler());

        bot.start(async ctx => await welcomeHandler(ctx));

        bot.command('plz', async ctx => await postCodeHandler(ctx));

        bot.command('stop', async ctx => await stopHandler(ctx));

        bot.command('help', ctx => helpHandler(ctx));

        bot.command('status', async ctx => await statusHandler(ctx));

        bot.on('text', async ctx => await postCodeChangeHandler(ctx));

        bot.catch((err, ctx) => {
                console.error("Error: ", err);
                ctx.reply('Oops. Bei deiner Abfrage ist etwas schief gelaufen. Ich werde mir das mal genauer anschauen.', ctx.session.menu)
        });

        bot.launch();
    })
    .catch(err => console.log(err));
