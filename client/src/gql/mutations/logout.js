import {gql} from '@apollo/client';

const LOGOUT = gql`
    mutation Logout($input: LogoutInput!) {
        logout(input: $input) {
            result
            errorReason
        }
    }`;

export default LOGOUT;