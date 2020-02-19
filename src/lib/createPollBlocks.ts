import { BlockBuilder, BlockElementType } from '@rocket.chat/apps-engine/definition/uikit';

import { IPoll } from '../IPoll';
import { buildVoteGraph } from './buildVoteGraph';
import { buildVoters } from './buildVoters';

export function createPollBlocks(block: BlockBuilder, question: string, options: Array<any>, poll: IPoll, showNames: boolean) {
    block.addSectionBlock({
        text: block.newPlainTextObject(question),
        accessory: {
            type: BlockElementType.OVERFLOW_MENU,
            actionId: 'extraOptions',
            options: [
                {
                    text: block.newPlainTextObject('Duplicate'),
                    value: 'duplicate',
                },
                ...(!poll.finished
                    ? [{
                        text: block.newPlainTextObject('Finish poll'),
                        value: 'finish',
                    }]
                    : []),
            ],
        },
    });

    if (poll.finished) {
        block.addContextBlock({
            elements: [
                block.newMarkdownTextObject(`The poll has been finished at ${new Date().toUTCString()}`),
            ],
        });
    }

    block.addDividerBlock();

    options.forEach((option, index) => {
        block.addSectionBlock({
            text: block.newPlainTextObject(option),
            ...!poll.finished && {
                    accessory: {
                    type: BlockElementType.BUTTON,
                    actionId: 'vote',
                    text: block.newPlainTextObject('Vote'),
                    value: String(index),
                },
            },
        });

        if (!poll.votes[index]) {
            return;
        }

        const graph = buildVoteGraph(poll.votes[index], poll.totalVotes);
        block.addContextBlock({
            elements: [
                block.newMarkdownTextObject(graph),
            ],
        });

        if (poll.confidential) {
            return;
        }

        const voters = buildVoters(poll.votes[index], showNames);
        if (!voters) {
            return;
        }

        block.addContextBlock({
            elements: [
                block.newMarkdownTextObject(voters),
            ],
        });
    });
}
