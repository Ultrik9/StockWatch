import Login from "../components/login/login";
import useTitle from "../hooks/use-title";

function LoginRoute(props) {

    useTitle(props.title);

    return <Login/>

}

export default LoginRoute;