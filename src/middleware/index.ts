import { getRepository } from 'typeorm';
import { User } from '../entity/User';

// eslint-disable-next-line
const Telegraf = require('telegraf');

export const authHandler = () => async (ctx, next) => {
    const now = new Date().getTime() / 1000
    if (ctx.update.message?.date < (now - 60 * 15)) {
      return;
    }

    const telegramUser = ctx.update.message?.from;
    const userRepository = getRepository(User);
    let user = await userRepository.findOne({ telegramId: telegramUser.id });

    if (typeof user === 'undefined') {
        user = null;
    }

    if ((!user || !user.isActive) && ctx.update.message.text !== '/start') {
        ctx.reply(
            'Bitte nutze das Kommando /start um regelmäßig von mir informiert zu werden.',
            Telegraf.Markup.keyboard(['/start'])
                .resize()
                .extra(),
        );
    } else {
        ctx.session.user = user;
        ctx.session.menu = Telegraf.Markup.keyboard(['/plz', '/status', '/help', '/stop'])
            .resize()
            .extra();
        next();
    }
};
