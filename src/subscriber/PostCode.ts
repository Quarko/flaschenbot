import { EventSubscriber, EntitySubscriberInterface, InsertEvent, getRepository } from 'typeorm';
import { updateOffersForPostCodes } from '../service/job';
import { PostCode } from '../entity/PostCode';

@EventSubscriber()
export class PostCodeSubscriber implements EntitySubscriberInterface<PostCode> {
    /**
     * Indicates that this subscriber only listen to Post events.
     */
    listenTo() {
        return PostCode;
    }

    /**
     * Called after offer insertion.
     */
    async afterInsert(event: InsertEvent<PostCode>) {
        await updateOffersForPostCodes([event.entity], false);
    }
}
