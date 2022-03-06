import Home from '../components/home/home';
import useTitle from "../hooks/use-title";

function HomeRoute(props) {

    useTitle(props.title);

    return <Home/>

}

export default HomeRoute;