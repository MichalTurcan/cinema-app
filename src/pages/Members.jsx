import "../style/contact.css";
import { Link } from "react-router-dom";
import ListOfMembers from "../components/ListOfMembers";


function Members() {
    return (
        <>
            <div className="mt-4 p-5 header-AboutUs">
                <div className='header-AboutUs-text'>
                    <h1 className='header-AboutUs-title'>Členovia</h1>
                    <div className='header-AboutUs-path'>
                        <Link className="header-AboutUs-link" to="/">
                            <p>Home</p>
                        </Link>
                        <p> / Členovia</p>
                    </div>

                </div>
            </div>

            <div className="container">
                <div className="title-about">
                    členovia
                </div>
                <ListOfMembers />
                
            </div>
 </>
    );
}

export default Members;