import {gql} from '@apollo/client';

const GENERIC_LOGIN = gql`
    mutation GenericLogin($input: GenericSignupInput!) {
        genericLogin(input: $input) {
            result
            errorReason
            id
        }
    }`;

export default GENERIC_LOGIN;