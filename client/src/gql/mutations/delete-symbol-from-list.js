import {gql} from '@apollo/client';

const DELETE_SYMBOL_FROM_LIST = gql`
    mutation DeleteSymbolFromList($input: SymbolDeleteInput!) {
        deleteSymbolFromList(input: $input) {
            result
            errorReason
        }
    }`;

export default DELETE_SYMBOL_FROM_LIST;