import {ApolloClient, InMemoryCache, ApolloProvider, HttpLink, ApolloLink, from} from "@apollo/client";
import {setContext} from "@apollo/client/link/context";

import {BrowserRouter, Routes, Route} from "react-router-dom";

import {StyledEngineProvider} from '@mui/material/styles';

import LoginRoute from "./routes/login-route";
import SignupRoute from "./routes/signup-route";
import PanelRoute from "./routes/panel-route";
import HomeRoute from "./routes/home-route";
import ErrorRoute from "./routes/error-route";

import config from "./config";


const httpLink = new HttpLink({uri: config.serverGqlUrl});

const getHeaderLink = new ApolloLink((operation, forward) => {
    return forward(operation).map(response => {
        const context = operation.getContext();
        const authHeader = context.response.headers.get(config.accessTokenName);
        if (authHeader) {
            localStorage.setItem(config.localStorageTokenName, authHeader)
        }
        return response;
    });
});

const authLink = setContext((_, {headers}) => {
    return {
        headers: {
            ...headers,
            [config.accessTokenName]: localStorage.getItem(config.localStorageTokenName)
        }
    }
});

const client = new ApolloClient({
    uri: config.serverGqlUrl,
    cache: new InMemoryCache(),
    credentials: 'include',
    link: from([getHeaderLink, authLink, httpLink]),
});

function App() {

    return (

        <ApolloProvider client={client}>
            <StyledEngineProvider injectFirst>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<HomeRoute title="StockWatch | Home"/>}/>
                        <Route path="login" element={<LoginRoute title="StockWatch | Login"/>}/>
                        <Route path="signup" element={<SignupRoute title="StockWatch | Signup"/>}/>
                        <Route path="panel" element={<PanelRoute title="StockWatch | Panel"/>}/>
                        <Route path="*" element={<ErrorRoute title="StockWatch | 404"/>}/>
                    </Routes>
                </BrowserRouter>
            </StyledEngineProvider>
        </ApolloProvider>

    );

}

export default App;
