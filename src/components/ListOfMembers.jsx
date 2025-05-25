import React, { useState, useEffect } from "react";
import axios from "axios";
import EditMember from "./editMember";

import { useAuth } from '../context/AuthContext';

const MEMBERS_PER_PAGE = 100;

function GamaMembers() {
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    const { user } = useAuth();
    const isAdmin = user?.isAdmin;

    const fetchMembers = async () => {
        try {
            console.log('Fetching members...');
            
            if (!user || !user.token) {
                console.error('No authentication token available');
                return;
            }
            
            const response = await axios.get('http://localhost:5001/api/members', {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });

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

    const filteredMembers = members.filter((member) =>
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastMember = currentPage * MEMBERS_PER_PAGE;
    const indexOfFirstMember = indexOfLastMember - MEMBERS_PER_PAGE;
    const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
    const totalPages = Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const openModalForMember = (member) => {
        setSelectedMember(member);
        setIsModalOpen(true);
        console.log("Member: ", member);
    };

    const handleModalClose = () => {
        fetchMembers();  
        setIsModalOpen(false);
    };

    const handleRemoveMember = async (userId) => {
        try {
            

            if (!user || !user.token) {
                console.error('No authentication token available');
                return;
              }

              await axios.post(
                `http://localhost:5001/api/users/${userId}/removeFromMembers`,
                {}, 
                {
                  headers: {
                    Authorization: `Bearer ${user.token}`
                  }
                }
              ); 
            fetchMembers();
        } catch (error) {
            console.error("Chyba pri odstraňovani člena: ", error);
        }
    }

    return (
        <>
            <input
                type="text"
                className="form-control mb-3 search"
                placeholder="Hľadať podľa emailu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="container mt-4">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Mail</th>
                            <th scope="col">Meno</th>
                            <th scope="col">Fakulta</th>
                            <th scope="col">Rola</th>
                            <th scope="col">isAdmin</th>
                            <th scope="col">isLeader</th>
                            {isAdmin && <th scope="col">Action</th>}
                            
                        </tr>
                    </thead>
                    <tbody>
                        {currentMembers.map((member) => (
                            <tr key={member.memberId}>
                                <th scope="row">{member.email}</th>
                                <td>{member.name}</td>
                                <td>{member.faculty}</td>
                                <td>{member.role}</td>
                                <td>{member.isAdmin ? "Áno" : "Nie"}</td>
                                <td>{member.isLeader ? "Áno" : "Nie"}</td>
                                {isAdmin &&
                                <td>
                                    <button className="btn btn-danger btn-sm mx-2" type="submit" onClick={() => handleRemoveMember(member.userId)}>
                                        <i className="bi bi-person-fill-dash"></i>
                                    </button>
                                    <button className="btn btn-success btn-sm" type="submit" onClick={() => openModalForMember(member)}>
                                        <i class="bi bi-pencil-square"></i>
                                    </button>
                                </td>
                                }
                            </tr>
                        
                        ))}
                    </tbody>
                </table>
                {filteredMembers.length > 0 ? (
                    <nav>
                        <ul className="pagination justify-content-center mt-4">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <li
                                    key={i}
                                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                ) : (
                    <div className="text-center mt-4">No members found.</div>
                )}
            </div>
            <EditMember
                isOpen={isModalOpen}
                onClose={handleModalClose}
                selectedMember={selectedMember}
            />
        </>
    );

}

export default GamaMembers;