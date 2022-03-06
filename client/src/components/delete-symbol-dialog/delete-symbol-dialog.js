import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import {useMutation} from "@apollo/client";

import DELETE_SYMBOL_FROM_LIST from "../../gql/mutations/delete-symbol-from-list";

function DeleteSymbolDialog(props) {


    const [deleteSymbolFromListMutation, {data: deleteSymbolFromListData, loading: deleteSymbolFromListLoading, error: deleteSymbolFromListError}] = useMutation(DELETE_SYMBOL_FROM_LIST);

    const handleDialogConfirm = () => {

        (async () => {

            try {

                const mutationResult = await deleteSymbolFromListMutation({
                    variables: {input: {listId: props.listId, symbolId: props.symbolId}}
                });

                if (mutationResult.data.deleteSymbolFromList.result) {

                    //await props.refetch();
                    props.deleteSymbol(props.symbolId);
                    props.onDialogClose();

                }

            } catch (e) {
                console.log(e)
            }

        })();
    }

    return (
        <div>
            <Dialog
                open={props.isOpen}
                onClose={props.onDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {`DELETE SYMBOL "${props.symbolName}"?`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button disabled={deleteSymbolFromListLoading} onClick={props.onDialogClose}>{props.cancelText}</Button>
                    <Button disabled={deleteSymbolFromListLoading} onClick={handleDialogConfirm}>{props.confirmText}</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DeleteSymbolDialog;