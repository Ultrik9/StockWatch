import {Alert, TextField} from "@mui/material";
import {useMutation, useReactiveVar} from "@apollo/client";
import ADD_NEW_LIST from "../../gql/mutations/add-new-list";
import {useState} from "react";
import config from "../../config";
import formsMessagesStore from "../../stores/forms-messages-store";

import styles from './add-new-list.module.css';
import utils from "../../utils/utils";
import SubmitButton from "../submit-button/submit-button";
import * as React from "react";

function AddNewList(props) {

    const [newListMutation, {data: newListData, loading: newListLoading, error: newListError}] = useMutation(ADD_NEW_LIST);

    const store = useReactiveVar(formsMessagesStore);

    const [formData, setFormData] = useState({
        name: {
            value: '',
            isInvalid: false,
            errorMessage: ''

        },
        isSubmitted: false
    });

    const handleFormChange = (e) => {
        setFormData({...formData, [e.target.name]: {...formData[e.target.name], value: e.target.value}});
    }

    const handleFormSubmit = (e) => {

        e.preventDefault();

        let isFormValid = true;

        formsMessagesStore({...store, addNewList: {isEnabled: false, type: null, message: null}});

        if (formData.name.value === '') {
            setFormData(
                (formData) => {
                    return {...formData, name: {...formData.name, isInvalid: true, errorMessage: utils.capitalizeFirstLetter(config.formsConfig.newListName.messages.empty)}};
                }
            );
            isFormValid = false;
        } else if (formData.name.value.length > config.formsConfig.newListName.maxLength || formData.name.value.length < config.formsConfig.newListName.minLength) {
            setFormData(
                (formData) => {
                    return {
                        ...formData,
                        name: {...formData.name, isInvalid: true, errorMessage: utils.capitalizeFirstLetter(config.formsConfig.newListName.messages.length)}
                    };
                }
            );
            isFormValid = false;
        } else {
            setFormData(
                (formData) => {
                    return {...formData, name: {...formData.name, isInvalid: false, errorMessage: ''}};
                }
            );
        }

        if (isFormValid) {

            setFormData(formData => ({...formData, isSubmitted: true}));

            (async () => {

                try {

                    const newListCreateResult = await newListMutation({
                        variables: {input: {name: formData.name.value}}
                    });

                    if (newListCreateResult.data.addNewList.result) {

                        props.handleCreateNewListDone();

                    } else {

                        let errorReason = config.serverMessages[newListCreateResult.data.addNewList.errorReason] || 'Error';
                        formsMessagesStore({...store, addNewList: {isEnabled: true, type: 'error', message: errorReason}});

                        setFormData(formData => ({...formData, isSubmitted: false}));

                    }

                } catch (e) {

                    formsMessagesStore({...store, addNewList: {isEnabled: true, type: 'error', message: config.serverMessages['mutation_error']}});

                    setFormData(formData => ({...formData, isSubmitted: false}));

                }

            })();

        }

    }


    return (
        <>
            <div className={styles.alert_container}>
                {store.addNewList.isEnabled && <div className="alert_container"><Alert severity={store.addNewList.type}>{store.addNewList.message}</Alert></div>}
            </div>
            <form onSubmit={handleFormSubmit} className="single_line_form">
                <div className="single_line_form_text">
                    <TextField error={formData.name.isInvalid}
                               helperText={formData.name.errorMessage}
                               inputProps={{maxLength: config.formsConfig.newListName.maxLength}}
                               name="name" onChange={handleFormChange}
                               className="form_element" label="List name" variant="outlined" size="small"/>
                </div>
                <div className="single_line_form_button">
                    <SubmitButton loading={newListLoading} disabled={formData.isSubmitted} buttonText={'CREATE LIST'} size={'medium'} variant={'contained'} class={'form_element'}/>
                </div>
            </form>
        </>

    );
}

export default AddNewList;