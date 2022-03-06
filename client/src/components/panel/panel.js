import React, {useState} from 'react';

import {Typography} from "@mui/material";
import styles from './panel.module.css';
import ListTable from "../list-table/list-table";

import PanelHeader from "../panel-header/panel-header";
import ListSelectors from "../list-selectors/list-selectors";


function Panel() {

    const [selectedListId, setSelectedListId] = useState(null);

    const handleListSelect = (id) => {
        setSelectedListId(id);
    }

    return (
        <>

            <PanelHeader/>

            <div className={styles.page_container}>
                <div className={styles.section_wrap}>

                    <Typography variant="h6" gutterBottom component="div">
                        Watch lists
                    </Typography>

                    <ListSelectors selectedListId={selectedListId} handleListSelect={handleListSelect}/>

                    {selectedListId !== null &&
                        <ListTable selectedListId={selectedListId}/>
                    }

                </div>
            </div>

        </>
    );


}

export default Panel;