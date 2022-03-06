import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {Button} from "@mui/material";

function UserMenu(props) {

    const [anchorEl, setAnchorEl] = React.useState(null);

    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogoutAll = () => {
        handleClose();
        props.handleLogoutAll();
    }

    const handleLogout = () => {
        handleClose();
        props.handleLogout();
    }

    return (
        <div>
            <Button
                id="customized-button"
                aria-controls={open ? 'customized-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                variant="contained"
                disableElevation
                onClick={handleClick}
                endIcon={<KeyboardArrowDownIcon/>}
            >
                {props.userName}
            </Button>
            <Menu
                id="customized-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}


                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}

                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}

            >
                <MenuItem onClick={handleLogoutAll}>LOGOUT ALL</MenuItem>
                <MenuItem onClick={handleLogout}>LOGOUT THIS</MenuItem>
            </Menu>
        </div>
    );
}

export default UserMenu;