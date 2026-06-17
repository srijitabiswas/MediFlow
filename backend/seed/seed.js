/**
 * MediFlow Seed Script
 * Creates 15 doctors, 80 patients, and realistic appointment data
 *
 * Usage: node seed/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { calcWaitTime, generateToken } = require('../utils/aiEngine');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediflow';

// ─── Doctor Seed Data ─────────────────────────────────────────────────────────
const DOCTORS_DATA = [
  // General Medicine
  { name: 'Dr. Priya Mehta', department: 'gen', specialization: 'General Physician', avgConsultationTime: 10, rating: 4.7, initials: 'PM', status: 'consulting', delayMinutes: 0, patientsSeenToday: 12, totalPatientsToday: 22 },
  { name: 'Dr. Rahul Gupta', department: 'gen', specialization: 'Internal Medicine Specialist', avgConsultationTime: 12, rating: 4.5, initials: 'RG', status: 'delayed', delayMinutes: 5, patientsSeenToday: 7, totalPatientsToday: 18 },
  { name: 'Dr. Deepa Rao', department: 'gen', specialization: 'General Physician', avgConsultationTime: 10, rating: 4.4, initials: 'DR', status: 'available', delayMinutes: 0, patientsSeenToday: 8, totalPatientsToday: 15 },
  // Cardiology
  { name: 'Dr. Anika Sharma', department: 'card', specialization: 'Senior Cardiologist', avgConsultationTime: 15, rating: 4.9, initials: 'AS', status: 'available', delayMinutes: 0, patientsSeenToday: 8, totalPatientsToday: 14 },
  { name: 'Dr. Vikram Nair', department: 'card', specialization: 'Interventional Cardiologist', avgConsultationTime: 20, rating: 4.8, initials: 'VN', status: 'delayed', delayMinutes: 10, patientsSeenToday: 3, totalPatientsToday: 12 },
  { name: 'Dr. Rohan Singh', department: 'card', specialization: 'Cardiac Electrophysiologist', avgConsultationTime: 25, rating: 4.9, initials: 'RS', status: 'consulting', delayMinutes: 0, patientsSeenToday: 5, totalPatientsToday: 10 },
  // Dermatology
  { name: 'Dr. Sneha Patel', department: 'derm', specialization: 'Dermatologist', avgConsultationTime: 8, rating: 4.6, initials: 'SP', status: 'consulting', delayMinutes: 0, patientsSeenToday: 13, totalPatientsToday: 25 },
  { name: 'Dr. Arjun Kapoor', department: 'derm', specialization: 'Cosmetic Dermatologist', avgConsultationTime: 12, rating: 4.7, initials: 'AK', status: 'available', delayMinutes: 0, patientsSeenToday: 10, totalPatientsToday: 18 },
  { name: 'Dr. Meera Nambiar', department: 'derm', specialization: 'Trichologist', avgConsultationTime: 10, rating: 4.5, initials: 'MN', status: 'delayed', delayMinutes: 5, patientsSeenToday: 10, totalPatientsToday: 20 },
  // Pediatrics
  { name: 'Dr. Kavya Iyer', department: 'peds', specialization: 'Pediatric Specialist', avgConsultationTime: 10, rating: 4.9, initials: 'KI', status: 'available', delayMinutes: 0, patientsSeenToday: 14, totalPatientsToday: 28 },
  { name: 'Dr. Sanjay Kumar', department: 'peds', specialization: 'Neonatologist', avgConsultationTime: 15, rating: 4.6, initials: 'SK', status: 'emergency', delayMinutes: 15, patientsSeenToday: 8, totalPatientsToday: 16 },
  { name: 'Dr. Kiran Reddy', department: 'peds', specialization: 'Child Psychologist', avgConsultationTime: 20, rating: 4.8, initials: 'KR', status: 'available', delayMinutes: 0, patientsSeenToday: 6, totalPatientsToday: 12 },
  // Orthopedics
  { name: 'Dr. Neha Joshi', department: 'orth', specialization: 'Orthopedic Surgeon', avgConsultationTime: 18, rating: 4.8, initials: 'NJ', status: 'consulting', delayMinutes: 0, patientsSeenToday: 7, totalPatientsToday: 14 },
  { name: 'Dr. Amit Verma', department: 'orth', specialization: 'Sports Medicine Specialist', avgConsultationTime: 12, rating: 4.7, initials: 'AV', status: 'available', delayMinutes: 0, patientsSeenToday: 7, totalPatientsToday: 16 },
  { name: 'Dr. Suresh Pillai', department: 'orth', specialization: 'Joint Replacement Specialist', avgConsultationTime: 22, rating: 4.9, initials: 'SP2', status: 'delayed', delayMinutes: 8, patientsSeenToday: 5, totalPatientsToday: 10 },
];

// ─── Patient Seed Data (80 patients) ─────────────────────────────────────────
const PATIENT_NAMES = [
  'Rajesh Kumar', 'Sunita Devi', 'Mohan Lal', 'Preethi Suresh', 'Arjun Mehta',
  'Kaveri Nair', 'Dinesh Rao', 'Lalitha Bhat', 'Suresh Trivedi', 'Anuradha Krishnan',
  'Venkat Ramaiah', 'Sheela Menon', 'Karthik Balaji', 'Usha Gopalakrishnan', 'Ramesh Pandey',
  'Geeta Sharma', 'Anil Bose', 'Shalini Verma', 'Prakash Iyer', 'Meena Pillai',
  'Vijay Nambiar', 'Rohini Patel', 'Santosh Joshi', 'Kavitha Reddy', 'Mahesh Gupta',
  'Anita Kaur', 'Sunil Desai', 'Rekha Sinha', 'Bharat Chandra', 'Leela Devi',
  'Harish Malhotra', 'Shobha Nair', 'Govind Rao', 'Padma Laxmi', 'Ajay Tiwari',
  'Susheela Bhat', 'Naresh Jain', 'Kamala Bai', 'Rakesh Yadav', 'Sarala Devi',
  'Prabhu Swamy', 'Vasantha Kumari', 'Santanu Sen', 'Mala Singh', 'Balaji Krishnan',
  'Radha Menon', 'Chandra Sekhar', 'Indira Pillai', 'Bhushan Patil', 'Savita Rane',
  'Yogesh Kulkarni', 'Ambika Nair', 'Arun Mathur', 'Hema Latha', 'Krishnamurthy T',
  'Sharadha Bai', 'Deepak Aggarwal', 'Nalini Rao', 'Surendra Singh', 'Vasudha Iyer',
  'Ashok Pandey', 'Manjula Devi', 'Ganesh Prabhu', 'Sarojini Naidu', 'Pavan Kumar',
  'Rukmini Devi', 'Sridhar Rao', 'Jayalakshmi S', 'Murugan Pillai', 'Vimala Devi',
  'Chandrashekar R', 'Saranya Krishnan', 'Balasubramanian', 'Nirmala Shetty', 'Venkatraman S',
  'Kalpana Rao', 'Dayanand Singh', 'Sumithra Devi', 'Raghavan Iyer', 'Geetha Menon',
];

function randomPhone() {
  return `9${String(Math.floor(Math.random() * 900000000) + 100000000)}`;
}

function randomAge() {
  return Math.floor(Math.random() * 70) + 10;
}

function randomGender() {
  return ['male', 'female'][Math.floor(Math.random() * 2)];
}

function generateTimeSlot(index) {
  const hours = [9, 10, 11, 14, 15, 16, 17];
  const mins = [0, 15, 30, 45];
  const h = hours[index % hours.length];
  const m = mins[Math.floor(index / hours.length) % mins.length];
  const period = h >= 12 ? 'PM' : 'AM';
  const dh = h > 12 ? h - 12 : h;
  return `${dh}:${String(m).padStart(2, '0')} ${period}`;
}

async function seed() {
  console.log('🌱 MediFlow Seed Script Starting...\n');

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Clear existing data
  await Promise.all([Doctor.deleteMany({}), Patient.deleteMany({}), Appointment.deleteMany({})]);
  console.log('🗑  Cleared existing data\n');

  // ─── Seed Doctors ─────────────────────────────────────────────────────────
  const doctors = await Doctor.insertMany(DOCTORS_DATA);
  console.log(`👨‍⚕️  Seeded ${doctors.length} doctors\n`);

  // ─── Seed Patients ────────────────────────────────────────────────────────
  const patientsData = PATIENT_NAMES.map((name, i) => ({
    name,
    phone: randomPhone(),
    age: randomAge(),
    gender: randomGender(),
    email: name.toLowerCase().replace(/\s/g, '.') + '@email.com',
    bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-'][Math.floor(Math.random() * 7)],
  }));

  const patients = await Patient.insertMany(patientsData);
  console.log(`👥  Seeded ${patients.length} patients\n`);

  // ─── Seed Appointments (5-8 per doctor) ───────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments = [];
  let patientIdx = 0;

  for (const doctor of doctors) {
    const count = Math.floor(Math.random() * 4) + 5; // 5-8 appointments per doctor
    for (let i = 0; i < count; i++) {
      const patient = patients[patientIdx % patients.length];
      patientIdx++;

      const pAhead = i;
      const { estimatedWait, confidence } = calcWaitTime(pAhead, doctor.avgConsultationTime, doctor.delayMinutes);
      const token = generateToken(doctor.department, i + 1);

      let status = 'booked';
      if (i === 0) status = doctor.status === 'consulting' ? 'consulting' : 'waiting';
      else if (Math.random() > 0.8) status = 'waiting';

      appointments.push({
        patient: patient._id,
        doctor: doctor._id,
        department: doctor.department,
        scheduledTime: generateTimeSlot(i),
        scheduledDate: today,
        token,
        queuePosition: i + 1,
        patientsAhead: pAhead,
        estimatedWaitMinutes: estimatedWait,
        aiConfidence: confidence,
        status,
        isEmergency: false,
      });
    }
  }

  await Appointment.insertMany(appointments);
  console.log(`📋  Seeded ${appointments.length} appointments\n`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════');
  console.log('✅  MediFlow Seed Complete!');
  console.log(`   Doctors    : ${doctors.length}`);
  console.log(`   Patients   : ${patients.length}`);
  console.log(`   Appointments: ${appointments.length}`);
  console.log('═══════════════════════════════════════\n');
  console.log('You can now start the server: npm run dev\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
