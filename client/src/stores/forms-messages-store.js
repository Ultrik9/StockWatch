import {makeVar} from '@apollo/client';

const formsMessagesStore = makeVar(
    {
        login:
            {
                isEnabled: false,
                type: null,
                message: null
            },
        signup:
            {
                isEnabled: false,
                type: null,
                message: null
            },
        addNewList:
            {
                isEnabled: false,
                type: null,
                message: null
            },
        addSymbolToList:
            {
                isEnabled: false,
                type: null,
                message: null
            }
    });

export default formsMessagesStore;