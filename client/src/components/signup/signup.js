import {TextField, Typography, Divider, Alert} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import config from "../../config";

import GENERIC_SIGNUP from "../../gql/mutations/generic-signup";
import {useState} from "react";
import {useMutation, useReactiveVar} from "@apollo/client";

import utils from "../../utils/utils";
import GoogleButton from "../google-button/google-button";
import SubmitButton from "../submit-button/submit-button";

import formsMessagesStore from "../../stores/forms-messages-store";

function Signup() {

    const [formData, setFormData] = useState({
        email: {
            value: '',
            isInvalid: false,
            errorMessage: ''

        },
        password1: {
            value: '',
            isInvalid: false,
            errorMessage: ''
        },
        password2: {
            value: '',
            isInvalid: false,
            errorMessage: ''
        },
        isSubmitted: false
    });

    const store = useReactiveVar(formsMessagesStore);

    const [signupMutation, {data: signupData, loading: signupLoading, error: signupError}] = useMutation(GENERIC_SIGNUP);

    const navigate = useNavigate();

    const handleFormChange = (e) => {
        setFormData({...formData, [e.target.name]: {...formData[e.target.name], value: e.target.value}});
    }

    const handleFormSubmit = (e) => {

        e.preventDefault();

        let isFormValid = true;

        formsMessagesStore({...store, signup: {isEnabled: false, type: null, message: null}});

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

        if (formData.password1.value === '') {
            setFormData(
                (formData) => {
                    return {
                        ...formData,
                        password1: {...formData.password1, isInvalid: true, errorMessage: utils.capitalizeFirstLetter(config.formsConfig.password.messages.empty)}
                    };
                }
            );
            isFormValid = false;
        } else if (formData.password1.value.length > config.formsConfig.password.maxLength || formData.password1.value.length < config.formsConfig.password.minLength) {
            setFormData(
                (formData) => {
                    return {
                        ...formData,
                        password1: {...formData.password1, isInvalid: true, errorMessage: utils.capitalizeFirstLetter(config.formsConfig.password.messages.length)}
                    };
                }
            );
            isFormValid = false;
        } else {
            setFormData(
                (formData) => {
                    return {
                        ...formData,
                        password1: {...formData.password1, isInvalid: false, errorMessage: ''}
                    };
                }
            );
        }

        if (formData.password2.value === '') {
            setFormData(
                (formData) => {
                    return {
                        ...formData,
                        password2: {...formData.password2, isInvalid: true, errorMessage: utils.capitalizeFirstLetter(config.formsConfig.password.messages.empty)}
                    };
                }
            );
            isFormValid = false;
        } else if (formData.password2.value.length > config.formsConfig.password.maxLength || formData.password2.value.length < config.formsConfig.password.minLength) {
            setFormData(
                (formData) => {
                    return {
                        ...formData,
                        password2: {...formData.password2, isInvalid: true, errorMessage: utils.capitalizeFirstLetter(config.formsConfig.password.messages.length)}
                    };
                }
            );
            isFormValid = false;
        } else {
            setFormData(
                (formData) => {
                    return {
                        ...formData,
                        password2: {...formData.password2, isInvalid: false, errorMessage: ''}
                    };
                }
            );
        }


        if (formData.password2.value !== formData.password1.value) {

            setFormData(
                (formData) => {

                    let password1ErrorMessage = formData.password1.isInvalid
                        ? utils.capitalizeFirstLetter(config.formsConfig.password.messages.mismatch) + '. ' + formData.password1.errorMessage
                        : utils.capitalizeFirstLetter(config.formsConfig.password.messages.mismatch);

                    let password2ErrorMessage = formData.password2.isInvalid
                        ? utils.capitalizeFirstLetter(config.formsConfig.password.messages.mismatch) + '. ' + formData.password2.errorMessage
                        : utils.capitalizeFirstLetter(config.formsConfig.password.messages.mismatch);

                    return {
                        ...formData,
                        password1: {...formData.password1, isInvalid: true, errorMessage: password1ErrorMessage},
                        password2: {...formData.password2, isInvalid: true, errorMessage: password2ErrorMessage}
                    };
                }
            );

            isFormValid = false;
        }


        if (isFormValid) {

            setFormData(formData => ({...formData, isSubmitted: true}));

            (async () => {

                try {
                    const signupResult = await signupMutation({
                        variables: {input: {email: formData.email.value, password: formData.password1.value}}
                    });

                    if (signupResult.data.genericSignup.result) {
                        navigate('/panel');
                    } else {

                        let errorReason = config.serverMessages[signupResult.data.genericSignup.errorReason] || 'Error';
                        formsMessagesStore({...store, signup: {isEnabled: true, type: 'error', message: errorReason}});

                        setFormData(formData => ({...formData, isSubmitted: false}));

                    }

                } catch (e) {

                    console.log('error', e);
                    formsMessagesStore({...store, signup: {isEnabled: true, type: 'error', message: config.serverMessages['mutation_error']}});

                    setFormData(formData => ({...formData, isSubmitted: false}));

                }


            })();

        }


    }

    return (

        <div className="form_container">
            <div className="form_wrap">
                <Typography className="form_heading" variant="h5" gutterBottom component="div">StockWatch
                    Sign Up</Typography>

                <GoogleButton/>

                <div className="separator_wrap"><Divider>OR</Divider></div>

                {store.signup.isEnabled && <div className="alert_container"><Alert severity={store.signup.type}>{store.signup.message}</Alert></div>}

                <form onSubmit={handleFormSubmit}>
                    <div className="form_element_wrap">
                        <TextField name="email"
                                   onChange={handleFormChange}
                                   value={formData.email.value}
                                   error={formData.email.isInvalid}
                                   helperText={formData.email.errorMessage}
                                   className="form_element" label="E-mail" variant="outlined"
                        />
                    </div>
                    <div className="form_element_wrap">
                        <TextField name="password1"
                                   onChange={handleFormChange}
                                   value={formData.password1.value}
                                   error={formData.password1.isInvalid}
                                   helperText={formData.password1.errorMessage}
                                   inputProps={{maxLength: config.formsConfig.password.maxLength}}
                                   className="form_element" label="Password" type="password" variant="outlined"
                        />
                    </div>
                    <div className="form_element_wrap">
                        <TextField name="password2"
                                   onChange={handleFormChange}
                                   value={formData.password2.value}
                                   error={formData.password2.isInvalid}
                                   helperText={formData.password2.errorMessage}
                                   inputProps={{maxLength: config.formsConfig.password.maxLength}}
                                   className="form_element" label="Confirm password" type="password" variant="outlined"
                        />
                    </div>

                    <div className="form_button_element_wrap">
                        <SubmitButton loading={signupLoading} disabled={formData.isSubmitted} buttonText={'SIGN UP'} size={'medium'} variant={'contained'}
                                      class={'form_element form_button'}/>
                    </div>

                </form>

                <div className="form_button_text_wrap"><span>Have account? </span><span className="small_link"><Link to="/login" underline="always">Log in</Link></span></div>

            </div>
        </div>

    );


}

export default Signup;