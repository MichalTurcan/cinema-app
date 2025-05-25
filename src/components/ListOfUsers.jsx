import React, { useState, useEffect } from "react";
import axios from "axios";
import SetMember from "./setMember";
import { Link } from "react-router-dom";

import { useAuth } from '../context/AuthContext';


const USERS_PER_PAGE = 100;

function GamaUsers() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { user } = useAuth();
    const isAdmin = user?.isAdmin;



    const fetchUsers = async () => {
        try {

            console.log('Fetching users...');

            if (!user || !user.token) {
                console.error('No authentication token available');
                return;
            }

            const response = await axios.get('/api/users', {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });

            console.log('Response received:', response);

            const usersData = response.data.data || response.data || [];

            console.log('Users data:', usersData);

            setUsers(usersData);

        } catch (error) {
            console.error('Error loading users:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        }

    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * USERS_PER_PAGE;
    const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const openModalForUser = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
        console.log("User: ", user);
    };

    const handleModalClose = () => {
        fetchUsers(); 
        setIsModalOpen(false);
    };

    const handleRemoveMember = async (userId) => {
        try {
            await axios.post(`/api/users/${userId}/removeFromMembers`);
            fetchUsers();
        } catch (error) {
            console.error("Chyba pri odstraňovani člena: ", error);
        }
    }

    const handleOpenUserInfo = async (userId) => {
        try {
            await axios.get(`/api/users/${userId}/userInfo`);
    
            window.location.href = `/users/${userId}/userInfo`;

        } catch (error) {
            console.error("Chyba pri načítavani člena: ", error);
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
                            <th scope="col">ID</th>
                            <th scope="col">Mail</th>
                            <th scope="col">Fakulta</th>
                            {isAdmin && <th scope="col">Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user) => (
                            <tr key={user.userId}>
                                <th scope="row">{user.userId}</th>
                                <td>{user.email}</td>
                                <td>{user.faculty || 'Neuvedené'}</td>
                                {isAdmin &&
                                    <td>
                                        {user.isMember ? (
                                            <button className="btn btn-danger btn-sm" type="submit" onClick={() => handleRemoveMember(user.userId)}>
                                                <i className="bi bi-person-fill-dash"></i>
                                            </button>
                                        ) : (
                                            <button className="btn btn-success btn-sm" type="submit" onClick={() => openModalForUser(user)}>
                                                <i className="bi bi-person-fill-add"></i>
                                            </button>
                                        )}
                                        <button className="btn btn-primary btn-sm" type="submit" onClick={() => handleOpenUserInfo(user.userId)}>
                                        <i class="bi bi-info-circle-fill"></i>
                                        </button>

                                    </td>
                                }
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length > 0 ? (
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
                    <div className="text-center mt-4">No users found.</div>
                )}
            </div>
            <SetMember
                isOpen={isModalOpen}
                onClose={handleModalClose}
                selectedUser={selectedUser}
            />
        </>
    );

}

export default GamaUsers;