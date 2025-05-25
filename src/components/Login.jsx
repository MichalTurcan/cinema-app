import { useState } from 'react';
import { useEffect } from "react";
import axios from 'axios';
import {useAuth} from "../context/AuthContext";


const LoginSignupModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { login } = useAuth();

    const [activeMode, setActiveMode] = useState(initialMode);

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    

    useEffect(() => {
        setActiveMode(initialMode);
    }, [initialMode]);

    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    const handleLogin = async (e) => {
        e.preventDefault();

        
        console.log('Login attempt with:', email, password);
        
        if (!email || !password) {
            setError('Všetky polia sú povinné!');
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
            console.log('Login response data:', data);
    
            if (response.ok) {
                login({email, token: data.token, isAdmin: data.isAdmin, isMember: data.isMember, userId: data.userId });
                
                setError('');
                onClose();
            } else {
                setError(data.message);
                setSuccess('');
                
            }
        } catch (error) {
            console.error("Chyba pri prihlásení:", error);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        console.log('Signup attempt with:', email, password);
        if (!email || !password || !confirmPassword) {
            setError('Všetky polia sú povinné!');
            return;
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (password.length < 8){
            setError('Heslo musí obsahovať aspoň osem znakov!');
            return;
        }

        if (!hasUpperCase || !hasNumber){
            setError('Heslo musí obsahovať aspoň jedno veľké písmeno a jedno číslo!');
            return;
        }

        if (password !== confirmPassword) {
            setError('Heslá sa musia zhodovať!');
            return;
        }



        try {
            const response = await axios.post('http://localhost:5001/register', {
                email,
                password,
                confirmPassword
            });

            setSuccess(response.data.message);
            setError('');
            switchToLogin();
        } catch (err) {
            setError(err.response?.data?.message || 'Chyba pri registrácii!');
            setSuccess('');
        }
        
    };

    const switchToLogin = () => setActiveMode('login');
    const switchToSignup = () => setActiveMode('signup');



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
                    <button type="button" className='loginSignup-btn' onClick={onClose} aria-label="Close"><i class="bi bi-x-circle"></i></button>

                    <div className="modal-header">
                        {activeMode === 'login' && (
                            <span> Login</span>
                        )}
                        {activeMode === 'signup' && (
                            <span> Signup</span>
                        )}
                    </div>

                    <div className="modal-body">
                    {success && <div className="success-message">{success}</div>}
                    {error && <div className="error-message">{error}</div>}
                        <div className="row">
                            {activeMode === 'login' && (
                                <>
                                    <form onSubmit={handleLogin}>
                                        <div class="input-box">
                                            <input type="email" id="email" class="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required></input>

                                            <label for="email" class="label">Email
                                            </label>
                                            <i class="bi bi-person icon-login"></i>
                                        </div>
                                        <div class="input-box">
                                            <input type={showLoginPassword ? "text" : "password"} id="password" class="input-field" value={password} onChange={(e) => setPassword(e.target.value)} autocomplete="off"></input>
                                            <label for="password" class="label">Heslo</label>
                                            <i className={`bi icon-login ${showLoginPassword ? "bi-lock" : "bi-unlock"}`}  onClick={() => setShowLoginPassword((prev) => !prev)}>

                                            </i>
                                        </div>
                                        <div class="forgot">
                                            <a href="/">Zabudli ste heslo?</a>
                                        </div>

                                        <div class="input-box">
                                            <input type="submit" class="input-submit" value="Prihlásiť sa"></input>
                                        </div>
                                        <div class="register">
                                            <span>Ešte nemáte účet?
                                                <button onClick={switchToSignup}>Zaregistrujte sa</button></span>
                                        </div>
                                    </form>
                                </>
                            )}

                            {activeMode === 'signup' && (
                                <>
                                    <form onSubmit={handleSignup}>
                                        <div class="input-box">
                                            <input type="email" id="email" class="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required></input>

                                            <label for="email" class="label">Email
                                            </label>
                                            <i class="bi bi-person icon-login"></i>
                                        </div>
                                        <div class="input-box">
                                            <input type={showSignupPassword ? "text" : "password"} id="password" class="input-field" style={{ marginBottom: "10px" }} value={password} onChange={(e) => setPassword(e.target.value)} autocomplete="off"></input>
                                            <label for="password" class="label">Heslo</label>
                                            <i className={`bi icon-login ${showSignupPassword ? "bi-lock" : "bi-unlock"}`}  onClick={() => setShowSignupPassword((prev) => !prev)}>

                                            </i>
                                        </div>
                                        <div class="input-box">
                                            <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" class="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autocomplete="off"></input>
                                            <label for="confirmPassword" class="label">Heslo znova</label>
                                            <i className={`bi icon-login ${showConfirmPassword ? "bi-lock" : "bi-unlock"}`}  onClick={() => setShowConfirmPassword((prev) => !prev)}>

                                            </i>
                                        </div>

                                        <div class="input-box">
                                            <input type="submit" class="input-submit" value="Zaregistrovať sa"></input>
                                        </div>
                                        <div class="register">
                                            <span>Už máte účet?
                                                <button onClick={switchToLogin}>Prihláste sa</button></span>
                                        </div>
                                    </form>

                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginSignupModal;