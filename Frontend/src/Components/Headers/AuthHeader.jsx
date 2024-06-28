import { Link } from 'react-router-dom';
import "./AuthHeader.css"

const AuthHeader = () => {
    return(
    <header className="authHeader">
        <h3 className="appName">WorldCollection</h3>
        <div className="authLinks">
            <Link to={"/login"} className="authLink" >Log in</Link>
            <Link to={"/register"} className="authLink" >Sign up</Link>
        </div>
    </header>
    )
}

export default AuthHeader;
