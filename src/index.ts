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
import { bot } from './utils/bot';

// eslint-disable-next-line
const session = require('telegraf/session');

config();

if(process.env.NODE_ENV !== 'development') {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
}

connect(process.env.DATABASE_URL)
    .then(async () => {
        const scrapingJob = new CronJob('0 0,30 * * * *', async () => {
            try {
                console.log('Running web scraping job to identify offers...');
                await webScrapingJob();
            } catch (err) {
                console.error("Error: ", err);
            }
        },
        () => {
            console.log("Successfully ran webScraping job...")
        },
        true,
        'Europe/Berlin');

        scrapingJob.start();

        bot.use(session());
        bot.use(authHandler());

        bot.start(async ctx => {
            try {
                await welcomeHandler(ctx);
            } catch (err) {
                console.error("Error: ", err);
                ctx.reply('Oops. Bei deiner Abfrage ist etwas schief gelaufen. Ich werde mir das mal genauer anschauen.', ctx.session.menu)
            
            }
        });

        bot.command('plz', async ctx => {
            try {
                await postCodeHandler(ctx);
            } catch (err) {
                console.error("Error: ", err);
                ctx.reply('Oops. Bei deiner Abfrage ist etwas schief gelaufen. Ich werde mir das mal genauer anschauen.', ctx.session.menu)
            
            }
        });

        bot.command('stop', async ctx => {
            try {
                await stopHandler(ctx);
            } catch (err) {
                console.error("Error: ", err);
                ctx.reply('Oops. Bei deiner Abfrage ist etwas schief gelaufen. Ich werde mir das mal genauer anschauen.', ctx.session.menu)
            
            }
        });
        bot.command('help', ctx => helpHandler(ctx));

        bot.command('status', async ctx => {
            try {
                await statusHandler(ctx)
            } catch (err) {
                console.error("Error: ", err);
                ctx.reply('Oops. Bei deiner Abfrage ist etwas schief gelaufen. Ich werde mir das mal genauer anschauen.', ctx.session.menu)
            }
        });

        bot.on('text', async ctx => await postCodeChangeHandler(ctx));

        bot.catch((err, ctx) => {
                console.error("Error: ", err);
                ctx.reply('Oops. Bei deiner Abfrage ist etwas schief gelaufen. Ich werde mir das mal genauer anschauen.', ctx.session.menu)
        });

        bot.launch();
    })
    .catch(err => console.error(err));
