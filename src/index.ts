import 'reflect-metadata';
import { config } from 'dotenv';
import { connect } from './db';
import { CronJob } from 'cron';
import { authHandler } from './middleware';
import { stopHandler, welcomeHandler } from './service/subscription';
import { postCodeHandler, postCodeChangeHandler } from './service/postCode';
import { userInformJob, webScrapingJob } from './service/job';
import { statusHandler } from './service/status';
import { helpHandler } from './service/help';

// eslint-disable-next-line
const Telegraf = require('telegraf');
// eslint-disable-next-line
const session = require('telegraf/session');

config();

connect(process.env.DATABASE_URL)
    .then(async () => {
        const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

        const job = new CronJob(
            '* * 10 * * *',
            async () => {
                console.log('Running daily job to identify offers...');
                await webScrapingJob();
                await userInformJob(bot);
            },
            null,
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

        bot.launch();
    })
    .catch(err => console.log(err));
