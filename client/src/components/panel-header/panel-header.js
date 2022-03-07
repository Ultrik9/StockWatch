import styles from "./panel-header.module.css";
import config from "../../config";
import UserMenu from "../user-menu/user-menu";
import React from "react";
import {useApolloClient, useMutation, useReactiveVar} from "@apollo/client";
import LOGOUT from "../../gql/mutations/logout";

import authStore from "../../stores/auth-store";
import formsMessagesStore from "../../stores/forms-messages-store";

import {useNavigate} from "react-router-dom";

function PanelHeader() {

    const client = useApolloClient();

    const storeAuth = useReactiveVar(authStore);
    const storeForms = useReactiveVar(formsMessagesStore);

    const navigate = useNavigate();

    const [logoutMutation, {data: logoutData, loading: logoutLoading, error: logoutError}] = useMutation(LOGOUT);


    const handleLogouts = (isAll = false) => {

        (async () => {

            try {

                const logoutResult = await logoutMutation({
                    variables: {input: {all: isAll}}
                });

                if (!logoutResult.data.logout.result) {
                    formsMessagesStore({...storeForms, login: {isEnabled: true, type: 'error', message: config.clientMessages.logoutError}});
                } else {
                    if (isAll) {
                        formsMessagesStore({...storeForms, login: {isEnabled: true, type: 'info', message: config.clientMessages.logOutAllMessage}});
                    }
                }

            } catch (e) {
                console.log('error', e);
            } finally {
                authStore({login: {isLoggedIn: false, name: null, email: null, id: null}});
                await client.clearStore();
                localStorage.removeItem(config.localStorageTokenName);
                navigate('/login');
            }

        })();

    }

    return (
        <div className={styles.header_container}>
            <div className={styles.header}>
                <div className={styles.logo_container}><span className={styles.logo}><a href="/panel">StockWatch</a></span></div>
                <div className={styles.menu_container}>
                    <div className={styles.user_menu}>
                        <UserMenu userName={storeAuth.login.email} handleLogout={() => handleLogouts(false)} handleLogoutAll={() => handleLogouts(true)}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PanelHeader;