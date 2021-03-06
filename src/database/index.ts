import { createConnection, Connection, Repository } from 'typeorm';
import { Offer } from '../entity/Offer';
import { User } from '../entity/User';
import { PostCode } from '../entity/PostCode';

let _connection: Connection;

export async function connect(databaseFN: string) {
    return (_connection = await createConnection());
}

export function connected() {
    return typeof _connection !== 'undefined';
}
