export type Vehicle = {
  id: string;
  plate: string;
  state: string;
  make: string;
  model: string;
  color: string;
  primary: boolean;
};
export type StudentProfile = {
  id: string;
  name: string;
  initials: string;
  sjsuId: string;
  email: string;
  major: string;
  vehicles: Vehicle[];
};
export type AdminProfile = {
  name: string;
  initials: string;
  title: string;
  email: string;
};

export const student: StudentProfile = {
  id: 'student-1',
  name: 'Sammy Spartan',
  initials: 'SS',
  sjsuId: '016482913',
  email: 'sammy.spartan@sjsu.edu',
  major: 'Computer Engineering',
  vehicles: [
    { id: 'veh-1', plate: '8ABC123', state: 'CA', make: 'Honda', model: 'Civic', color: 'Blue', primary: true },
    { id: 'veh-2', plate: '7KTR552', state: 'CA', make: 'Toyota', model: 'Corolla', color: 'Silver', primary: false },
  ],
};

export const admin: AdminProfile = {
  name: 'Jordan Rivera',
  initials: 'JR',
  title: 'Parking Enforcement Lead',
  email: 'parking-services@sjsu.edu',
};
