import ListOfMovies from "../components/ListOfMovies";
import { Link } from "react-router-dom";

function Movies() {

    return(

        <>
        <div className="mt-4 p-5 header-AboutUs">
                <div className='header-AboutUs-text'>
                    <h1 className='header-AboutUs-title'>Filmy</h1>
                    <div className='header-AboutUs-path'>
                        <Link className="header-AboutUs-link" to="/">
                            <p>Home</p>
                        </Link>
                        <p> / Filmy</p>
                    </div>

                </div>

            </div>
        
        <ListOfMovies />
        </>

        
    );
}

export default Movies;