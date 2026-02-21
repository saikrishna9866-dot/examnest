
export type Category = string;
export type Subject = string;

export interface AcademicFile {
  id: string;
  subject: Subject;
  category: Category;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
}

export type ViewState = 'HOME' | 'ADMIN' | 'SUBJECT_LIST' | 'FILE_VIEW';
