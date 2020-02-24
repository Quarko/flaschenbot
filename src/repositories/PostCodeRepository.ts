import { EntityRepository, Repository } from 'typeorm';
import { PostCode } from '../entity/PostCode';

@EntityRepository(PostCode)
export class PostCodeRepository extends Repository<PostCode> {}
