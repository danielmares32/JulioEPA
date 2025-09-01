import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Edit3, 
  Save, 
  X,
  Camera
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import styles from './Profile.module.css';

export function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // Simulated extended user data
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Carlos Martínez Rodríguez',
    email: user?.email || 'carlos.martinez@edu.uaa.mx',
    phone: '+52 449 123-4567',
    studentId: '20241234',
    career: 'Ingeniería en Sistemas Computacionales',
    semester: '7mo Semestre',
    birthDate: '1999-03-15',
    address: 'Av. Universidad 940, Aguascalientes, Ags.',
    enrollmentDate: '2020-08-01',
    gpa: '9.2',
    completedCredits: '245',
    totalCredits: '320',
    bio: 'Estudiante apasionado por la tecnología y el desarrollo de software. Me especializo en desarrollo web y aplicaciones móviles.'
  });

  const [tempData, setTempData] = useState({ ...profileData });

  const handleEdit = () => {
    setIsEditing(true);
    setTempData({ ...profileData });
  };

  const handleSave = async () => {
    setProfileData({ ...tempData });
    setIsEditing(false);
    // Here you would typically call an API to update the profile
    console.log('Profile updated:', tempData);
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setTempData(prev => ({ ...prev, [field]: value }));
  };


  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Mi Perfil</h1>
          <p className={styles.pageSubtitle}>Gestiona tu información personal y configuración</p>
        </div>

        <div className={styles.profileGrid}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  <User size={48} />
                  <button className={styles.avatarEdit}>
                    <Camera size={16} />
                  </button>
                </div>
                <div className={styles.profileInfo}>
                  <h2 className={styles.userName}>{profileData.name}</h2>
                  <p className={styles.userRole}>{user?.role === 'student' ? 'Estudiante' : 'Profesor'}</p>
                  <p className={styles.userCareer}>{profileData.career}</p>
                </div>
              </div>
              
              <div className={styles.profileActions}>
                {isEditing ? (
                  <div className={styles.editActions}>
                    <button onClick={handleSave} className={`${styles.actionBtn} ${styles.saveBtn}`}>
                      <Save size={16} />
                      Guardar
                    </button>
                    <button onClick={handleCancel} className={`${styles.actionBtn} ${styles.cancelBtn}`}>
                      <X size={16} />
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button onClick={handleEdit} className={`${styles.actionBtn} ${styles.editBtn}`}>
                    <Edit3 size={16} />
                    Editar
                  </button>
                )}
              </div>
            </div>

            <div className={styles.profileStats}>
              <div className={styles.stat}>
                <div className={styles.statValue}>{profileData.gpa}</div>
                <div className={styles.statLabel}>Promedio</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>{profileData.completedCredits}</div>
                <div className={styles.statLabel}>Créditos</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>{profileData.semester}</div>
                <div className={styles.statLabel}>Semestre</div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className={styles.infoCard}>
            <h3 className={styles.cardTitle}>
              <User size={20} />
              Información Personal
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>
                  <Mail size={16} />
                  Correo Institucional
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={tempData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={styles.fieldInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>{profileData.email}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>
                  <Phone size={16} />
                  Teléfono
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={tempData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={styles.fieldInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>{profileData.phone}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>
                  <GraduationCap size={16} />
                  Matrícula
                </label>
                <span className={styles.fieldValue}>{profileData.studentId}</span>
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>
                  <Calendar size={16} />
                  Fecha de Nacimiento
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={tempData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className={styles.fieldInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {new Date(profileData.birthDate).toLocaleDateString('es-MX')}
                  </span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>
                  <MapPin size={16} />
                  Dirección
                </label>
                {isEditing ? (
                  <textarea
                    value={tempData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={styles.fieldTextarea}
                    rows={2}
                  />
                ) : (
                  <span className={styles.fieldValue}>{profileData.address}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>
                  <Calendar size={16} />
                  Fecha de Ingreso
                </label>
                <span className={styles.fieldValue}>
                  {new Date(profileData.enrollmentDate).toLocaleDateString('es-MX')}
                </span>
              </div>
            </div>

            <div className={styles.bioSection}>
              <label className={styles.fieldLabel}>Biografía</label>
              {isEditing ? (
                <textarea
                  value={tempData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className={styles.fieldTextarea}
                  rows={3}
                  placeholder="Cuéntanos un poco sobre ti..."
                />
              ) : (
                <p className={styles.bioText}>{profileData.bio}</p>
              )}
            </div>
          </div>


          {/* Academic Progress */}
          <div className={styles.progressCard}>
            <h3 className={styles.cardTitle}>
              <GraduationCap size={20} />
              Progreso Académico
            </h3>
            
            <div className={styles.progressStats}>
              <div className={styles.progressItem}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Créditos Completados</span>
                  <span className={styles.progressValue}>{profileData.completedCredits}/{profileData.totalCredits}</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ 
                      width: `${(parseInt(profileData.completedCredits) / parseInt(profileData.totalCredits)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className={styles.progressItem}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Promedio General</span>
                  <span className={styles.progressValue}>{profileData.gpa}/10.0</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${(parseFloat(profileData.gpa) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={styles.academicInfo}>
              <div className={styles.academicItem}>
                <span className={styles.academicLabel}>Carrera:</span>
                <span className={styles.academicValue}>{profileData.career}</span>
              </div>
              <div className={styles.academicItem}>
                <span className={styles.academicLabel}>Semestre Actual:</span>
                <span className={styles.academicValue}>{profileData.semester}</span>
              </div>
              <div className={styles.academicItem}>
                <span className={styles.academicLabel}>Fecha de Ingreso:</span>
                <span className={styles.academicValue}>
                  {new Date(profileData.enrollmentDate).toLocaleDateString('es-MX')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}