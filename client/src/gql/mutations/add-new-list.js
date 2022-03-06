import {gql} from '@apollo/client';

const ADD_NEW_LIST = gql`
    mutation AddNewList($input: NewListInput!) {
        addNewList(input: $input) {
            result
            errorReason
        }
    }`;

export default ADD_NEW_LIST;