import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useMutation, useReactiveVar} from '@apollo/client';
import {TextField, Typography, Divider} from "@mui/material";
import {Alert} from '@mui/material';
import {Link} from "react-router-dom";

import GENERIC_LOGIN from "../../gql/mutations/generic-login";

import config from "../../config";
import utils from "../../utils/utils";
import GoogleButton from "../google-button/google-button";
import SubmitButton from "../submit-button/submit-button";

import formsMessagesStore from '../../stores/forms-messages-store';

function Login() {

    const [formData, setFormData] = useState({
        email: {
            value: '',
            isInvalid: false,
            errorMessage: ''

        },
        password: {
            value: '',
            isInvalid: false,
            errorMessage: ''
        },
        isSubmitted: false
    });

    const store = useReactiveVar(formsMessagesStore);

    const [loginMutation, {data: loginData, loading: loginLoading, error: loginError}] = useMutation(GENERIC_LOGIN);

    const navigate = useNavigate();

    const handleFormChange = (e) => {
        setFormData({...formData, [e.target.name]: {...formData[e.target.name], value: e.target.value}});
    }

    const handleFormSubmit = (e) => {

        e.preventDefault();

        let isFormValid = true;

        formsMessagesStore({...store, login: {isEnabled: false, type: null, message: null}});

        if (formData.email.value === '') {
            setFormData(
                (formData) => {
                    return {...formData, email: {...formData.email, isInvalid: true, errorMessage: utils.capitalizeFirstLetter(config.formsConfig.email.messages.empty)}};
                }
            );
            isFormValid = false;
        } else if (!config.formsConfig.email.pattern.test(formData.email.value)) {
            setFormData(
                (formData) => {
                    return {...formData, email: {...formData.email, isInvalid: true, errorMessage: utils.capitalizeFirstLetter(config.formsConfig.email.messages.pattern)}};
                }
            );
            isFormValid = false;
        } else {
            setFormData(
                (formData) => {
                    return {...formData, email: {...formData.email, isInvalid: false, errorMessage: ''}};
                }
            );
        }

        if (formData.password.value === '') {
            setFormData(
                (formData) => {
                    return {
                        ...formData,
                        password: {...formData.password, isInvalid: true, errorMessage: utils.capitalizeFirstLetter(config.formsConfig.password.messages.empty)}
                    };
                }
            );
            isFormValid = false;
        } else if (formData.password.value.length > config.formsConfig.password.maxLength || formData.password.value.length < config.formsConfig.password.minLength) {
            setFormData(
                (formData) => {
                    return {
                        ...formData,
                        password: {...formData.password, isInvalid: true, errorMessage: utils.capitalizeFirstLetter(config.formsConfig.password.messages.length)}
                    };
                }
            );
            isFormValid = false;
        } else {
            setFormData(
                (formData) => {
                    return {
                        ...formData,
                        password: {...formData.password, isInvalid: false, errorMessage: ''}
                    };
                }
            );
        }

        if (isFormValid) {

            setFormData(formData => ({...formData, isSubmitted: true}));

            (async () => {

                try {
                    const loginResult = await loginMutation({
                        variables: {input: {email: formData.email.value, password: formData.password.value}}
                    });

                    if (loginResult.data.genericLogin.result) {
                        navigate('/panel');
                    } else {

                        let errorReason = config.serverMessages[loginResult.data.genericLogin.errorReason] || 'Error';
                        formsMessagesStore({...store, login: {isEnabled: true, type: 'error', message: errorReason}});

                        setFormData(formData => ({...formData, isSubmitted: false}));

                    }

                } catch (e) {

                    console.log('error', e);
                    formsMessagesStore({...store, login: {isEnabled: true, type: 'error', message: config.serverMessages['mutation_error']}});

                    setFormData(formData => ({...formData, isSubmitted: false}));

                }


            })();

        }

    }

    return (

        <div className="form_container">
            <div className="form_wrap">

                <Typography className="form_heading" variant="h5" gutterBottom component="div">StockWatch
                    Login</Typography>

                <GoogleButton/>

                <div className="separator_wrap"><Divider>OR</Divider></div>

                {store.login.isEnabled && <div className="alert_container"><Alert severity={store.login.type}>{store.login.message}</Alert></div>}

                <form onSubmit={handleFormSubmit}>
                    <div className="form_element_wrap"><TextField name="email" onChange={handleFormChange} value={formData.email.value} error={formData.email.isInvalid}
                                                                  helperText={formData.email.errorMessage}
                                                                  className="form_element" label="E-mail" variant="outlined"/></div>
                    <div className="form_element_wrap"><TextField name="password" onChange={handleFormChange} value={formData.password.value} error={formData.password.isInvalid}
                                                                  helperText={formData.password.errorMessage}
                                                                  inputProps={{maxLength: config.formsConfig.password.maxLength}}
                                                                  className="form_element" label="Password" type="password"
                                                                  variant="outlined"/></div>
                    <div className="form_button_element_wrap">
                        <SubmitButton loading={loginLoading} disabled={formData.isSubmitted} buttonText={'LOGIN'} size={'medium'} variant={'contained'} class={'form_element form_button'}/>
                    </div>
                </form>

                <div className="form_button_text_wrap"><span>No account? </span><span className="small_link"><Link to="/signup" underline="always">Create one</Link></span></div>

            </div>
        </div>

    );


}

export default Login;