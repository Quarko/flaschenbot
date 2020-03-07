import {User} from '../entity/User';
import {PostCode} from '../entity/PostCode';
import {getRepository} from 'typeorm';
import {updateOffersForPostCodes, generateMessage} from './job';
import { Offer } from '../entity/Offer';

export const statusHandler = async ctx => {
    const user: User = ctx.session.user;

    const postCodesLatestOffers : PostCode [] = await getRepository(PostCode)
        .createQueryBuilder("post_code")
        .leftJoinAndSelect("post_code.offers", "offer")
        .leftJoinAndSelect("post_code.users", "user")
        .where("offer.isLatest = :latest", {latest: true})
        .andWhere("user.id = :userId", {userId: user.id})
        .getMany();

    console.log(postCodesLatestOffers);

    let reply = ""

    if(typeof postCodesLatestOffers !== "undefined") {
        for(const postCode of postCodesLatestOffers) {
            reply += `${generateMessage(postCode.offers, postCode.postCode)}\n`;
        }
    } else {
        const userPostCodes = await getRepository(PostCode)
        .createQueryBuilder("post_code")
        .leftJoinAndSelect("post_code.users", "user")
        .where("user.id = :userId", {userId: user.id})
        .getMany();

        reply = await updateOffersForPostCodes(userPostCodes, true);
    }

    if (reply !== '') {
        ctx.reply(reply, ctx.session.menu);
    } else {
        ctx.reply(
            'Für deinen Benutzer sind keine Postleitzahlen hinterlegt, um den Status abfragen zu können. Schreibe eine Postleitzahl in den Chat, für die du den Status abfragen möchtest.',
            ctx.session.menu,
        );
    }
};
