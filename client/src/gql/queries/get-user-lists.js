import {gql} from '@apollo/client';

const GET_USER_LISTS = gql`
    query GetUserLists {
        getUserLists{
            result
            errorReason
            lists {
                id
                name
                isSocial
            }
        }
    }`;

export default GET_USER_LISTS;