import {gql} from '@apollo/client';

const GET_USER_LIST_DATA = gql`
    query GetUserListData($input: UserListInput!) {
        getUserListData(input: $input){
            result
            errorReason
            listId
            listName
            isSocial
            listShareId
            symbolsData {
                symbolId
                symbol
                name
                sharesAmount
                buyPrice
                price
                change
                candles {
                    prices
                    timestamps
                }
            }
        }
    }`;

export default GET_USER_LIST_DATA;