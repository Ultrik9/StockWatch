function Error(props) {

    const {errorType, errorHeader, errorMessage} = props;

    return (

        <div className="error_container">
            <div className="error_wrap">
                <div className="error_headers">{errorType} - {errorHeader}</div>
                <div className="error_message">{errorMessage}</div>
            </div>
        </div>

    );


}

export default Error;