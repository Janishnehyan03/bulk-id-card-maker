export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  employeeId: string;
  email: string;
  phone: string;
  address: string;
  photo: string;
  joinDate: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  studentId: string;
  fatherName: string;
  motherName: string;
  address: string;
  photo: string;
  admissionDate: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

export interface CardField {
  id: string;
  key: string;
  label: string;
  value: string;
  side: 'front' | 'back';
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  layer: number;
  rotation?: number;
}

export interface CardTemplate {
  id: string;
  name: string;
  frontImage?: string;
  backImage?: string;
  width: number;
  height: number;
  isDoubleSided: boolean;
  fields: CardField[];
}

export interface PrintSettings {
  paperSize: 'A4' | 'A3' | 'Letter' | 'Custom';
  customWidth?: number;
  customHeight?: number;
  itemsPerRow: number;
  itemsPerColumn: number;
  margin: number;
  bleed: number;
}

export type DataSource = Employee[] | Student[];