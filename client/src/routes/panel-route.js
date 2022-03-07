import Cookies from 'js-cookie'
import Panel from "../components/panel/panel";
import authStore from '../stores/auth-store';
import {useApolloClient, useMutation, useReactiveVar} from "@apollo/client";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import useTitle from "../hooks/use-title";
import PageSpinner from "../components/page-spinner/page-spinner";

import AUTHORIZE from '../gql/mutations/authorize';
import config from "../config";


function PanelRoute(props) {


    useTitle(props.title);

    const navigate = useNavigate();

    const store = useReactiveVar(authStore);

    const [authorizeMutation, {data, loading, error}] = useMutation(AUTHORIZE);

    const client = useApolloClient();

    useEffect(() => {

        const token = Cookies.get(config.socialAuthTempCookieName);

        if (token) {
            localStorage.setItem(config.localStorageTokenName, token);
            Cookies.remove(config.socialAuthTempCookieName);
        }

        if (localStorage.getItem(config.localStorageTokenName)) {

            (async () => {

                try {
					
                    const authorizeResult = await authorizeMutation({});

                    if (authorizeResult.data.authorize.result) {

                        authStore({
                            login: {
                                isLoggedIn: true,
                                name: authorizeResult.data.authorize.email.split('@')[0],
                                email: authorizeResult.data.authorize.email,
                                id: authorizeResult.data.authorize.id
                            }
                        });

                    } else {
                        await client.clearStore();
                        localStorage.removeItem(config.localStorageTokenName);
                        authStore({login: {isLoggedIn: false, name: null, email: null, id: null}});
                        navigate('/login');
                    }

                } catch (e) {
                    console.log('error', e);
                    await client.clearStore();
                    localStorage.removeItem(config.localStorageTokenName);
                    authStore({login: {isLoggedIn: false, name: null, email: null, id: null}});
                    navigate('/login');
                }


            })();

        } else {

            client.clearStore().then(()=>{
                authStore({login: {isLoggedIn: false, name: null, email: null, id: null}});
                navigate('/login');
            })

        }

    }, []);


    if (!store.login.isLoggedIn) {
        return <PageSpinner/>;
    } else {
        return <Panel/>;
    }


}

export default PanelRoute;