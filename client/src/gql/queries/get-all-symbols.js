import {gql} from '@apollo/client';

const GET_ALL_SYMBOLS = gql`
    query GetAllSymbols {
        getAllSymbols {
            result
            errorReason
            symbols {
                symbolId
                symbol
                name
            }
        }
    }`;

export default GET_ALL_SYMBOLS;