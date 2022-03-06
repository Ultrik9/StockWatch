import {gql} from '@apollo/client';

const GENERIC_SIGNUP = gql`
    mutation GenericSignup($input: GenericSignupInput!) {
        genericSignup(input: $input) {
            result
            errorReason
            id
        }
    }`;

export default GENERIC_SIGNUP;