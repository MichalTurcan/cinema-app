import "../style/contact.css";
import { Link } from "react-router-dom";
import ListOfUsers from "../components/ListOfUsers";


function Users() {
    return (
        <>
            <div className="mt-4 p-5 header-AboutUs">
                <div className='header-AboutUs-text'>
                    <h1 className='header-AboutUs-title'>Uživatelia</h1>
                    <div className='header-AboutUs-path'>
                        <Link className="header-AboutUs-link" to="/">
                            <p>Home</p>
                        </Link>
                        <p> / Uživatelia</p>
                    </div>

                </div>
            </div>

            <div className="container">
                <div className="title-about">
                    uživatelia
                </div>
                <ListOfUsers />
                
            </div>
 </>
    );
}

export default Users;