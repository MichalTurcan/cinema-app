import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function EditUserInfo() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMember, setIsMember] = useState(true);
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [academicOptions, setAcademicOptions] = useState({
    faculties: [],
    degrees: [],
    facultyProgramsMap: {}
  });
  
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    date_of_birth: "",
    faculty: "",
    degree: "",
    study_program: "",
    grade: "",
    instagram: "",
    facebook: "",
  });

  useEffect(() => {
    const fetchAcademicOptions = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/academic-options');
        if (response.data.success) {
          setAcademicOptions(response.data.data);
        }
      } catch (error) {
        console.error('Error loading academic options:', error);
      }
    };
    
    fetchAcademicOptions();
  }, []);

  useEffect(() => {
    const checkMemberStatus = async () => {
      if (user && user.token) {
        try {
          const response = await axios.get('http://localhost:5001/api/members', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          setIsMember(response.status === 200);
        } catch (error) {
          console.error('Error checking member status:', error);
          setIsMember(false);
        }
      }
    };
    
    checkMemberStatus();
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/users/${userId}/userInfo`);
        
        const userData = Array.isArray(response.data.data) && response.data.data.length > 0 
          ? response.data.data[0] 
          : response.data.data;
        
        if (userData) {
          const formattedDate = userData.date_of_birth 
            ? new Date(userData.date_of_birth).toISOString().split('T')[0]
            : "";
          
          setFormData({
            name: userData.name || "",
            surname: userData.surname || "",
            phone: userData.phone || "",
            address: userData.address || "",
            city: userData.city || "",
            postal_code: userData.postal_code || "",
            date_of_birth: formattedDate,
            faculty: userData.faculty_code || "",  
            degree: userData.degree_code || "",    
            study_program: userData.program_name || "", 
            grade: userData.grade || "",
            instagram: userData.instagram || "",
            facebook: userData.facebook || ""
          });
          
          if (userData.imageLocation) {
            setImagePreview(`${userData.imageLocation}`);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'faculty') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
        degree: "",
        study_program: "",
        grade: ""
      }));
    } else if (name === 'degree') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
        study_program: "",
        grade: ""
      }));
    } else if (name === 'study_program') {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
        grade: ""
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSubmit = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSubmit.append(key, formData[key]);
      });
      
      if (selectedImage && !isMember) {
        formDataToSubmit.append('profileImage', selectedImage);
      }
      
      await axios.put(
        `http://localhost:5001/api/users/${userId}/updateInfo`, 
        formDataToSubmit, 
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Your profile has been updated.");
    } finally {
      navigate(`/users/${userId}/userInfo`);
    }
  };

  const getAvailableDegrees = () => {
    return formData.faculty && academicOptions.facultyProgramsMap[formData.faculty]
      ? Object.keys(academicOptions.facultyProgramsMap[formData.faculty])
      : [];
  };

  const getAvailablePrograms = () => {
    return formData.faculty && formData.degree && 
           academicOptions.facultyProgramsMap[formData.faculty] && 
           academicOptions.facultyProgramsMap[formData.faculty][formData.degree]
      ? academicOptions.facultyProgramsMap[formData.faculty][formData.degree]
      : [];
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    
    const dob = new Date(dateOfBirth);
    const today = new Date();
    
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) return <div>Loading user information...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="mt-4 p-5 header-events">
        <div className="header-events-text">
          <h1 className="header-events-title">Upraviť profil</h1>
          <div className="header-events-path">
            <Link className="header-events-link" to="/">
              <p>Home</p>
            </Link>
            <Link className="header-events-link" to="/users">
              <p>/ Uživatelia </p>
            </Link>
            <Link className="header-events-link" to={`/users/${userId}/userInfo`}>
            / {formData.name} {formData.surname} 
            </Link>
            <p> / Upraviť profil</p>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Meno</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="surname" className="form-label">Priezvisko</label>
                <input
                  type="text"
                  className="form-control"
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Telefón</label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="date_of_birth" className="form-label">Dátum narodenia</label>
                <input
                  type="date"
                  className="form-control"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
                {formData.date_of_birth && (
                  <small className="text-muted">
                    Age: {calculateAge(formData.date_of_birth)} years
                  </small>
                )}
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="mb-3">
                <label htmlFor="address" className="form-label">Adresa</label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="city" className="form-label">Mesto</label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="postal_code" className="form-label">PSČ</label>
                <input
                  type="text"
                  className="form-control"
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <div className="mb-12">
                  <label htmlFor="instagram" className="form-label">Instagram</label>
                  <input
                    type="text"
                    className="form-control"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-12">
                  <label htmlFor="facebook" className="form-label">Facebook</label>
                  <input
                    type="text"
                    className="form-control"
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {!user.isMember && (
              <div className="col-md-12 mb-4">
                <h3>Profilový obrázok</h3>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="profileImage" className="form-label">Nahrajte profilový obrázok</label>
                      <input
                        type="file"
                        className="form-control"
                        id="profileImage"
                        name="profileImage"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                      <small className="text-muted">
                        Recommended size: 250x250 pixels. Max file size: 5MB.
                      </small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    {imagePreview && (
                      <div className="mt-3">
                        <p>Náhľad obrázku:</p>
                        <img 
                          src={imagePreview} 
                          alt="Profile preview" 
                          style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} 
                          className="img-thumbnail"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="col-md-12 mb-4">
              <h3>Univerzitné informácie</h3>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="faculty" className="form-label">Fakulta</label>
                  <select
                    className="form-select"
                    id="faculty"
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleChange}
                  >
                    <option value="">Zvolte fakultu</option>
                    {academicOptions.faculties && academicOptions.faculties.map(faculty => (
                      <option key={faculty.faculty_id} value={faculty.code}>
                        {faculty.code} - {faculty.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="degree" className="form-label">Stupeň štúdia</label>
                  <select
                    className="form-select"
                    id="degree"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    disabled={!formData.faculty}
                  >
                    <option value="">Zvolte stupeň štúdia</option>
                    {getAvailableDegrees().map(degreeCode => {
                      const degree = academicOptions.degrees.find(d => d.code === degreeCode);
                      return (
                        <option key={degreeCode} value={degreeCode}>
                          {degreeCode} - {degree ? degree.name : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="study_program" className="form-label">Študíjny program</label>
                  <select
                    className="form-select"
                    id="study_program"
                    name="study_program"
                    value={formData.study_program}
                    onChange={handleChange}
                    disabled={!formData.degree}
                  >
                    <option value="">Zvolte študíjny program</option>
                    {getAvailablePrograms().map(program => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="grade" className="form-label">Ročník</label>
                  <select
                    className="form-select"
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    disabled={!formData.study_program}
                  >
                    <option value="">Zvolte ročník</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 mb-4">
            <button type="submit" className="btn btn-primary">Uložiť zmeny</button>
            <Link to={`/users/${userId}/userInfo`} className="btn btn-secondary">Zrušiť</Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditUserInfo;