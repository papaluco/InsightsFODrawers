export interface PNASchoolData {
  school: string;
  siteType: 'Elementary School' | 'Middle School' | 'High School';
  students: number;
  paid: number;
  pna: number;
  pnaTarget: number;
  pnaDelta: number;
}

export const mockPNAData: PNASchoolData[] = [
  { school: 'Lincoln Elementary', siteType: 'Elementary School', students: 450, paid: 56, pna: 12.44, pnaTarget: 10.00, pnaDelta: 2.44 },
  { school: 'Washington Middle', siteType: 'Middle School', students: 580, paid: 72, pna: 12.41, pnaTarget: 10.00, pnaDelta: 2.41 },
  { school: 'Roosevelt High', siteType: 'High School', students: 920, paid: 115, pna: 12.50, pnaTarget: 10.00, pnaDelta: 2.50 },
  { school: 'Jefferson Elementary', siteType: 'Elementary School', students: 380, paid: 38, pna: 10.00, pnaTarget: 10.00, pnaDelta: 0.00 },
  { school: 'Adams Middle', siteType: 'Middle School', students: 520, paid: 52, pna: 10.00, pnaTarget: 10.00, pnaDelta: 0.00 },
  { school: 'Madison High', siteType: 'High School', students: 850, paid: 102, pna: 12.00, pnaTarget: 10.00, pnaDelta: 2.00 },
  { school: 'Monroe Elementary', siteType: 'Elementary School', students: 410, paid: 49, pna: 11.95, pnaTarget: 10.00, pnaDelta: 1.95 },
  { school: 'Jackson Middle', siteType: 'Middle School', students: 490, paid: 61, pna: 12.45, pnaTarget: 10.00, pnaDelta: 2.45 },
];

export const districtPNATarget = 10.00;

export function calculateDistrictPNA(): number {
  const totalStudents = mockPNAData.reduce((sum, school) => sum + school.students, 0);
  const totalPaid = mockPNAData.reduce((sum, school) => sum + school.paid, 0);
  return (totalPaid / totalStudents) * 100;
}
