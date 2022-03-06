import {CircularProgress} from "@mui/material";
import styles from './basic-spinner.module.css'

function BasicSpinner() {


    return (
            <div className={styles.spinner_wrap}>
                <CircularProgress/>
            </div>
    );

}

export default BasicSpinner;