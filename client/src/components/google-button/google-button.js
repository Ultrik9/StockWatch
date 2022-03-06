import {Button} from "@mui/material";
import config from "../../config";
import GoogleIcon from "@mui/icons-material/Google";
import {useApolloClient, useMutation} from "@apollo/client";
import authStore from "../../stores/auth-store";
import AUTHORIZE from "../../gql/mutations/authorize";
import {useNavigate} from "react-router-dom";

function GoogleButton() {

    const [authorizeMutation, {data, loading, error}] = useMutation(AUTHORIZE);

    const client = useApolloClient();
    const navigate = useNavigate();

    const checkAuth = () => {

        if (localStorage.getItem(config.localStorageTokenName)) {

            (async () => {

                try {

                    const authorizeResult = await authorizeMutation({});

                    if (authorizeResult.data.authorize.result) {

                        navigate('/panel');

                    } else {

                        await client.clearStore();
                        localStorage.removeItem(config.localStorageTokenName);
                        authStore({login: {isLoggedIn: false, name: null, email: null, id: null}});

                        window.location.replace(config.googleOauthRequestUrl);

                    }

                } catch (e) {

                    console.log('error', e);
                    window.location.replace(config.googleOauthRequestUrl);

                }


            })();

        } else {
            window.location.replace(config.googleOauthRequestUrl);
        }

    }

    return (
        <div className="form_element_wrap">
            <Button onClick={checkAuth} variant="outlined" className="form_element" startIcon={<GoogleIcon/>} size="medium">
                CONTINUE WITH GOOGLE
            </Button>
        </div>
    );

}

export default GoogleButton;