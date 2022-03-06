import {gql} from '@apollo/client';

const AUTHORIZE = gql`
    mutation Authorize {
        authorize {
            result
            errorReason
            id
            email
        }
    }`;

export default AUTHORIZE;