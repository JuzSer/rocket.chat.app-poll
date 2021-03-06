import { IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';

import { IPoll } from '../IPoll';

export async function getPoll(msgId: string, read: IRead): Promise<IPoll> {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, msgId);
    const polls = await read.getPersistenceReader().readByAssociation(association);
    if (!polls || polls.length < 1) {
        throw new Error('No poll found');
    }
    return polls[0] as IPoll;
}
