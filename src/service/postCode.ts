import { User } from '../entity/User';
import { getConnection, getManager, getRepository } from 'typeorm';
import { PostCode } from '../entity/PostCode';
import { validatePostcode } from '../utils/postcode';
import { FlaschenpostScraper } from '../utils/scraper';

export const postCodeHandler = async ctx => {
    const user: User = ctx.session.user;
    const postCodes = await getRepository(PostCode)
        .createQueryBuilder('post_code')
        .leftJoinAndSelect('post_code.users', 'user')
        .where('user.id = :userId', { userId: user.id })
        .getMany();

    let message =
        postCodes.length > 0
            ? 'Aktuell sind für dich folgende Postleitzahlen hinterleg: \n'
            : 'Aktuell sind noch keine Postleitzahlen für dich hinterlegt. Schreib einfach eine Postleitzahl in den Chat, ich erkenne sie automatisch.';

    for (const postCode of postCodes) {
        message += `- ${postCode.postCode}\n`;
    }

    ctx.reply(message, ctx.session.menu);
};

export async function postCodeChangeHandler(ctx) {
    const user: User = ctx.session.user;
    const message: string = ctx.update.message.text;

    if (!validatePostcode(message)) {
        ctx.reply('Die Eingabe entspricht nicht dem Format einer deutschen Postleitzahl.', ctx.session.menu);
        return;
    }

    const userPostCode = await getRepository(PostCode)
        .createQueryBuilder('post_code')
        .leftJoinAndSelect('post_code.users', 'user')
        .andWhere('post_code.postCode = :postCode', { postCode: message })
        .andWhere('user.id = :userId', { userId: user.id })
        .getOne();

    const newPostCode = typeof userPostCode === 'undefined';

    if (newPostCode) {
        let postCode = await getRepository(PostCode).findOne({ postCode: message });

        if (typeof postCode === 'undefined') {
            const Scraper = new FlaschenpostScraper(process.env.URL);
            const exists = await Scraper.postCodeExists(message);

            if (!exists) {
                ctx.reply(
                    'Die Postleitzahl wird von flaschenpost leider noch nicht angeboten. Du kannst hier nachschauen, wo flaschenpost bereits angeboten wird: https://www.flaschenpost.de/liefergebiete',
                    ctx.session.menu,
                );
                return;
            }
            postCode = new PostCode();
            postCode.users = [user];
            postCode.postCode = message;
        } else {
            if (typeof postCode.users === 'object') {
                postCode.users.push(user);
            } else {
                postCode.users = [user];
            }
        }

        await getManager().save(postCode);
    } else {
        userPostCode.users = userPostCode.users.filter(u => {
            u.id != user.id;
        });

        await getManager().save(userPostCode);
    }

    const reply = newPostCode
        ? `Die Postleitzahl ${message} wurde hinzugefügt`
        : `Die Postleitzahl ${message} wurde entfernt`;

    ctx.reply(reply, ctx.session.menu);
}
