import * as React from 'react';
import CloseIcon from '@mui/icons-material/Close';


import Modal from '@mui/material/Modal';

import styles from './modal.module.css';


function ModalWindow({isOpen, Comp, onModalClose, compProps}) {


    return (

        <Modal
            open={isOpen}
            onClose={onModalClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <div className={styles.modal}>
                <div onClick={onModalClose} className={styles.close_icon}><CloseIcon fontSize="medium"/></div>
                <Comp {...compProps}/>
            </div>
        </Modal>

    );
}

export default ModalWindow;