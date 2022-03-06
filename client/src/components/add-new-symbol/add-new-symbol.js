import * as React from 'react';
import {Alert, Autocomplete, FormControl, FormHelperText, InputAdornment, InputLabel, OutlinedInput, TextField} from "@mui/material";

import GET_ALL_SYMBOLS from "../../gql/queries/get-all-symbols";
import ADD_SYMBOL_TO_LIST from '../../gql/mutations/add-symbol-to-list';

import {useMutation, useQuery, useReactiveVar} from "@apollo/client";
import {useEffect, useState} from "react";

import config from "../../config";
import formsMessagesStore from "../../stores/forms-messages-store";
import utils from "../../utils/utils";
import SubmitButton from "../submit-button/submit-button";


function AddNewSymbol(props) {

    const {loading: getAllSymbolsLoading, error: getAllSymbolsError, data: getAllSymbolsData} = useQuery(GET_ALL_SYMBOLS, {});

    const [addSymbolToListMutation, {data: addSymbolToListData, loading: addSymbolToListLoading, error: addSymbolToListError}] = useMutation(ADD_SYMBOL_TO_LIST);

    const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);

    const store = useReactiveVar(formsMessagesStore);

    const [formData, setFormData] = useState({
        symbol: {
            value: {symbolId: null, symbol: null, name: null},
            isInvalid: false,
            errorMessage: ''

        },
        price: {
            value: '0.00',
            isInvalid: false,
            errorMessage: ''
        },
        amount: {
            value: 0,
            isInvalid: false,
            errorMessage: ''
        },
        isSubmitted: false
    });

    useEffect(() => {

        if (getAllSymbolsData && getAllSymbolsData.getAllSymbols.result) {
            const data = getAllSymbolsData.getAllSymbols;
            setAutoCompleteOptions(data.symbols);
            setFormData({...formData, symbol: {...formData.symbol, value: {symbolId: data.symbols[0].symbolId, symbol: data.symbols[0].symbol, name: data.symbols[0].name}}});
        }

    }, [getAllSymbolsData]);

    useEffect(() => {
    }, [formData])

    const handleFormChangeSymbol = (e, newValue) => {
        setFormData({...formData, symbol: {...formData.symbol, value: {symbolId: newValue.symbolId, symbol: newValue.symbol, name: newValue.name}}});
    }

    const handleFormChangePrice = (e) => {

        let value = e.target.value;

        if (value === '') {
            setFormData({...formData, price: {...formData.price, value: value}});
            return;
        }

        if (config.formsConfig.newSymbolPrice.pattern.test(value)) {

            if (parseFloat(value) > config.maxStocksPrice) {
                value = config.maxStocksPrice.toString() + '.00';
            }

            setFormData({...formData, price: {...formData.price, value: value}});
        }

    }

    const handleFormChangeAmount = (e) => {

        let value = parseInt(e.target.value);

        if (value < 0) {
            value = 0;
        }

        if (value > config.maxStocksAmount) {
            value = config.maxStocksAmount;
        }

        setFormData({...formData, amount: {...formData.amount, value: value}});
    }

    const handleFormSubmit = (e) => {

        e.preventDefault();

        let isFormValid = true;

        if (!formData.symbol.value.symbol || !autoCompleteOptions.find(option => option.symbol === formData.symbol.value.symbol)) {
            setFormData(
                (formData) => {
                    return {...formData, symbol: {...formData.symbol, isInvalid: true, errorMessage: utils.capitalizeFirstLetter(config.formsConfig.newSymbol.messages.incorrect)}};
                }
            );
            isFormValid = false;
        } else {
            setFormData(
                (formData) => {
                    return {...formData, symbol: {...formData.symbol, isInvalid: false, errorMessage: ''}};
                }
            );
        }


        if (formData.price.value !== '' && formData.price.value !== '0.00') {

            if (config.formsConfig.newSymbolPrice.pattern.test(formData.price.value)
                && parseFloat(formData.price.value) <= config.maxStocksPrice
                && parseFloat(formData.price.value) >= config.minStocksPrice) {

                setFormData(
                    (formData) => {
                        return {...formData, price: {...formData.price, isInvalid: false, errorMessage: ''}};
                    }
                );

                if (formData.amount.value <= config.maxStocksAmount && formData.amount.value >= 1) {

                    setFormData(
                        (formData) => {
                            return {...formData, amount: {...formData.amount, isInvalid: false, errorMessage: ''}};
                        }
                    );

                } else {

                    setFormData(
                        (formData) => {
                            return {
                                ...formData,
                                amount: {...formData.amount, isInvalid: true, errorMessage: utils.capitalizeFirstLetter(config.formsConfig.newSymbolAmount.messages.incorrect)}
                            };
                        }
                    );
                    isFormValid = false;

                }

            } else {

                setFormData(
                    (formData) => {
                        return {
                            ...formData,
                            price: {...formData.price, isInvalid: true, errorMessage: utils.capitalizeFirstLetter(config.formsConfig.newSymbolPrice.messages.incorrect)}
                        };
                    }
                );
                isFormValid = false;

            }

        } else {
            setFormData(
                (formData) => {
                    return {...formData, price: {...formData.price, isInvalid: false, errorMessage: ''}};
                }
            );
        }


        formsMessagesStore({...store, addSymbolToList: {isEnabled: false, type: null, message: null}});

        if (isFormValid) {

            setFormData(formData => ({...formData, isSubmitted: true}));

            (async () => {

                try {

                    const sharesAmount = parseInt(formData.amount.value);
                    const buyPrice = parseFloat(formData.price.value);

                    const addSymbolToListResult = await addSymbolToListMutation({
                        variables: {
                            input: {
                                listId: props.selectedListId,
                                symbol: formData.symbol.value.symbol,
                                sharesAmount: isNaN(sharesAmount) ? 0 : sharesAmount,
                                buyPrice: isNaN(buyPrice) ? 0 : buyPrice
                            }
                        }
                    });

                    if (addSymbolToListResult.data.addSymbolToList.result) {

                        props.handleAddNewSymbolDone();

                    } else {

                        let errorReason = config.serverMessages[addSymbolToListResult.data.addSymbolToList.errorReason] || 'Error';
                        formsMessagesStore({...store, addSymbolToList: {isEnabled: true, type: 'error', message: errorReason}});

                        setFormData(formData => ({...formData, isSubmitted: false}));

                    }

                } catch (e) {

                    formsMessagesStore({...store, addSymbolToList: {isEnabled: true, type: 'error', message: config.serverMessages['mutation_error']}});

                    setFormData(formData => ({...formData, isSubmitted: false}));

                }

            })();

        }

    }

    return (

        <form onSubmit={handleFormSubmit}>

            <div className="form_info_wrap"><Alert severity="info">We only limited to top 30 Dow Jones symbols</Alert></div>

            {store.addSymbolToList.isEnabled && <div className="alert_container"><Alert severity={store.addSymbolToList.type}>{store.addSymbolToList.message}</Alert></div>}

            <div className="form_element_wrap">

                <Autocomplete
                    name="symbol"
                    disabled={autoCompleteOptions.length === 0}
                    getOptionLabel={(symbol) => `${symbol.symbol} ${symbol.name}`}
                    value={formData.symbol.value}
                    options={autoCompleteOptions}
                    onChange={handleFormChangeSymbol}
                    disablePortal
                    renderInput={(params) => <TextField {...params} error={formData.symbol.isInvalid} helperText={formData.symbol.errorMessage} label="Symbol" required/>}
                />

            </div>
            <div className="form_element_wrap">
                <FormControl className="form_element">
                    <InputLabel error={formData.price.isInvalid} htmlFor="outlined-adornment-amount1">Price per share</InputLabel>
                    <OutlinedInput id="outlined-adornment-amount1"
                                   error={formData.price.isInvalid}
                                   name="price"
                                   className="form_element"
                                   value={formData.price.value}
                                   onChange={handleFormChangePrice}
                                   label="Price per share"
                                   startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                   aria-describedby="component-error-text1"
                    />
                    {formData.price.isInvalid && <FormHelperText error={formData.price.isInvalid} id="component-error-text1">{formData.price.errorMessage}</FormHelperText>}
                </FormControl>
            </div>
            <div className="form_element_wrap">
                <TextField className="form_element"
                           name="amount"
                           value={formData.amount.value}
                           onChange={handleFormChangeAmount}
                           error={formData.amount.isInvalid}
                           helperText={formData.amount.errorMessage}
                           label="Shares amount"
                           variant="outlined"
                           type="number"
                />
            </div>
            <div className="form_button_element_wrap">
                <SubmitButton loading={addSymbolToListLoading} disabled={formData.isSubmitted} buttonText={'ADD SYMBOL'} size={'medium'} variant={'contained'} class={'form_element form_button'}/>
            </div>
        </form>


    );
}

export default AddNewSymbol;

