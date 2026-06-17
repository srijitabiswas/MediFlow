// ─── Departments ──────────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  { id: 'gen',  name: 'General Medicine', icon: '🏥', color: '#0F6E56', bg: '#E1F5EE', border: '#9FE1CB', desc: 'Common illnesses & check-ups',    avgWait: 35 },
  { id: 'card', name: 'Cardiology',       icon: '❤️', color: '#C0392B', bg: '#FDECEA', border: '#F1948A', desc: 'Heart & cardiovascular care',      avgWait: 42 },
  { id: 'derm', name: 'Dermatology',      icon: '✨', color: '#6C3483', bg: '#F5EEF8', border: '#D2B4DE', desc: 'Skin, hair & nail conditions',     avgWait: 28 },
  { id: 'peds', name: 'Pediatrics',       icon: '👶', color: '#1A5276', bg: '#EBF5FB', border: '#A9CCE3', desc: "Children's health & wellness",     avgWait: 25 },
  { id: 'orth', name: 'Orthopedics',      icon: '🦴', color: '#9A7D0A', bg: '#FEFBD8', border: '#F9E79F', desc: 'Bones, joints & muscles',          avgWait: 50 },
];

// ─── Doctors (15 total, 3 per dept) ─────────────────────────────────────────
export const DOCTORS = [
  { id: 1,  name: 'Dr. Priya Mehta',    dept: 'gen',  spec: 'General Physician',             avgTime: 10, rating: 4.7, initials: 'PM',  delay: 0,  status: 'consulting', patientsToday: 22, patientsLeft: 8  },
  { id: 2,  name: 'Dr. Rahul Gupta',    dept: 'gen',  spec: 'Internal Medicine Specialist',   avgTime: 12, rating: 4.5, initials: 'RG',  delay: 5,  status: 'delayed',    patientsToday: 18, patientsLeft: 11 },
  { id: 3,  name: 'Dr. Deepa Rao',      dept: 'gen',  spec: 'General Physician',              avgTime: 10, rating: 4.4, initials: 'DR',  delay: 0,  status: 'available',  patientsToday: 15, patientsLeft: 7  },
  { id: 4,  name: 'Dr. Anika Sharma',   dept: 'card', spec: 'Senior Cardiologist',            avgTime: 15, rating: 4.9, initials: 'AS',  delay: 0,  status: 'available',  patientsToday: 14, patientsLeft: 6  },
  { id: 5,  name: 'Dr. Vikram Nair',    dept: 'card', spec: 'Interventional Cardiologist',    avgTime: 20, rating: 4.8, initials: 'VN',  delay: 10, status: 'delayed',    patientsToday: 12, patientsLeft: 9  },
  { id: 6,  name: 'Dr. Rohan Singh',    dept: 'card', spec: 'Cardiac Electrophysiologist',    avgTime: 25, rating: 4.9, initials: 'RS',  delay: 0,  status: 'consulting', patientsToday: 10, patientsLeft: 5  },
  { id: 7,  name: 'Dr. Sneha Patel',    dept: 'derm', spec: 'Dermatologist',                  avgTime: 8,  rating: 4.6, initials: 'SP',  delay: 0,  status: 'consulting', patientsToday: 25, patientsLeft: 12 },
  { id: 8,  name: 'Dr. Arjun Kapoor',   dept: 'derm', spec: 'Cosmetic Dermatologist',         avgTime: 12, rating: 4.7, initials: 'AK',  delay: 0,  status: 'available',  patientsToday: 18, patientsLeft: 8  },
  { id: 9,  name: 'Dr. Meera Nambiar',  dept: 'derm', spec: 'Trichologist',                   avgTime: 10, rating: 4.5, initials: 'MN',  delay: 5,  status: 'delayed',    patientsToday: 20, patientsLeft: 10 },
  { id: 10, name: 'Dr. Kavya Iyer',     dept: 'peds', spec: 'Pediatric Specialist',           avgTime: 10, rating: 4.9, initials: 'KI',  delay: 0,  status: 'available',  patientsToday: 28, patientsLeft: 14 },
  { id: 11, name: 'Dr. Sanjay Kumar',   dept: 'peds', spec: 'Neonatologist',                  avgTime: 15, rating: 4.6, initials: 'SK',  delay: 15, status: 'emergency',  patientsToday: 16, patientsLeft: 8  },
  { id: 12, name: 'Dr. Kiran Reddy',    dept: 'peds', spec: 'Child Psychologist',             avgTime: 20, rating: 4.8, initials: 'KR',  delay: 0,  status: 'available',  patientsToday: 12, patientsLeft: 6  },
  { id: 13, name: 'Dr. Neha Joshi',     dept: 'orth', spec: 'Orthopedic Surgeon',             avgTime: 18, rating: 4.8, initials: 'NJ',  delay: 0,  status: 'consulting', patientsToday: 14, patientsLeft: 7  },
  { id: 14, name: 'Dr. Amit Verma',     dept: 'orth', spec: 'Sports Medicine Specialist',     avgTime: 12, rating: 4.7, initials: 'AV',  delay: 0,  status: 'available',  patientsToday: 16, patientsLeft: 9  },
  { id: 15, name: 'Dr. Suresh Pillai',  dept: 'orth', spec: 'Joint Replacement Specialist',   avgTime: 22, rating: 4.9, initials: 'SP2', delay: 8,  status: 'delayed',    patientsToday: 10, patientsLeft: 5  },
];

