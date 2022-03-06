import {gql} from '@apollo/client';

const DELETE_LIST = gql`
    mutation DeleteList($input: ListDeleteInput!) {
        deleteList(input: $input) {
            result
            errorReason
        }
    }`;

export default DELETE_LIST;