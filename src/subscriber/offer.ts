import { EventSubscriber, EntitySubscriberInterface, InsertEvent, getRepository } from "typeorm";
import { Offer } from "../entity/Offer";
import { generateMessage } from "../service/job";
import { bot } from "../utils/bot";

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Offer> {


    /**
     * Indicates that this subscriber only listen to Post events.
     */
    listenTo() {
        return Offer;
    }

    /**
     * Called after offer insertion.
     */
    async afterInsert(event: InsertEvent<Offer>) {
        const offer : Offer = await getRepository(Offer)
            .createQueryBuilder("offer")
            .leftJoinAndSelect("offer.postCode", "postCode")
            .leftJoinAndSelect("postCode.users", "user")
            .where("offer.id = :id", {id: event.entity.id})
            .getOne();

        for (const user of offer.postCode.users) {
            const reply = `Neue ${generateMessage([offer], offer.postCode.postCode)}\n`;   
            bot.telegram.sendMessage(user.telegramId, reply);
        }
    }
}