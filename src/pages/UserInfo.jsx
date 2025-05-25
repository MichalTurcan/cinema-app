import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";


function UserInfo() {

    const { userId } = useParams();
    const { user } = useAuth();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserInfo = async () => {
        try {
            console.log('Fetching user with ID:', userId);
            setLoading(true);
            const response = await axios.get(`/api/users/${userId}/userInfo`);

            console.log(response.data);

            const userDataArray = response.data.data;

            if (Array.isArray(userDataArray) && userDataArray.length > 0) {
                setUserData(userDataArray[0]);
                console.log('User data extracted:', userDataArray[0]);
            } else {
                console.error('No user data found in the response');
                setError('No user data found');
            }
        } catch (error) {
            console.error('Error loading user:', error);
            setError('Failed to load user information');
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserInfo();
        }
    }, [userId]);

    const calculateAge = (dateOfBirth) => {
        const dob = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
        console.log(dob);
        
        const today = new Date();
        
        let age = today.getFullYear() - dob.getFullYear();
        
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();
        
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }
        
        return age;
      };


    const formDate = (dateString) => {
        const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('sk-SK', dateOptions);
    };

    if (loading) return <div>Loading user information...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!userData) return <div>No user data found</div>;

    return (
        <>
            <div className="mt-4 p-5 header-events">
                <div className='header-events-text'>
                    <h1 className='header-events-title'>{userData.name} {userData.surname}</h1>
                    <div className='header-events-path'>
                        <Link className="header-events-link" to="/">
                            <p>Home</p>
                        </Link>
                        
                        <Link className="header-events-link" to="/users">
                            <p>/ Uživatelia</p>
                        </Link>
                        <p> / {userData.name} {userData.surname}</p>
                    </div>

                </div>

            </div>

            <div className="container">
                {user.userId === userId ?
                    <Link to={`/users/${userId}/editUserInfo`} className="btn btn-nav login my-2">
                        Upraviť profil
                    </Link> :
                    <>
                    </>
                }
                <div className="row">
                    <div className="col-12 col-lg-2 col-md-4 col-sm-12">
                        {userData.imageLocation ?
                            <img src={userData.imageLocation} style={{ width: "20vh", aspectRatio: 1 / 1,  objectFit: "cover"}} />
                        : 
                            <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" style={{ width: "20vh", aspectRatio: 1 / 1,  objectFit: "cover"}} />
                        }
                        
                        <h3>Email</h3>
                        <p>{userData.email}</p>
                        <h3>Telefón</h3>
                        <p>{userData && userData.phone ? userData.phone : '-'}</p>
                        <h3>Adresa</h3>
                        <p>{userData && userData.address ? userData.address : '-'}</p>
                        <h3>Mesto</h3>
                        <p>{userData && userData.city ? userData.city : '-'} {userData.postal_code}</p>
                        <div className="socials-row  aboutUs-socials">

                            {userData.instagram
                                ? <a href={userData.instagram} className="instagram instagram-contact" target="_blank" rel="noopener noreferrer">
                                    <i class="bi bi-instagram"></i>
                                </a>
                                : " "}

                            {userData.facebook
                                ? <a href={userData.facebook} className="facebook facebook-contact" target="_blank" rel="noopener noreferrer">
                                    <i class="bi bi-facebook"></i>
                                </a>
                                : " "}

                        </div>
                    </div>
                    <div className="col-12 col-lg-5 col-md-4 col-sm-12">
                        <h3>Meno</h3>
                        <p>{userData && userData.name ? userData.name : '-'}</p>
                        <h3>Priezvisko</h3>
                        <p>{userData && userData.surname ? userData.surname : '-'}</p>
                        <h3>Vek</h3>
                        <p>{userData && userData.date_of_birth ? calculateAge(userData.date_of_birth) : '-'}</p>
                        <h3>Dátum narodenia</h3>
                        <p>{userData && userData.date_of_birth ? formDate(userData.date_of_birth) : '-'}</p>
                    </div>
                    <div className="col-12 col-lg-5 col-md-4 col-sm-12">
                        <h3>Fakulta</h3>
                        <p>{userData && userData.faculty_name ? userData.faculty_name : '-'}</p>
                        <h3>Stupeň štúdia</h3>
                        <p>{userData && userData.degree_code ? userData.degree_code : '-'}</p>
                        <h3>Ročník</h3>
                        <p>{userData && userData.grade ? userData.grade : '-'}</p>
                        <h3>Študíjny program</h3>
                        <p>{userData && userData.program_name ? userData.program_name : '-'}</p>
                    </div>
                </div>

            </div>
        </>
    )
}

export default UserInfo;