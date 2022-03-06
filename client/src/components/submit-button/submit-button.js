import LoadingButton from "@mui/lab/LoadingButton";
import {Button} from "@mui/material";
import * as React from "react";

function SubmitButton(props) {

    return (
        <>
            {
                props.loading ?
                    <LoadingButton loading={true} variant="outlined" className={props.class} size={props.size}>{props.buttonText}</LoadingButton>
                    :
                    <Button disabled={props.disabled} type="submit" className={props.class} variant={props.variant} size={props.size}>{props.buttonText}</Button>
            }
        </>
    );


}

export default SubmitButton;