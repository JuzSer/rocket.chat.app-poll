import { IModify, IPersistence } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';

import { IPoll } from './../IPoll';
import { uuid } from './uuid';

export async function createPollModal({ id = '', question, persistence, data, pollData, modify, options = 2 }: {
    id?: string,
    question?: string,
    persistence: IPersistence,
    data,
    pollData?: IPoll,
    modify: IModify,
    options?: number,
}): Promise<IUIKitModalViewParam> {
    const viewId = id || uuid();

    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, viewId);
    await persistence.createWithAssociation({ room: data.room }, association);

    const block = modify.getCreator().getBlockBuilder();
    block.addInputBlock({
        blockId: 'poll',
        element: block.newPlainTextInputElement({ initialValue: question, actionId: 'question' }),
        label: block.newPlainTextObject('Insert your question'),
    })
    .addDividerBlock();

    for (let i = 0; i < options; i++) {
        const optionValue = pollData ? pollData.options[i] : undefined;

        block.addInputBlock({
            blockId: 'poll',
            optional: true,
            element: block.newPlainTextInputElement({
                actionId: `option-${i}`,
                placeholder: block.newPlainTextObject('Insert an option'),
                initialValue: optionValue,
            }),
            label: block.newPlainTextObject(''),
        });
    }

    block
        .addActionsBlock({
            blockId: 'config',
            elements: [
                block.newStaticSelectElement({
                    placeholder: block.newPlainTextObject('Multiple choices'),
                    actionId: 'mode',
                    initialValue: pollData && pollData.singleChoice ? 'single' : 'multiple',
                    options: [
                        {
                            text: block.newPlainTextObject('Multiple choices'),
                            value: 'multiple',
                        },
                        {
                            text: block.newPlainTextObject('Single choice'),
                            value: 'single',
                        },
                    ],
                }),
                block.newButtonElement({
                    actionId: 'addChoice',
                    text: block.newPlainTextObject('Add a choice'),
                    value: String(options + 1),
                }),
                block.newStaticSelectElement({
                    placeholder: block.newPlainTextObject('Open vote'),
                    actionId: 'visibility',
                    initialValue: pollData && pollData.confidential ? 'confidential' : 'open',
                    options: [
                        {
                            text: block.newPlainTextObject('Open vote'),
                            value: 'open',
                        },
                        {
                            text: block.newPlainTextObject('Confidential vote'),
                            value: 'confidential',
                        },
                    ],
                }),
            ],
        });

    return {
        id: viewId,
        title: block.newPlainTextObject('Create a poll'),
        submit: block.newButtonElement({
            text: block.newPlainTextObject('Create'),
        }),
        close: block.newButtonElement({
            text: block.newPlainTextObject('Dismiss'),
        }),
        blocks: block.getBlocks(),
    };
}
