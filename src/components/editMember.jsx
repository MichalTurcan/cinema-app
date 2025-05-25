import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

import { useAuth } from "../context/AuthContext";


const EditMember = ({ isOpen, onClose, selectedMember }) => {
    const [email, setEmail] = useState('');
    const [roleId, setRole] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLeader, setIsLeader] = useState(false);
    const [roles, setRoles] = useState([]);
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [imagePath, setImagePath] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen && selectedMember) {
            setEmail(selectedMember.email || '');
            setRole(selectedMember.role || '');
            setName(selectedMember.name || '');
            setIsAdmin(selectedMember.isAdmin || false);
            setIsLeader(selectedMember.isLeader || false);
            setImagePath(selectedMember.imageLocation || '');
        }
    }, [isOpen, selectedMember]);

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setEmail('');
        setRole('');
        setName('');
        setIsAdmin(false);
        setIsLeader(false);
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get('/api/roles');

            const rolesData = response.data.data || response.data || [];
            setRoles(rolesData);

        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchRoles();
        }
    }, [isOpen]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("roleId", roleId);
        formData.append("name", name);
        formData.append("isAdmin", isAdmin ? 1 : 0);
        formData.append("isLeader", isLeader ? 1 : 0);
        if (file) {
            formData.append("image", file); 
        } else {
            formData.append("existingImagePath", imagePath); 
        }


        try {
            const response = await axios.put(`/api/members/${selectedMember.memberId}/editMember`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${user.token}`
                }
            });

            if (response.data.success) {
                setImagePath(response.data.imagePath); 
                alert("Successfully");
            } else {
                alert(response.data.message);
            }

            onClose();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user information');
        }
    };

    const modalBackdropStyle = {
        display: isOpen ? 'block' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1050,
    };

    const modalStyle = {
        display: isOpen ? 'flex' : 'none',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1055,
        maxWidth: '1000px',
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <div style={modalBackdropStyle} onClick={onClose}></div>

            <div className='modal-loginSignUp' style={modalStyle} role="document">
                <div className="modal-content modal-content-login" style={{ width: '500px' }}>
                    <button
                        type="button"
                        className='loginSignup-btn'
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-circle"></i>
                    </button>

                    <div className="modal-header">
                        <span>Nastavenie člena</span>
                    </div>

                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="input-box">
                                <input
                                    type="email"
                                    id="email"
                                    className="input-field"
                                    value={email}
                                    placeholder={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled 
                                />
                                <label htmlFor="email" className="label">Email</label>
                                <i className="bi bi-person icon-login"></i>
                            </div>

                            <div className="input-box">
                                <input
                                    type="text"
                                    id="name"
                                    className="input-field"
                                    value={name}
                                    placeholder={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <label htmlFor="email" className="label">Email</label>
                                <i className="bi bi-person icon-login"></i>
                            </div>

                            <div className="input-box">
                                <select
                                    id="role"
                                    name="role"
                                    value={roleId}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="" disabled>Rola*</option>
                                    {roles.map((role) => (
                                        <option key={role.roleId} value={role.roleId}>
                                            {role.role}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-box">
                                        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                                    </div>

                                    
                                    {imagePath && (
                                        <div>
                                            <p>Aktuálny obrázok:</p>
                                            <img src={`${imagePath}`} alt="Profil" width="100" />
                                        </div>
                                    )}

                            <div className="checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isAdmin}
                                        onChange={(e) => setIsAdmin(e.target.checked)}
                                    />
                                    Admin
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isLeader}
                                        onChange={(e) => setIsLeader(e.target.checked)}
                                    />
                                    Vedúci
                                </label>
                            </div>

                            <div className="input-box">
                                <input
                                    type="submit"
                                    className="input-submit"
                                    value="Uložiť zmeny"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditMember;