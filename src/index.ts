import * as Sentry from '@sentry/node';
import { CronJob } from 'cron';
import { config } from 'dotenv';
import * as express from "express";
import 'reflect-metadata';
import { connect } from './database';
import { authHandler } from './middleware';
import { helpHandler } from './service/help';
import { webScrapingJob } from './service/job';
import { postCodeChangeHandler, postCodeHandler } from './service/postCode';
import { statusHandler } from './service/status';
import { stopHandler, welcomeHandler } from './service/subscription';
import { bot } from './utils/bot';

const app = express();
const port = 80;

// eslint-disable-next-line
const session = require('telegraf/session');

config();

if(process.env.NODE_ENV !== 'development') {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
}

app.get('/health', (req, res) => {
    res.status(200).json({
        "status": "Ok"
    });
});

app.listen(port, () => {
    console.log( `Server started at http://localhost:${ port }` );
});


connect(process.env.DATABASE_URL)
    .then(async () => {
        if(process.env.NODE_ENV !== 'development') {
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
        }

        bot.use(session());
        bot.use(authHandler());

        bot.start(async ctx => {
            try {
                await welcomeHandler(ctx);
            } catch (err) {
                console.error("Error: ", err);
                ctx.reply('Oops. Bei deiner Abfrage ist etwas schief gelaufen. Ich werde mir das mal genauer anschauen.', ctx.session?.menu)
            }
        });

        bot.command('plz', async ctx => {
            try {
                await postCodeHandler(ctx);
            } catch (err) {
                console.error("Error: ", err);
                ctx.reply('Oops. Bei deiner Abfrage ist etwas schief gelaufen. Ich werde mir das mal genauer anschauen.', ctx.session?.menu)
            
            }
        });

        bot.command('stop', async ctx => {
            try {
                await stopHandler(ctx);
            } catch (err) {
                console.error("Error: ", err);
                ctx.reply('Oops. Bei deiner Abfrage ist etwas schief gelaufen. Ich werde mir das mal genauer anschauen.', ctx.session?.menu)
            }
        });
        bot.command('help', ctx => helpHandler(ctx));

        bot.command('status', async ctx => {
            try {
                await statusHandler(ctx)
            } catch (err) {
                console.error("Error: ", err);
                ctx.reply('Oops. Bei deiner Abfrage ist etwas schief gelaufen. Ich werde mir das mal genauer anschauen.', ctx.session?.menu)
            }
        });

        bot.on('text', async ctx => await postCodeChangeHandler(ctx));

        bot.catch((err, ctx) => {
            console.error("Error: ", err);
            if(typeof ctx.reply === 'function') {
                ctx.reply('Oops. Bei deiner Abfrage ist etwas schief gelaufen. Ich werde mir das mal genauer anschauen.', ctx.session?.menu)
            } else {
                console.log("Context: ", ctx);
            }
        });

        bot.launch();
    })
    .catch(err => console.error(err));
