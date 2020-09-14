import { PostCode } from '../entity/PostCode';
import { FlaschenpostScraper } from '../utils/scraper';
import { getRepository } from 'typeorm';
import { Offer } from '../entity/Offer';
import { User } from '../entity/User';

export function generateMessage(offers: Offer[], postCode: string): string {
    let reply = '';

    if (offers.length > 0) {
        offers
            .reduce((arr, t) => {
                const index = arr.findIndex(e => e.category === t.category);

                if (index >= 0) {
                    arr[index].offers.push(t);
                } else {
                    arr.push({
                        category: t.category,
                        offers: [t],
                    });
                }

                return arr;
            }, [])
            .forEach((e, i) => {
                reply += `Angebote in ${postCode} für ${e.category
                    .split('-')
                    .map(t => t[0].toUpperCase() + t.slice(1))
                    .join(' ')}:\n`;

                e.offers.forEach(offer => {
                    reply += `- ${offer.name}: (${offer.bottleAmount} x ${offer.bottleSize}) ${offer.price}€ (${offer.oldPrice}€)\n`;
                });
                reply += '\n';
            });
    } else {
        return `Keine Angebote für die Postleitzahl ${postCode}`;
    }

    return reply;
}

export const updateOffersForPostCodes = async (postCodes: PostCode[], requireMessage: boolean): Promise<any> => {
    const Scraper = new FlaschenpostScraper(process.env.URL);

    let reply = '';

    for (const postCode of postCodes) {
        const latestOffers: Offer[] = await Scraper.getOffersForPostCodes(postCode.postCode);
        const offers = await getRepository(Offer).find({ postCode: postCode, isLatest: true });

        for (const latestOffer of latestOffers) {
            const exist = offers.some(
                e =>
                    e.name == latestOffer.name &&
                    e.bottleAmount == latestOffer.bottleAmount &&
                    e.bottleSize == latestOffer.bottleSize &&
                    e.price == latestOffer.price &&
                    e.category == latestOffer.category,
            );

            if (!exist) {
                const newOffer = { ...latestOffer, postCode: postCode, isLatest: true };
                await getRepository(Offer).save(newOffer);
            }
        }

        for (const offer of offers) {
            const exist = latestOffers.some(
                e =>
                    e.name === offer.name &&
                    e.bottleAmount === offer.bottleAmount &&
                    e.bottleSize === offer.bottleSize &&
                    e.price == offer.price &&
                    e.category == offer.category,
            );

            if (!exist) {
                offer.isLatest = false;
                await getRepository(Offer).save(offer);
            }
        }

        if (requireMessage) {
            reply += `${generateMessage(latestOffers, postCode.postCode)}\n`;
        }
    }

    return reply;
};
export const webScrapingJob = async () => {
    const postCodes: PostCode[] = await getRepository(PostCode).find();

    await updateOffersForPostCodes(postCodes, false);
};
export const userInformJob = async bot => {
    const users = await getRepository(User)
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.postCodes', 'post_code')
        .leftJoinAndSelect('post_code.offers', 'offer')
        .where('offer.isLatest = :latest', { latest: true })
        .getMany();

    for (const user of users) {
        let reply = '';

        for (const postCode of user.postCodes) {
            reply += generateMessage(postCode.offers, postCode.postCode);
        }

        bot.telegram.sendMessage(user.telegramId, reply);
    }
};
