import styles from './page-spinner.module.css';
import BasicSpinner from "../basic-spinner/basic-spinner";

function PageSpinner() {


    return (
        <div className={styles.spinner_container}>
            <BasicSpinner/>
        </div>
    );

}

export default PageSpinner;