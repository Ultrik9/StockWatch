import Signup from "../components/signup/signup";
import useTitle from "../hooks/use-title";

function SignupRoute(props) {

    useTitle(props.title);

    return <Signup/>

}

export default SignupRoute;