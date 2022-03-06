import {makeVar} from '@apollo/client';

const authStore = makeVar({login: {isLoggedIn: false, name: null, email: null, id: null}});

export default authStore;