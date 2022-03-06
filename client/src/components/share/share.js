import * as React from 'react';
import {Button, TextField} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


function Share(props) {

    const copyUrlToClipboard = (url) => {

        (async () => {

            try {
                await navigator.clipboard.writeText(url);
            } catch (e) {
                console.log('error', e);
            }

        })();

    }

    return (

        <form className="single_line_form">
            <div className="single_line_form_text">

                <TextField
                    className="form_element"
                    label="Share your list"
                    defaultValue={props.listShareUrl}
                    InputProps={{
                        readOnly: true,
                    }}
                    size="small"
                />
            </div>
            <div className="single_line_form_button">
                <Button className="form_element"
                        variant="outlined"
                        onClick={() => copyUrlToClipboard(props.listShareUrl)}
                        startIcon={<ContentCopyIcon/>}>Copy
                </Button>
            </div>
        </form>

    );
}

export default Share;