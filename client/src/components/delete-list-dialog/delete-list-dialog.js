import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import {useMutation} from "@apollo/client";

import DELETE_LIST from "../../gql/mutations/delete-list";

function DeleteListDialog(props) {


    const [deleteListMutation, {data: deleteListData, loading: deleteListLoading, error: deleteListError}] = useMutation(DELETE_LIST);

    const handleDialogConfirm = () => {

        (async () => {

            try {

                const mutationResult = await deleteListMutation({
                    variables: {input: {id: props.listId}}
                });

                if (mutationResult.data.deleteList.result) {

                    await props.refetch();
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
                        {`DELETE LIST "${props.listName}"?`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button disabled={deleteListLoading} onClick={props.onDialogClose}>{props.cancelText}</Button>
                    <Button disabled={deleteListLoading} onClick={handleDialogConfirm}>{props.confirmText}</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DeleteListDialog;