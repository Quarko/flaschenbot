import { User } from '../entity/User';
import { PostCode } from '../entity/PostCode';
import { getRepository } from 'typeorm';
import { updateOffersForPostCodes } from './job';

export const statusHandler = async ctx => {
    const user: User = ctx.session.user;
    const postCodes: PostCode[] = await getRepository(PostCode).find({ user: user });

    try {
        const reply = await updateOffersForPostCodes(postCodes, true);

        if (reply !== '') {
            ctx.reply(reply, ctx.session.menu);
        } else {
            ctx.reply(
                'Für deinen Benutzer sind keine Postleitzahlen hinterlegt, um den Status abfragen zu können.',
                ctx.session.menu,
            );
        }
    } catch (error) {
        console.log(error);
        ctx.reply(
            'Oops. Bei deiner Abfrage ist etwas schief gelaufen. Ich werde mir das mal genauer anschauen.',
            ctx.session.menu,
        );
    }
};
