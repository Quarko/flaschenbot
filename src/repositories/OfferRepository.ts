import { EntityRepository, Repository } from 'typeorm';
import { Offer } from '../entity/Offer';

@EntityRepository(Offer)
export class OfferRepository extends Repository<Offer> {}
