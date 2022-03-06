import * as React from 'react';
import LinearProgress from '@mui/material/LinearProgress';

import styles from './list-update-progress.module.css'

function ListUpdateProgress(props) {
    return (
        <div className={styles.progress_container}>
            {props.status && <LinearProgress/>}
        </div>
    );
}

export default ListUpdateProgress;