
export type Category = 'NOTES' | 'MID QUESTION PAPERS' | 'ASSIGNMENTS' | 'PREVIOUS YEAR SEMESTER PAPERS';

export type Subject = 
  | 'M1' 
  | 'Physics' 
  | 'Engineering Drawing' 
  | 'BEEE' 
  | 'Introduction to programming' 
  | 'Chemistry' 
  | 'BCME' 
  | 'English' 
  | 'M2' 
  | 'Data Structures';

export interface AcademicFile {
  id: string;
  subject: Subject;
  category: Category;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
}

export type ViewState = 'HOME' | 'ADMIN' | 'SUBJECT_LIST' | 'FILE_VIEW';
