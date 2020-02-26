import { User } from '../entity/User';
import { getRepository } from 'typeorm';

// eslint-disable-next-line
const Telegraf = require('telegraf')

export async function welcomeHandler(ctx) {
    const user = new User();
    const telegramUser = ctx.update.message.from;

    const count = await getRepository(User).count({ telegramId: telegramUser.id });

    if (count > 0) {
        await getRepository(User).update({ telegramId: telegramUser.id }, { isActive: true });
        ctx.reply('Willkommen zurück beim flaschenbot :)', ctx.session.menu);
        return;
    }

    user.telegramId = telegramUser.id;
    user.firstName = telegramUser.first_name;
    user.language = telegramUser.language_code;
    ctx.session.user = await getRepository(User).save(user);

    ctx.reply('Willkommen beim flaschenbot, ich informiere dich regelmäßig über Angebote :)', ctx.session.menu);
}

export const stopHandler = async ctx => {
    const user: User = ctx.session.user;
    user.isActive = false;
    await getRepository(User).save(user);

    ctx.reply(
        'Schade das du gehen möchtest. Du wurdest aus dem Verteiler entfernt. Schreibe /start wenn du wieder Angebote bekommen möchtest.',
        Telegraf.Markup.keyboard(['/start'])
        .resize()
        .extra(),
        );
};
