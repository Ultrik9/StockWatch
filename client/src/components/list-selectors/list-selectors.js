import {useEffect, useState} from "react";
import styles from "./list-selectors.module.css";
import {Chip} from "@mui/material";
import Face from "@mui/icons-material/Face";
import Add from "@mui/icons-material/Add";

import config from "../../config";
import Modal from "../modal/modal";
import formsMessagesStore from "../../stores/forms-messages-store";
import AddNewList from "../add-new-list/add-new-list";
import DeleteListDialog from "../delete-list-dialog/delete-list-dialog";

import {useQuery, useReactiveVar} from "@apollo/client";
import GET_USER_LISTS from "../../gql/queries/get-user-lists";

function ListSelectors(props) {

    const [isListModalOpen, setListModalOpen] = useState(false);
    const [isListDialogOpen, setListDialogOpen] = useState(false);
    const [listToDelete, setListToDelete] = useState({id: null, name: null});

    const formsMessagesStoreObject = useReactiveVar(formsMessagesStore);

    const [lists, setLists] = useState([]);


    const handleCreateNewListDone = () => {

        setListModalOpen(false);

        (async () => {
            await getUserListsRefetch();
        })();

    }

    const {loading: getUserListsLoading, error: getUserListsError, data: getUserListsData, refetch: getUserListsRefetch} = useQuery(GET_USER_LISTS, {});

    useEffect(() => {

        if (getUserListsData && getUserListsData.getUserLists.result) {

            setLists(getUserListsData.getUserLists.lists);

            if (getUserListsData.getUserLists.lists.length !== 0) {

                const listId = localStorage.getItem(config.selectedListIdName);

                if (listId) {

                    const listIdx = getUserListsData.getUserLists.lists.findIndex(list => list.id === listId);

                    if (listIdx !== -1) {
                        props.handleListSelect(getUserListsData.getUserLists.lists[listIdx].id);
                    } else {
                        props.handleListSelect(getUserListsData.getUserLists.lists[getUserListsData.getUserLists.lists.length - 1].id);
                    }

                } else {

                    props.handleListSelect(getUserListsData.getUserLists.lists[getUserListsData.getUserLists.lists.length - 1].id);

                }

            } else {

                props.handleListSelect(null);

            }

        }

    }, [getUserListsData, props])

    return (
        <>
            <div className={styles.watch_groups}>

                {
                    lists.map(list => {

                        const label = list.name;
                        const variant = props.selectedListId === list.id ? null : 'outlined';
                        const onClick = () => {
                            localStorage.setItem(config.selectedListIdName, list.id);
                            props.handleListSelect(list.id);
                        }

                        const onDelete = () => {
                            setListDialogOpen(true);
                            setListToDelete({id: list.id, name: list.name});
                        }

                        return <div key={list.id} className={styles.chip}>

                            {
                                list.isSocial ?
                                    <Chip
                                        label={label}
                                        variant={variant}
                                        color='secondary'
                                        onClick={onClick}
                                        onDelete={onDelete}
                                        icon={<Face/>}
                                    />
                                    :
                                    <Chip
                                        label={label}
                                        variant={variant}
                                        onClick={onClick}
                                        onDelete={onDelete}
                                    />
                            }

                        </div>

                    })

                }

                {

                    lists.length < config.maxLists &&

                    <div className={styles.chip}>
                        <Chip onClick={() => setListModalOpen(true)} label="Create new list" variant="outlined"
                              icon={<Add/>} clickable/>
                    </div>

                }


            </div>

            <Modal isOpen={isListModalOpen} onModalClose={() => {
                formsMessagesStore({...formsMessagesStoreObject, addNewList: {isEnabled: false, type: null, message: null}});
                setListModalOpen(false)
            }} Comp={AddNewList} compProps={{'handleCreateNewListDone': handleCreateNewListDone}}/>


            <DeleteListDialog isOpen={isListDialogOpen}
                              listId={listToDelete.id}
                              listName={listToDelete.name}
                              onDialogClose={() => {
                                  setListDialogOpen(false);
                              }}
                              confirmText="DELETE"
                              cancelText="CANCEL"
                              refetch={getUserListsRefetch}
            />


        </>
    );

}

export default ListSelectors;