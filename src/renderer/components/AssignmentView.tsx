import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  X,
  File,
  Image,
  Paperclip
} from 'lucide-react';
import { useTranslation } from '../hooks/useLanguage';
import { useAssignment, useAssignmentSubmission } from '../hooks/useApi';
import { LoadingSpinner, ErrorMessage } from './ErrorBoundary';
import { Assignment } from '../../shared/types/database';
import { offlineManager } from '../services/offlineSync';
import styles from './AssignmentView.module.css';

interface AssignmentViewProps {
  lessonId: string;
  onComplete: () => void;
  onExit: () => void;
}

export function AssignmentView({ lessonId, onComplete, onExit }: AssignmentViewProps) {
  const { t } = useTranslation();
  
  // API hooks
  const { data: assignment, loading: assignmentLoading, error: assignmentError } = useAssignment(lessonId);
  const { 
    data: submission, 
    loading: submissionLoading, 
    submitting, 
    submitAssignment, 
    refetch: refetchSubmission 
  } = useAssignmentSubmission(assignment?.id || '');
  
  // Local state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submissionText, setSubmissionText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [isOffline, setIsOffline] = useState(offlineManager.isOffline());
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load existing submission text
  useEffect(() => {
    if (submission?.submissionText) {
      setSubmissionText(submission.submissionText);
    }
  }, [submission]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDue = (): number => {
    const now = new Date();
    const due = new Date(assignment.dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      // Check file type
      if (assignment.allowedFileTypes.length > 0) {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!assignment.allowedFileTypes.includes(fileExtension)) {
          alert(`Tipo de archivo no permitido: ${file.name}`);
          return false;
        }
      }

      // Check file size
      if (file.size > assignment.maxFileSize * 1024 * 1024) {
        alert(`Archivo demasiado grande: ${file.name} (máximo ${assignment.maxFileSize}MB)`);
        return false;
      }

      return true;
    });

    setSelectedFiles(prev => {
      const newFiles = [...prev, ...validFiles];
      if (newFiles.length > assignment.maxFiles) {
        alert(`Máximo ${assignment.maxFiles} archivos permitidos`);
        return prev;
      }
      return newFiles;
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!assignment) return;
    
    if (selectedFiles.length === 0 && submissionText.trim() === '') {
      alert('Debes subir al menos un archivo o escribir una respuesta');
      return;
    }

    try {
      await submitAssignment(selectedFiles, submissionText);
      onComplete();
      alert('Tarea entregada exitosamente');
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      
      if (isOffline) {
        alert('Sin conexión. Tu tarea se enviará cuando vuelva la conexión.');
        onComplete(); // Mark as complete locally
      } else {
        alert('Error al entregar la tarea. Intenta nuevamente.');
      }
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image size={16} />;
    }
    return <File size={16} />;
  };

  // Loading state
  if (assignmentLoading) {
    return <LoadingSpinner message="Cargando tarea..." />;
  }

  // Error state
  if (assignmentError || !assignment) {
    return (
      <ErrorMessage 
        message={assignmentError || 'No se pudo cargar la tarea'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const daysUntilDue = assignment.dueDate ? getDaysUntilDue() : null;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;
  const submissionStatus = submission ? 'submitted' : 'not-submitted';
  const isGraded = submission?.grade !== undefined;

  return (
    <div className={styles.assignmentContainer}>
      {/* Offline indicator */}
      {isOffline && (
        <div className={styles.offlineIndicator}>
          <AlertTriangle size={16} />
          <span>Sin conexión - Los cambios se guardarán localmente</span>
        </div>
      )}
      {/* Header */}
      <div className={styles.assignmentHeader}>
        <div className={styles.headerContent}>
          <h2 className={styles.assignmentTitle}>{assignment.title}</h2>
          <p className={styles.assignmentDescription}>{assignment.description}</p>
          
          <div className={styles.assignmentMeta}>
            {assignment.dueDate && (
              <div className={styles.metaItem}>
                <Clock size={16} />
                <span className={styles.dueDate}>
                  Fecha límite: {formatDate(assignment.dueDate)}
                </span>
                {isOverdue && (
                  <span className={styles.overdueLabel}>Atrasada</span>
                )}
                {isDueSoon && !isOverdue && (
                  <span className={styles.dueSoonLabel}>Próxima a vencer</span>
                )}
              </div>
            )}
            <div className={styles.metaItem}>
              <CheckCircle size={16} />
              <span>Puntuación máxima: {assignment.maxScore} puntos</span>
            </div>
          </div>
        </div>

        {isGraded && submission && (
          <div className={styles.gradeCard}>
            <div className={styles.gradeScore}>
              {submission.grade}/{assignment.maxScore}
            </div>
            <div className={styles.gradeLabel}>Calificación</div>
          </div>
        )}
      </div>

      <div className={styles.assignmentBody}>
        {/* Instructions */}
        <div className={styles.instructionsSection}>
          <h3 className={styles.sectionTitle}>Instrucciones</h3>
          <div className={styles.instructions}>
            {assignment.instructions.map((instruction, index) => (
              <div key={index} className={styles.instructionItem}>
                <span className={styles.instructionNumber}>{index + 1}.</span>
                <span className={styles.instructionText}>{instruction}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        {assignment.resources && assignment.resources.length > 0 && (
          <div className={styles.resourcesSection}>
            <h3 className={styles.sectionTitle}>Recursos</h3>
            <div className={styles.resourcesList}>
              {assignment.resources.map((resource) => (
                <div key={resource.id} className={styles.resourceItem}>
                  <div className={styles.resourceInfo}>
                    <FileText size={16} />
                    <span className={styles.resourceName}>{resource.name}</span>
                    <span className={styles.resourceSize}>({formatFileSize(resource.size)})</span>
                  </div>
                  <button className={styles.downloadButton}>
                    <Download size={14} />
                    Descargar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Section */}
        {!isGraded && submissionStatus === 'not-submitted' && (
          <div className={styles.submissionSection}>
            <h3 className={styles.sectionTitle}>Entregar Tarea</h3>
            
            {/* Text Submission */}
            <div className={styles.textSubmission}>
              <label className={styles.textLabel}>Respuesta escrita (opcional)</label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className={styles.textArea}
                rows={6}
              />
            </div>

            {/* File Upload */}
            <div className={styles.fileUploadSection}>
              <label className={styles.uploadLabel}>Subir archivos</label>
              <div
                className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept={assignment.allowedFileTypes.join(',')}
                  onChange={handleFileSelect}
                  className={styles.fileInput}
                  id="file-upload"
                />
                <label htmlFor="file-upload" className={styles.dropZoneContent}>
                  <Upload size={32} />
                  <span className={styles.dropZoneText}>
                    Arrastra archivos aquí o haz clic para seleccionar
                  </span>
                  <span className={styles.dropZoneInfo}>
                    Máximo {assignment.maxFiles} archivo{assignment.maxFiles > 1 ? 's' : ''}, 
                    {assignment.maxFileSize}MB cada uno
                  </span>
                  {assignment.allowedFileTypes.length > 0 && (
                    <span className={styles.allowedTypes}>
                      Tipos permitidos: {assignment.allowedFileTypes.join(', ')}
                    </span>
                  )}
                </label>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className={styles.selectedFiles}>
                  <h4 className={styles.selectedFilesTitle}>Archivos seleccionados:</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className={styles.selectedFile}>
                      <div className={styles.fileInfo}>
                        {getFileIcon(file.name)}
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className={styles.removeFileButton}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.submissionActions}>
              <button onClick={onExit} className={styles.cancelButton}>
                Cancelar
              </button>
              <button 
                onClick={handleSubmit}
                className={styles.submitButton}
                disabled={submitting || (selectedFiles.length === 0 && submissionText.trim() === '')}
              >
                <Paperclip size={16} />
                {submitting ? 'Entregando...' : 'Entregar Tarea'}
              </button>
            </div>
          </div>
        )}

        {/* Submitted Files (if already submitted) */}
        {submissionStatus !== 'not-submitted' && submission?.files && (
          <div className={styles.submittedSection}>
            <h3 className={styles.sectionTitle}>Archivos Entregados</h3>
            <div className={styles.submissionInfo}>
              <p className={styles.submissionDate}>
                Entregado el: {submission.submittedAt ? formatDate(submission.submittedAt) : 'N/A'}
              </p>
            </div>
            
            {/* Submitted text */}
            {submission.submissionText && (
              <div className={styles.submittedText}>
                <h4>Respuesta escrita:</h4>
                <p>{submission.submissionText}</p>
              </div>
            )}
            
            {/* Submitted files */}
            {submission.files.length > 0 && (
              <div className={styles.submittedFiles}>
                {submission.files.map((file) => (
                  <div key={file.id} className={styles.submittedFile}>
                    <div className={styles.fileInfo}>
                      {getFileIcon(file.filename)}
                      <span className={styles.fileName}>{file.originalName}</span>
                      <span className={styles.fileSize}>({formatFileSize(file.size)})</span>
                    </div>
                    <button 
                      onClick={() => window.open(file.url, '_blank')}
                      className={styles.downloadButton}
                    >
                      <Download size={14} />
                      Descargar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        {submission?.feedback && (
          <div className={styles.feedbackSection}>
            <h3 className={styles.sectionTitle}>Retroalimentación</h3>
            <div className={styles.feedbackContent}>
              <p>{submission.feedback}</p>
              {submission.gradedAt && (
                <p className={styles.feedbackDate}>
                  Calificado el: {formatDate(submission.gradedAt)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}