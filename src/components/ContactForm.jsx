import { useState } from "react";
import emailjs from '@emailjs/browser';
import "../style/contactForm.css";

function ContactForm() {
    const SERVICE_ID = 'service_89kj8nv';
    const TEMPLATE_ID = 'template_8sof4th';
    const PUBLIC_KEY = 'HCuYtQL7rfbkp06kV';

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(''); 

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email je povinný';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Prosím zadajte valídnu emailovú adresu';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Správa je povinná';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Správa by mala obsahovať aspoň 10 znakov';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: null
            }));
        }

        if (submitStatus) {
            setSubmitStatus('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setSubmitStatus('');

        try {
            const templateParams = {
                from_name: `${formData.firstName} ${formData.lastName}`.trim() || 'Nepodpísaný',
                from_email: formData.email,
                message: formData.message,
                reply_to: formData.email
            };

            const result = await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                templateParams,
                PUBLIC_KEY
            );

            console.log('Email úspešne odoslaný:', result.text);
            setSubmitStatus('success');

            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                message: ''
            });


        } catch (error) {
            console.error('Chyba pri odosielaní emailu:', error);
            setSubmitStatus('error');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            {submitStatus === 'success' && (
                <div className="status-message success-message">
                    ✅ Vaša správa bola úspešne odoslaná! Odpovieme vám čoskoro.
                </div>
            )}

            {submitStatus === 'error' && (
                <div className="status-message error-message">
                    ❌ Nastala chyba pri odosielaní správy. Skúste to prosím znovu.
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-field">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="Meno"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={errors.firstName ? 'error' : ''}
                            disabled={isLoading}
                        />
                        {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                    </div>

                    <div className="form-field">
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Priezvisko"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="form-field full-width">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email*"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        disabled={isLoading}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div className="form-field full-width">
                    <textarea
                        name="message"
                        placeholder="Správa*"
                        value={formData.message}
                        onChange={handleChange}
                        rows="6"
                        className={errors.message ? 'error' : ''}
                        disabled={isLoading}
                    ></textarea>
                    {errors.message && <div className="error-message">{errors.message}</div>}
                </div>
                
                <p style={{color: "#aaaaaa"}}>* povinné údaje</p>
                
                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Odosielam...' : 'Poslať správu'}
                </button>
            </form>
        </>
    );
}

export default ContactForm;