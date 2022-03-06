import { Link } from "react-router-dom";
import styles from './home.module.css';


function Home() {

    return (

        <div className={styles.home_container}>
            <div className={styles.home_wrap}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <div className={styles.logo_text}>SW</div>
                    </div>
                    <div className={styles.name}>StockWatch</div>
                </div>
                <div className={styles.login_text}><Link to="/login">Login to StockWatch</Link></div>
            </div>
        </div>

    );

}

export default Home;