import {gql} from '@apollo/client';

const ADD_SYMBOL_TO_LIST = gql`
    mutation AddSymbolToList($input: SymbolAddInput!) {
        addSymbolToList(input: $input) {
            result
            errorReason
        }
    }`;

export default ADD_SYMBOL_TO_LIST;