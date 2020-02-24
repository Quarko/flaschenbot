import { User } from '../entity/User';
import { getRepository } from 'typeorm';
import { PostCode } from '../entity/PostCode';
import { validatePostcode } from '../utils/postcode';

export const postCodeHandler = async ctx => {
    const user: User = ctx.session.user;
    const postCodes = await getRepository(PostCode).find({ user: user });
    let message =
        postCodes.length > 0
            ? 'Aktuell sind für dich folgende Postleitzahlen hinterleg: \n'
            : 'Aktuell sind noch keine Postleitzahlen für dich hinterlegt. Schreib einfach eine Postleitzahl in den Chat, ich erkenne sie automatisch.';

    for (const postCode of postCodes) {
        message += `- ${postCode.postCode}`;
    }

    ctx.reply(message, ctx.session.menu);
};

export async function postCodeChangeHandler(ctx) {
    const user: User = ctx.session.user;
    const message: string = ctx.update.message.text;

    if (!validatePostcode(message)) {
        ctx.reply('Die Eingabe entspricht nicht dem Format einer deutschen Postleitzahl.', ctx.session.menu);
    }

    const count = await getRepository(PostCode).count({ postCode: message, user: user });

    if (count == 0) {
        const postCode = new PostCode();

        postCode.user = user;
        postCode.postCode = message;
        await getRepository(PostCode).save(postCode);
    } else {
        await getRepository(PostCode).delete({ postCode: message, user: user });
    }

    const reply =
        count > 0 ? `Die Postleitzahl ${message} wurde entfernt` : `Die Postleitzahl ${message} wurde hinzugefügt`;

    ctx.reply(reply, ctx.session.menu);
}