// ─── Patient names pool (80 names) ───────────────────────────────────────────
export const PATIENT_NAMES = [
  'Rajesh Kumar','Sunita Devi','Mohan Lal','Preethi S.','Arjun Mehta',
  'Kaveri Nair','Dinesh Rao','Lalitha B.','Suresh T.','Anuradha K.',
  'Venkat R.','Sheela M.','Karthik B.','Usha G.','Ramesh P.',
  'Geeta Sharma','Anil Bose','Shalini V.','Prakash Iyer','Meena Pillai',
  'Vijay N.','Rohini P.','Santosh J.','Kavitha R.','Mahesh G.',
  'Anita K.','Sunil D.','Rekha S.','Bharat C.','Leela Devi',
  'Harish M.','Shobha N.','Govind R.','Padma L.','Ajay T.',
  'Susheela B.','Naresh J.','Kamala B.','Rakesh Y.','Sarala D.',
  'Prabhu S.','Vasantha K.','Santanu S.','Mala Singh','Balaji K.',
  'Radha M.','Chandra S.','Indira P.','Bhushan P.','Savita R.',
  'Yogesh K.','Ambika N.','Arun M.','Hema L.','Krishnamurthy T.',
  'Sharadha B.','Deepak A.','Nalini R.','Surendra S.','Vasudha I.',
  'Ashok P.','Manjula D.','Ganesh P.','Sarojini N.','Pavan K.',
  'Rukmini D.','Sridhar R.','Jayalakshmi S.','Murugan P.','Vimala D.',
  'Chandrashekar R.','Saranya K.','Balasubramanian','Nirmala S.','Venkatraman S.',
  'Kalpana R.','Dayanand S.','Sumithra D.','Raghavan I.','Geetha M.',
];

// ─── Token prefix per dept ────────────────────────────────────────────────────
const TOKEN_PREFIX = { gen: 'G', card: 'C', derm: 'D', peds: 'P', orth: 'O' };

// ─── Generate a random queue for a given doctor ───────────────────────────────
export function generateQueue(doctorId, count = null) {
  const doc   = DOCTORS.find((d) => d.id === doctorId);
  const pfx   = TOKEN_PREFIX[doc?.dept] || 'X';
  const n     = count !== null ? count : Math.floor(Math.random() * 7) + 4;
  return Array.from({ length: n }, (_, i) => ({
    id:       `P${doctorId}-${i}-${Date.now()}`,
    name:     PATIENT_NAMES[i % PATIENT_NAMES.length],
    position: i + 1,
    status:   i === 0 ? 'consulting' : 'waiting',
    apptTime: `${9 + Math.floor(i * 0.5)}:${i % 2 === 0 ? '00' : '30'} AM`,
    token:    `${pfx}${String(i + 1).padStart(2, '0')}`,
  }));
}

// ─── Generate available time slots ───────────────────────────────────────────
export function generateSlots() {
  return [
    [9,0],[9,15],[9,30],[9,45],
    [10,0],[10,15],[10,30],[10,45],
    [11,0],[11,15],[11,30],[11,45],
    [14,0],[14,15],[14,30],[14,45],
    [15,0],[15,15],[15,30],[15,45],
    [16,0],[16,30],[17,0],
  ].map(([h, m]) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const dh     = h > 12 ? h - 12 : h;
    return {
      time:      `${dh}:${String(m).padStart(2, '0')} ${period}`,
      available: Math.random() > 0.35,
    };
  });
}
