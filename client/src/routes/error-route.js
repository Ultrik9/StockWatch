import Error from "../components/error/error";
import config from "../config";
import useTitle from "../hooks/use-title";

function ErrorRoute(props) {

    useTitle(props.title);

    return <Error title={config.errorMessage404.title} errorType={config.errorMessage404.errorType} errorHeader={config.errorMessage404.errorHeader}
                  errorMessage={config.errorMessage404.errorMessage} >Error</Error>
}

export default ErrorRoute;