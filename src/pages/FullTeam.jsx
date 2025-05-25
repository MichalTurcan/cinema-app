import "../style/fullteam.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import FadeAnimation from "../animations/fade";

import { useAuth } from '../context/AuthContext';


function FullTeam() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPositions, setSelectedPositions] = useState([]);
    const [showLeaders, setShowLeaders] = useState(false);

    const [members, setMembers] = useState([]);

    const { user } = useAuth();

    const fetchMembers = async () => {
        try {

            console.log('Fetching members...');

            
            const response = await axios.get('http://localhost:5001/api/members');

            console.log('Response received:', response);
            const membersData = response.data.data || response.data || [];
            console.log('Members data:', membersData);
            setMembers(membersData);


        } catch (error) {
            console.error('Error loading members:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        }
    };

    useEffect(() => {
            fetchMembers();
        }, []);

        const positions = [...new Set(members
            .filter(member => member.role !== "Vedúci") 
            .map(member => member.role) 
          )];

    const handleCheckboxChange = (position) => {
        setSelectedPositions(prev =>
            prev.includes(position) ? prev.filter(p => p !== position) : [...prev, position]
        );
    };

    const filteredPeople = members.filter(member => {
        const matchesName = member.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = selectedPositions.length === 0 || selectedPositions.includes(member.role);
        const matchesLeader = !showLeaders || member.isLeader;
        const matchesStrictFilter = selectedPositions.length > 0 && showLeaders
            ? member.isLeader && selectedPositions.includes(member.role)
            : matchesPosition && matchesLeader;

        return matchesName && matchesStrictFilter;
    });



    return (
        <>
            <div className="mt-4 p-5 header-AboutUs">
                <div className='header-AboutUs-text'>
                    <h1 className='header-AboutUs-title'>Tím</h1>
                    <div className='header-AboutUs-path'>
                        <Link className="header-AboutUs-link" to="/">
                            <p>Home</p>
                        </Link>
                        <p> / Tím</p>
                    </div>

                </div>

            </div>

            <div className="container">
                <div className="filter">
                <input
                    type="text"
                    className="form-control mb-3 search"
                    placeholder="Hľadať podľa mena..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="check-box">
                    <label >
                        <input
                            type="checkbox"
                            className="px-3"
                            checked={showLeaders}
                            onChange={() => setShowLeaders(prev => !prev)}
                        />
                        Vedúci
                    </label>
                    {positions.map(position => (
                        <label key={position} >
                            <input
                                type="checkbox"
                                className="px-3"
                                checked={selectedPositions.includes(position)}
                                onChange={() => handleCheckboxChange(position)}
                            />
                            {position}
                        </label>
                    ))}
                </div>
                </div>
                

                <div className="row">
                    {filteredPeople.length > 0 ? (
                        filteredPeople.map((member, index) => (
                            <FadeAnimation className="col-12 col-lg-3 col-md-6 col-sm-12" key={index}>
                                <div className="card card-leader-team" style={{ marginBottom: "20px" }}>
                                    <img className="card-img-top card-img-aboutUs" src={member.imageLocation} alt={member.name}></img>
                                    <div className="card-body card-leader-team-body">
                                        <h2 className="card-title-aboutUs">{member.name}</h2>
                                        <p className="card-text-aboutUs">
                                        {member.isLeader 
                                            ? (member.role === "Veduci" ? "Vedúci" : `Vedúci - ${member.role}`) 
                                            : member.role}
                                        </p>
                                        <div className="socials-row  aboutUs-socials">

                                            {member.instagram 
                                            ?  <a href={member.instagram} className="instagram instagram-contact" target="_blank" rel="noopener noreferrer">
                                            <i class="bi bi-instagram"></i>
                                            </a>
                                            : " "}
                                           

                                            <a href={`mailto:${member.email}`} className="mail" target="_blank" rel="noopener noreferrer">
                                            <i class="bi bi-envelope-fill"></i>
                                            </a>

                                            {member.facebook 
                                            ?  <a href={member.facebook} className="facebook facebook-contact" target="_blank" rel="noopener noreferrer">
                                             <i class="bi bi-facebook"></i>
                                            </a>
                                            : " "}

                                        </div>
                                    </div>
                                </div>
                            </FadeAnimation>
                        ))
                    ) : (
                        <p>Žiadne výsledky</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default FullTeam;