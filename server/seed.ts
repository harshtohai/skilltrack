import bcrypt from 'bcryptjs';
import { db, DatabaseState } from './db.ts';
import { computeConfidence } from './metrics.ts';
import { getBandIndexFromAmount } from './durability.ts';

// Deterministic PRNG
function createPrng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const prng = createPrng(42);

function choice<T>(arr: T[]): T {
  return arr[Math.floor(prng() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(min + prng() * (max - min + 1));
}

const FIRST_NAMES_MALE = [
  'Aarav', 'Rohan', 'Aditya', 'Vikram', 'Pranav', 'Siddharth', 'Nikhil', 'Ganesh',
  'Omkar', 'Tanmay', 'Kunal', 'Saurabh', 'Akash', 'Swapnil', 'Sachin', 'Tushar',
  'Aniket', 'Abhishek', 'Mayur', 'Chetan', 'Vaibhav', 'Shubham', 'Rahul', 'Nitin'
];

const FIRST_NAMES_FEMALE = [
  'Aarti', 'Pooja', 'Priya', 'Snehal', 'Anjali', 'Neha', 'Shruti', 'Sayali',
  'Kavita', 'Tejashri', 'Tanvi', 'Madhuri', 'Deepika', 'Gauri', 'Rupali', 'Pallavi',
  'Ashwini', 'Jyoti', 'Shweta', 'Megha', 'Priyanka', 'Sunita', 'Manisha', 'Archana'
];

const LAST_NAMES = [
  'Patil', 'Deshmukh', 'Kulkarni', 'Jadhav', 'Shinde', 'Pawar', 'More', 'Chavan',
  'Bhosale', 'Gaikwad', 'Kamble', 'Sawant', 'Mane', 'Salunkhe', 'Thorat', 'Kale',
  'Ghuge', 'Wagh', 'Tambe', 'Suryavanshi', 'Gholap', 'Ghadge', 'Kadam', 'Bhide'
];

export async function seedDatabase(force = false) {
  if (db.isSeeded() && !force) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  console.log('Starting deterministic seed generation...');
  const passwordHash = await bcrypt.hash('demo123', 10);

  // 1. Districts (12)
  const districts = [
    { id: 'dist-1', name: 'Mumbai', region: 'Konkan', lat: 19.076, lng: 72.8777 },
    { id: 'dist-2', name: 'Pune', region: 'Paschim Maharashtra', lat: 18.5204, lng: 73.8567 },
    { id: 'dist-3', name: 'Thane', region: 'Konkan', lat: 19.2183, lng: 72.9781 },
    { id: 'dist-4', name: 'Nashik', region: 'Khandesh', lat: 19.9975, lng: 73.7898 },
    { id: 'dist-5', name: 'Nagpur', region: 'Vidarbha', lat: 21.1458, lng: 79.0882 },
    { id: 'dist-6', name: 'Chhatrapati Sambhajinagar', region: 'Marathwada', lat: 19.8762, lng: 75.3433 },
    { id: 'dist-7', name: 'Kolhapur', region: 'Paschim Maharashtra', lat: 16.705, lng: 74.2433 },
    { id: 'dist-8', name: 'Solapur', region: 'Paschim Maharashtra', lat: 17.6599, lng: 75.9064 },
    { id: 'dist-9', name: 'Amravati', region: 'Vidarbha', lat: 20.9374, lng: 77.7796 },
    { id: 'dist-10', name: 'Latur', region: 'Marathwada', lat: 18.4088, lng: 76.5604 },
    { id: 'dist-11', name: 'Nanded', region: 'Marathwada', lat: 19.1383, lng: 77.321 },
    { id: 'dist-12', name: 'Gadchiroli', region: 'Vidarbha', lat: 20.1809, lng: 80.0039 }
  ];

  // 2. Courses (12)
  // Note: deliberate skill gaps for Data Entry, Electrician, and Customer Care
  const courses = [
    {
      id: 'crs-1',
      name: 'Data Entry Operator',
      sector: 'IT & ITES',
      duration_weeks: 12,
      nsqf_level: 4,
      cost_per_trainee: 11500,
      skills_taught: ['Typing 30 WPM', 'MS Word', 'Basic Excel', 'Data Cleaning', 'Email Drafting']
    },
    {
      id: 'crs-2',
      name: 'Electrician (Domestic)',
      sector: 'Construction & Electrical',
      duration_weeks: 24,
      nsqf_level: 4,
      cost_per_trainee: 14500,
      skills_taught: ['Wiring & Conduits', 'Circuit Breakers', 'Earthing Installation', 'Motor Overhaul']
    },
    {
      id: 'crs-3',
      name: 'Customer Care Executive',
      sector: 'Telecom & BPO',
      duration_weeks: 14,
      nsqf_level: 4,
      cost_per_trainee: 12000,
      skills_taught: ['Voice Modulation', 'CRM Navigation', 'Inbound Call Etiquette', 'Active Listening']
    },
    {
      id: 'crs-4',
      name: 'Retail Sales Associate',
      sector: 'Retail & Commerce',
      duration_weeks: 12,
      nsqf_level: 4,
      cost_per_trainee: 9500,
      skills_taught: ['Point of Sale (POS)', 'Merchandising', 'Customer Greeting', 'Inventory Auditing']
    },
    {
      id: 'crs-5',
      name: 'Solar PV Installer',
      sector: 'Green Energy',
      duration_weeks: 16,
      nsqf_level: 5,
      cost_per_trainee: 16000,
      skills_taught: ['Rooftop Mounting', 'Inverter Wiring', 'Solar Basics', 'DC Cabling', 'Safety Harness']
    },
    {
      id: 'crs-6',
      name: 'Welding Technician',
      sector: 'Capital Goods',
      duration_weeks: 20,
      nsqf_level: 4,
      cost_per_trainee: 15500,
      skills_taught: ['MIG Welding', 'TIG Welding', 'Arc Cutting', 'Blueprint Reading']
    },
    {
      id: 'crs-7',
      name: 'CNC Machine Operator',
      sector: 'Automotive & Manufacturing',
      duration_weeks: 20,
      nsqf_level: 5,
      cost_per_trainee: 18000,
      skills_taught: ['G-Code Basics', 'Tool Setting', 'Vernier Calipers', 'Precision Milling']
    },
    {
      id: 'crs-8',
      name: 'Tailoring / Apparel Maker',
      sector: 'Apparel & Handicrafts',
      duration_weeks: 14,
      nsqf_level: 3,
      cost_per_trainee: 9000,
      skills_taught: ['Pattern Making', 'Machine Stitching', 'Garment Finishing', 'Fabric Cutting']
    },
    {
      id: 'crs-9',
      name: 'Healthcare Assistant (GDA)',
      sector: 'Healthcare',
      duration_weeks: 24,
      nsqf_level: 4,
      cost_per_trainee: 17000,
      skills_taught: ['Patient Hygiene', 'Vital Signs Monitoring', 'First Aid & CPR', 'Bedside Care']
    },
    {
      id: 'crs-10',
      name: 'Automotive Service Technician',
      sector: 'Automotive',
      duration_weeks: 22,
      nsqf_level: 4,
      cost_per_trainee: 16500,
      skills_taught: ['Engine Diagnostics', 'Brake Servicing', 'Suspension Tuning', 'OBD Scanner Tools']
    },
    {
      id: 'crs-11',
      name: 'Beauty & Wellness Consultant',
      sector: 'Beauty & Wellness',
      duration_weeks: 12,
      nsqf_level: 3,
      cost_per_trainee: 10500,
      skills_taught: ['Skin Care', 'Hair Styling', 'Client Consultation', 'Hygiene Standards']
    },
    {
      id: 'crs-12',
      name: 'Basic Digital Literacy',
      sector: 'Cross-Sector IT',
      duration_weeks: 8,
      nsqf_level: 3,
      cost_per_trainee: 7500,
      skills_taught: ['Internet Browsing', 'UPI Payments', 'DigiLocker Access', 'Basic Cybersecurity']
    }
  ];

  // 3. Providers (15)
  // Strong: Pune Skill Dev (dist-2), Apex Vocational Thane (dist-3), Mumbai Central ITI (dist-1)
  // Weak: Sahyadri Vocational Solapur (dist-8), Nanded Tribal Skills (dist-11), Gadchiroli Youth ITI (dist-12)
  const providers = [
    {
      id: 'prov-1',
      name: 'Pune Skill Development Centre',
      district_id: 'dist-2',
      type: 'NSDC Partner' as const,
      registered_on: '2021-04-12',
      contact_email: 'pune.skills@demo.in'
    },
    {
      id: 'prov-2',
      name: 'Government ITI Nashik',
      district_id: 'dist-4',
      type: 'ITI' as const,
      registered_on: '2019-06-01',
      contact_email: 'iti.nashik@gov.in'
    },
    {
      id: 'prov-3',
      name: 'Vidarbha Skill Hub',
      district_id: 'dist-5',
      type: 'PMKVY Centre' as const,
      registered_on: '2021-09-15',
      contact_email: 'vidarbha.hub@demo.in'
    },
    {
      id: 'prov-4',
      name: 'Sahyadri Vocational Academy',
      district_id: 'dist-8',
      type: 'Private Training Partner' as const,
      registered_on: '2022-01-20',
      contact_email: 'sahyadri.solapur@demo.in'
    },
    {
      id: 'prov-5',
      name: 'Apex Vocational Institute Thane',
      district_id: 'dist-3',
      type: 'NSDC Partner' as const,
      registered_on: '2020-08-11',
      contact_email: 'apex.thane@demo.in'
    },
    {
      id: 'prov-6',
      name: 'Mumbai Central Technical ITI',
      district_id: 'dist-1',
      type: 'ITI' as const,
      registered_on: '2018-05-10',
      contact_email: 'iti.mumbaicentral@gov.in'
    },
    {
      id: 'prov-7',
      name: 'Marathwada Skill Works',
      district_id: 'dist-6',
      type: 'PMKVY Centre' as const,
      registered_on: '2021-02-14',
      contact_email: 'marathwada.skills@demo.in'
    },
    {
      id: 'prov-8',
      name: 'Kolhapur Foundry & Engineering Hub',
      district_id: 'dist-7',
      type: 'NSDC Partner' as const,
      registered_on: '2020-11-25',
      contact_email: 'kolhapur.hub@demo.in'
    },
    {
      id: 'prov-9',
      name: 'Amravati District Training Centre',
      district_id: 'dist-9',
      type: 'ITI' as const,
      registered_on: '2019-10-05',
      contact_email: 'amravati.iti@gov.in'
    },
    {
      id: 'prov-10',
      name: 'Latur Rural Skills Foundation',
      district_id: 'dist-10',
      type: 'Private Training Partner' as const,
      registered_on: '2022-05-30',
      contact_email: 'latur.foundation@demo.in'
    },
    {
      id: 'prov-11',
      name: 'Nanded Tribal Skills Academy',
      district_id: 'dist-11',
      type: 'PMKVY Centre' as const,
      registered_on: '2022-08-18',
      contact_email: 'nanded.tribal@demo.in'
    },
    {
      id: 'prov-12',
      name: 'Gadchiroli Youth ITI',
      district_id: 'dist-12',
      type: 'ITI' as const,
      registered_on: '2021-07-22',
      contact_email: 'gadchiroli.iti@gov.in'
    },
    {
      id: 'prov-13',
      name: 'Nashik Auto & Renewable Hub',
      district_id: 'dist-4',
      type: 'NSDC Partner' as const,
      registered_on: '2020-03-12',
      contact_email: 'nashik.renewable@demo.in'
    },
    {
      id: 'prov-14',
      name: 'Pimpri-Chinchwad ITI',
      district_id: 'dist-2',
      type: 'ITI' as const,
      registered_on: '2019-01-15',
      contact_email: 'pc.iti@gov.in'
    },
    {
      id: 'prov-15',
      name: 'Konkan Maritime & Logistics Academy',
      district_id: 'dist-1',
      type: 'Private Training Partner' as const,
      registered_on: '2022-04-01',
      contact_email: 'konkan.maritime@demo.in'
    }
  ];

  // 4. Employers (40)
  // GSTIN formats: 27AAAAA0000A1Z5. 30 valid with 27, 7 with other state codes (Pending), 3 Flagged invalid.
  const employers = [];
  const SECTORS = ['Automotive', 'IT & ITES', 'Retail', 'Healthcare', 'Solar Energy', 'Manufacturing', 'Logistics'];
  const VALID_MH_GSTINS = [
    '27AABCT3518Q1Z2', '27AACCB1234D1Z5', '27AAACG9876K1Z9', '27AABCS5544J1Z3',
    '27AADCS1122L1Z8', '27AAECF4433R1Z7', '27AAFCS7788P1Z6', '27AAGCS9900M1Z4',
    '27AAHCS3322N1Z1', '27AAICS6655T1Z0', '27AAJCS2211B1Z9', '27AAKCS8899C1Z8',
    '27AALCS4455D1Z7', '27AAMCS1133E1Z6', '27AANCS7722F1Z5', '27AAOCS9944G1Z4',
    '27AAPCS3366H1Z3', '27AAQCS5588I1Z2', '27AARCS2299J1Z1', '27AASCS8811K1Z0',
    '27AATCS4433L1Z9', '27AAUCS1155M1Z8', '27AAVCS7777N1Z7', '27AAWCS9999P1Z6',
    '27AAXCS3333Q1Z5', '27AAYCS5555R1Z4', '27AAZCS2222S1Z3', '27ABACS8888T1Z2',
    '27ABBCS4444U1Z1', '27ABCCS1111V1Z0'
  ];

  const COMPANY_NAMES = [
    'Tata Motors Fleet Services', 'Infosys BPM Pune', 'Mahindra Solar Systems', 'DMart Avenue Supermarts',
    'Apollo Hospital Navi Mumbai', 'Bajaj Auto Component Works', 'Reliance Retail Nagpur', 'L&T Infotech Mahape',
    'Thermax Energy Solutions', 'Varroc Engineering Aurangabad', 'Kirloskar Pneumatic Pune', 'Persistent Systems Tech',
    'Sahyadri Hospitals Pune', 'Godrej Consumer Products', 'Bharat Forge Hadapsar', 'Foxconn Electronics Navi Mumbai',
    'Zensar Technologies Pune', 'Cummins India Kothrud', 'Cipla Pharmaceuticals Kurkumbh', 'Adani Logistics JNPT',
    'Jindal Steel & Power Tarapur', 'Schneider Electric Ahmednagar', 'Siemens Kalwa Works', 'Pidilite Industries Mahad',
    'Wockhardt Healthcare Chh. Sambhajinagar', 'Force Motors Akurdi', 'Shoppers Stop Mumbai Central', 'Titan Company Watch Division',
    'Hero MotoCorp Service Hub', 'Glenmark Pharma Sinnar'
  ];

  for (let i = 0; i < 30; i++) {
    employers.push({
      id: `emp-${i + 1}`,
      name: COMPANY_NAMES[i],
      gstin: VALID_MH_GSTINS[i],
      udyam: `UDYAM-MH-12-${String(1000000 + i * 31).slice(0, 7)}`,
      sector: SECTORS[i % SECTORS.length],
      district_id: districts[i % districts.length].id,
      verification_status: 'Verified' as const,
      registered_on: `2022-0${(i % 8) + 1}-15`
    });
  }

  // 7 other states (Pending)
  const OTHER_STATE_GSTINS = [
    '24AABCS1111A1Z1', '29AABCS2222B1Z2', '07AABCS3333C1Z3', '06AABCS4444D1Z4',
    '33AABCS5555E1Z5', '36AABCS6666F1Z6', '23AABCS7777G1Z7'
  ];
  for (let i = 0; i < 7; i++) {
    employers.push({
      id: `emp-${31 + i}`,
      name: `Interstate Logistics & Trade ${i + 1}`,
      gstin: OTHER_STATE_GSTINS[i],
      udyam: `UDYAM-GJ-01-009182${i}`,
      sector: 'Logistics',
      district_id: 'dist-1',
      verification_status: 'Pending' as const,
      registered_on: '2023-03-10'
    });
  }

  // 3 Flagged invalid GSTINs
  const FLAGGED_GSTINS = ['27INVALID999Z9', '99ZZZZZ0000Z1Z0', '27FAKEGSTIN1234'];
  for (let i = 0; i < 3; i++) {
    employers.push({
      id: `emp-${38 + i}`,
      name: `Dubious Trades & Services Pvt Ltd ${i + 1}`,
      gstin: FLAGGED_GSTINS[i],
      udyam: undefined,
      sector: 'Retail',
      district_id: 'dist-8',
      verification_status: 'Flagged' as const,
      registered_on: '2023-07-01'
    });
  }

  // 5. Batches (45 batches: ~3 per provider)
  const batches = [];
  let batchCounter = 1;
  const YEARS = ['2023', '2024', '2025'];

  for (const prov of providers) {
    const numBatches = randInt(3, 4);
    for (let b = 0; b < numBatches; b++) {
      const crs = choice(courses);
      const yr = choice(YEARS);
      const startMo = randInt(1, 8);
      const startDay = randInt(1, 28);
      const startDate = `${yr}-${String(startMo).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
      const endMo = Math.min(12, startMo + Math.round(crs.duration_weeks / 4));
      const endDate = `${yr}-${String(endMo).padStart(2, '0')}-28`;

      batches.push({
        id: `batch-${batchCounter}`,
        course_id: crs.id,
        provider_id: prov.id,
        batch_code: `MH-${prov.id.toUpperCase()}-${crs.name.substring(0, 3).toUpperCase()}-${yr}-${b + 1}`,
        start_date: startDate,
        end_date: endDate,
        capacity: 30
      });
      batchCounter++;
    }
  }

  // 6. Trainees (1,800)
  const trainees: any[] = [];
  const consents: any[] = [];
  const enrolments: any[] = [];
  const outcomes: any[] = [];
  const followups: any[] = [];

  const CATEGORIES: ('General' | 'OBC' | 'SC' | 'ST' | 'EWS')[] = [
    'OBC', 'OBC', 'General', 'General', 'SC', 'SC', 'ST', 'EWS'
  ];

  const NON_PLACEMENT_REASONS = [
    'Skill Mismatch', 'Skill Mismatch',
    'No Local Jobs', 'No Local Jobs',
    'Salary Expectation',
    'Family or Personal',
    'Relocation Issues',
    'Lack of Soft Skills',
    'Other'
  ];

  for (let i = 1; i <= 1800; i++) {
    const isMale = prng() < 0.55;
    const firstName = isMale ? choice(FIRST_NAMES_MALE) : choice(FIRST_NAMES_FEMALE);
    const lastName = choice(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const gender = isMale ? 'Male' as const : 'Female' as const;
    const category = choice(CATEGORIES);
    const disability = prng() < 0.032;
    const isRural = prng() < 0.30;
    const areaType = isRural ? 'Rural' as const : 'Urban' as const;

    // Distribute districts: Gadchiroli, Nanded, Latur have specific IDs
    let dist = choice(districts);
    const traineeId = `trainee-${i}`;
    const skillId = `MH-SK-${String(i).padStart(6, '0')}`;

    const birthYear = randInt(1996, 2005);
    const dob = `${birthYear}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`;
    const phoneHash = `ph_${Math.abs(Math.sin(i) * 1e9 | 0)}`;
    const aadhaarHash = `aadh_${String(randInt(1000, 9999))}`;
    const edu = choice(['10th Standard', '12th Standard', 'ITI Passed', 'Graduate (BA/BCom/BSc)', 'Diploma']);

    trainees.push({
      id: traineeId,
      skill_id: skillId,
      full_name: fullName,
      dob,
      gender,
      category,
      disability,
      area_type: areaType,
      district_id: dist.id,
      phone_hash: phoneHash,
      aadhaar_last4_hash: aadhaarHash,
      education_level: edu,
      created_on: '2023-01-10'
    });

    // Consent: ~88% granted, 8% pending, 4% withdrawn
    const consentRoll = prng();
    let consentStatus: 'granted' | 'withdrawn' | 'pending' = 'granted';
    if (consentRoll > 0.96) consentStatus = 'withdrawn';
    else if (consentRoll > 0.88) consentStatus = 'pending';

    consents.push({
      id: `cons-${i}`,
      trainee_id: traineeId,
      version: 'v2.1',
      purposes: {
        employment_tracking: true,
        wage_tracking: true,
        follow_up_contact: true
      },
      status: consentStatus,
      granted_on: consentStatus === 'granted' ? '2023-01-12T10:00:00Z' : undefined,
      withdrawn_on: consentStatus === 'withdrawn' ? '2024-02-15T14:30:00Z' : undefined
    });

    // Enrol in batch: allocate under 25 trainees to prov-10 (18) and prov-15 (21) for low-sample visibility
    const mainBatches = batches.filter(b => b.provider_id !== 'prov-10' && b.provider_id !== 'prov-15');
    let assignedBatch;
    if (i <= 18) {
      assignedBatch = batches.find(b => b.provider_id === 'prov-10') || mainBatches[0];
    } else if (i <= 39) {
      assignedBatch = batches.find(b => b.provider_id === 'prov-15') || mainBatches[0];
    } else {
      assignedBatch = mainBatches[(i - 40) % mainBatches.length];
    }
    const attendance = randInt(72, 98);
    const score = randInt(55, 96);
    const certified = attendance >= 75 && score >= 60;

    const enrolmentId = `enr-${i}`;
    enrolments.push({
      id: enrolmentId,
      trainee_id: traineeId,
      batch_id: assignedBatch.id,
      attendance_pct: attendance,
      assessment_score: score,
      certified,
      certified_on: certified ? assignedBatch.end_date : undefined
    });

    // Outcomes generation for certified trainees
    if (certified) {
      // Find provider to determine placement probability and type personality
      const prov = providers.find((p) => p.id === assignedBatch.provider_id);
      const provType = prov?.type || 'ITI';
      const isWeakProvider = prov?.id === 'prov-4' || prov?.id === 'prov-11' || prov?.id === 'prov-12';
      const isStrongProvider = prov?.id === 'prov-1' || prov?.id === 'prov-5' || prov?.id === 'prov-6';

      let basePlacedProb = 0.68;
      if (isWeakProvider) basePlacedProb = 0.42;
      if (isStrongProvider) basePlacedProb = 0.84;
      if (isRural && !isMale) basePlacedProb -= 0.08; // Rural women 8 points lower

      // Checkpoints: 3, 6, 12, 18, 24 months
      const checkpoints: ('3' | '6' | '12' | '18' | '24')[] = ['3', '6', '12', '18', '24'];
      let isCurrentlyPlaced = prng() < basePlacedProb;
      let chosenEmployer = choice(employers);
      const baseWage = randInt(11000, 22000);
      const batchEndDate = new Date(assignedBatch.end_date);

      // Trainee-level personality multiplier
      const progressionRoll = prng();
      // Target 12m promotion rates by provider type:
      // ITI: ~12%, PMKVY: ~15%, NSDC: ~20%, Private: ~32%
      const targetProgRate = provType === 'Private Training Partner' ? 0.32
        : provType === 'NSDC Partner' ? 0.20
        : provType === 'PMKVY Centre' ? 0.15
        : 0.12;

      checkpoints.forEach((month, cIdx) => {
        const mMonths = parseInt(month, 10);
        const cpDate = new Date(batchEndDate);
        cpDate.setMonth(cpDate.getMonth() + mMonths);

        // Date check: today is 21 September 2026. Newer batches naturally stop when time runs out!
        if (cpDate > new Date('2026-09-21T00:00:00Z')) {
          return;
        }

        // Checkpoint-specific attrition targets by provider type
        // Cumulative retention targets from month 3 baseline:
        // ITI: 6m ~92%, 12m ~80%, 18m ~75%, 24m ~70%
        // PMKVY: 6m ~74%, 12m ~60%, 18m ~53%, 24m ~48%
        // NSDC: 6m ~85%, 12m ~70%, 18m ~64%, 24m ~58%
        // Private: 6m ~83%, 12m ~66%, 18m ~58%, 24m ~52%
        if (month !== '3' && isCurrentlyPlaced) {
          let stepAttrition = 0.12;
          if (month === '6') {
            stepAttrition = provType === 'ITI' ? 0.08
              : provType === 'PMKVY Centre' ? 0.26
              : provType === 'NSDC Partner' ? 0.15
              : 0.17;
          } else if (month === '12') {
            stepAttrition = provType === 'ITI' ? 0.13
              : provType === 'PMKVY Centre' ? 0.19
              : provType === 'NSDC Partner' ? 0.18
              : 0.20;
          } else if (month === '18') {
            stepAttrition = provType === 'ITI' ? 0.06
              : provType === 'PMKVY Centre' ? 0.12
              : provType === 'NSDC Partner' ? 0.09
              : 0.12;
          } else if (month === '24') {
            stepAttrition = provType === 'ITI' ? 0.07
              : provType === 'PMKVY Centre' ? 0.09
              : provType === 'NSDC Partner' ? 0.09
              : 0.10;
          }

          if (isWeakProvider) stepAttrition += 0.12;
          if (isStrongProvider) stepAttrition = Math.max(0.03, stepAttrition - 0.05);

          if (prng() < stepAttrition) {
            isCurrentlyPlaced = false;
          }
        }

        // ~12% Unknown follow-up status at later checkpoints
        const isUnknown = month !== '3' && prng() < 0.12;

        let status: any;
        let jobRole: string | undefined;
        let monthlyWage: number | undefined;
        let businessType: string | undefined;
        let businessEarnings: number | undefined;
        let stipend: number | undefined;
        let nonPlacementReason: string | undefined;
        let stillEmployed = isCurrentlyPlaced;

        if (isUnknown) {
          status = prng() < 0.85 ? 'Not Reachable' : 'Further Study';
          stillEmployed = false;
        } else if (isCurrentlyPlaced) {
          const typeRoll = prng();
          if (typeRoll < 0.74) {
            status = 'Wage Employed';
            jobRole = 'Field Specialist';

            // Wage progression logic
            let mult = 1.0;
            if (month === '3') {
              mult = 1.0;
            } else if (month === '6') {
              mult = prng() < 0.25 ? 1.08 : 1.01;
            } else if (month === '12') {
              if (progressionRoll < targetProgRate) {
                mult = 1.16 + prng() * 0.10; // Progressed (>= +10%)
              } else if ((assignedBatch.course_id === 'crs-3' || assignedBatch.course_id === 'crs-8') && prng() < 0.18) {
                mult = 0.88; // Downgraded (< -5%) for Downgrade cluster rule
              } else {
                mult = 0.98 + prng() * 0.06; // Sustained (-2% to +4%)
              }
            } else if (month === '18') {
              if (progressionRoll < targetProgRate) {
                mult = 1.25 + prng() * 0.12;
              } else {
                mult = 1.02 + prng() * 0.06;
              }
            } else if (month === '24') {
              if (progressionRoll < targetProgRate) {
                mult = 1.34 + prng() * 0.15;
              } else {
                mult = 1.04 + prng() * 0.06;
              }
            }
            monthlyWage = Math.round(baseWage * mult);
          } else if (typeRoll < 0.92) {
            status = 'Self-Employed';
            businessType = choice(['Repair Shop', 'Tailoring Boutique', 'Solar Maintenance Enterprise', 'Service Franchise']);
            const selfProg = progressionRoll < targetProgRate;
            let selfMult = 1.0;
            if (month === '3') selfMult = 1.0;
            else if (month === '6') selfMult = 1.02;
            else if (month === '12') selfMult = selfProg ? 1.18 : 1.02;
            else if (month === '18') selfMult = selfProg ? 1.25 : 1.04;
            else if (month === '24') selfMult = selfProg ? 1.35 : 1.05;
            businessEarnings = Math.round(baseWage * selfMult);
          } else {
            status = 'Apprenticeship';
            stipend = Math.round(baseWage * 0.75);
          }
        } else {
          status = 'Unemployed';
          nonPlacementReason = choice(NON_PLACEMENT_REASONS);
        }

        // Confidence and band precision logic
        // 35% of self-reports or auto-follow-ups submit coarse income bands
        const isBandReport = prng() < 0.35 && (monthlyWage != null || businessEarnings != null);
        const actualIncome = monthlyWage ?? businessEarnings ?? baseWage;
        const incomeBandIdx = isBandReport ? getBandIndexFromAmount(actualIncome) : null;

        const confRoll = prng();
        let traineeConf = false;
        let empConf = false;

        if (status === 'Wage Employed') {
          if (confRoll < 0.45) {
            traineeConf = true;
            empConf = true;
          } else if (confRoll < 0.80) {
            traineeConf = prng() < 0.5;
            empConf = !traineeConf;
          }
        } else if (status === 'Self-Employed' || status === 'Apprenticeship' || status === 'Unemployed') {
          traineeConf = confRoll < 0.80;
        }

        let confidence = computeConfidence(traineeConf, empConf);
        // Per brief: If band-only, lower confidence to Medium
        if (isBandReport && confidence === 'High') {
          confidence = 'Medium';
        }

        outcomes.push({
          id: `out-${i}-${month}`,
          trainee_id: traineeId,
          enrolment_id: enrolmentId,
          checkpoint_month: month,
          status,
          employer_id: status === 'Wage Employed' ? chosenEmployer.id : undefined,
          job_role: jobRole,
          monthly_wage: monthlyWage,
          still_employed: stillEmployed,
          left_reason: !stillEmployed && month !== '3' ? 'Salary expectation & distance' : undefined,
          business_type: businessType,
          business_earnings: businessEarnings,
          persons_employed: businessType ? randInt(1, 4) : undefined,
          scheme_used: businessType ? choice(['PMEGP Scheme', 'Mudra Shishu Loan', 'Self-Funded']) : undefined,
          stipend,
          non_placement_reason: nonPlacementReason,
          non_placement_text: nonPlacementReason ? `I could not secure a job due to ${nonPlacementReason.toLowerCase()} in my taluka.` : undefined,
          income_is_band: isBandReport,
          income_band_index: incomeBandIdx,
          trainee_confirmed: traineeConf,
          employer_confirmed: empConf,
          confidence,
          source: (traineeConf && empConf ? 'Employer' : traineeConf ? 'Self-Report' : 'Auto-Follow-up') as any,
          recorded_on: cpDate.toISOString().split('T')[0]
        });
      });
    }

    // Follow-ups generation (about 150 sampled trainees)
    if (i <= 150) {
      const fStatus = choice([
        'Responded', 'Responded', 'Responded',
        'Sent', 'No Response', 'Escalated to Assisted', 'Scheduled'
      ] as const);

      followups.push({
        id: `fol-${i}`,
        trainee_id: traineeId,
        checkpoint_month: choice(['3', '6', '12'] as const),
        channel: choice(['SMS/WhatsApp', 'IVR', 'Assisted'] as const),
        status: fStatus,
        attempts: fStatus === 'Escalated to Assisted' ? 3 : fStatus === 'Responded' ? 1 : randInt(1, 2),
        scheduled_on: '2024-03-01',
        last_attempt_on: fStatus !== 'Scheduled' ? '2024-03-05' : undefined
      });
    }
  }

  // 7. Employer Demands (30)
  const employerDemands = [
    {
      id: 'dem-1',
      employer_id: 'emp-1',
      skill_tags: ['Automotive Diagnostics', 'Engine Servicing', 'Brake Servicing', 'OBD Scanner Tools'],
      job_role: 'Automotive Technician',
      openings: 15,
      district_id: 'dist-2',
      wage_min: 16000,
      wage_max: 22000,
      posted_on: '2024-02-10'
    },
    {
      id: 'dem-2',
      employer_id: 'emp-2',
      skill_tags: ['Advanced Excel', 'Data Cleaning', 'PowerBI', 'SQL Basics', 'Typing 40 WPM'],
      job_role: 'Data Operations Analyst',
      openings: 25,
      district_id: 'dist-2',
      wage_min: 18000,
      wage_max: 24000,
      posted_on: '2024-02-14'
    },
    {
      id: 'dem-3',
      employer_id: 'emp-3',
      skill_tags: ['Rooftop Mounting', 'Solar Basics', 'DC Cabling', 'Inverter Wiring', 'Safety Auditing'],
      job_role: 'Solar Project Engineer',
      openings: 20,
      district_id: 'dist-4',
      wage_min: 19000,
      wage_max: 26000,
      posted_on: '2024-02-18'
    },
    {
      id: 'dem-4',
      employer_id: 'emp-4',
      skill_tags: ['Point of Sale (POS)', 'Inventory Auditing', 'Customer Greeting', 'Merchandising'],
      job_role: 'Retail Store Lead',
      openings: 35,
      district_id: 'dist-1',
      wage_min: 14000,
      wage_max: 18000,
      posted_on: '2024-02-20'
    },
    {
      id: 'dem-5',
      employer_id: 'emp-5',
      skill_tags: ['Vital Signs Monitoring', 'Patient Hygiene', 'First Aid & CPR', 'Bedside Care'],
      job_role: 'Senior Care Assistant',
      openings: 18,
      district_id: 'dist-3',
      wage_min: 17500,
      wage_max: 23000,
      posted_on: '2024-02-22'
    },
    {
      id: 'dem-6',
      employer_id: 'emp-6',
      skill_tags: ['CNC Machine Operator', 'G-Code Basics', 'Precision Milling', 'Vernier Calipers'],
      job_role: 'CNC Machinist',
      openings: 12,
      district_id: 'dist-6',
      wage_min: 18500,
      wage_max: 25000,
      posted_on: '2024-02-25'
    },
    {
      id: 'dem-7',
      employer_id: 'emp-7',
      skill_tags: ['MIG Welding', 'TIG Welding', 'Arc Cutting', 'Blueprint Reading'],
      job_role: 'Fabrication Welder',
      openings: 14,
      district_id: 'dist-5',
      wage_min: 17000,
      wage_max: 24000,
      posted_on: '2024-02-28'
    },
    {
      id: 'dem-8',
      employer_id: 'emp-2',
      skill_tags: ['English Speaking', 'Voice Modulation', 'CRM Navigation', 'Customer Greeting'],
      job_role: 'Customer Care Executive',
      openings: 30,
      district_id: 'dist-2',
      wage_min: 15000,
      wage_max: 21000,
      posted_on: '2024-03-01'
    }
  ];

  // Fill up to 30 demands
  for (let d = 9; d <= 30; d++) {
    const emp = choice(employers.filter((e) => e.verification_status === 'Verified'));
    const crs = choice(courses);
    employerDemands.push({
      id: `dem-${d}`,
      employer_id: emp.id,
      skill_tags: crs.skills_taught.slice(0, 3).concat(['Problem Solving']),
      job_role: `${crs.name} Staff`,
      openings: randInt(5, 20),
      district_id: emp.district_id,
      wage_min: randInt(12000, 16000),
      wage_max: randInt(18000, 26000),
      posted_on: '2024-03-05'
    });
  }

  // 8. Alerts (8 specified in Section 6.7)
  const alerts = [
    {
      id: 'alt-1',
      type: 'Provider Underperformance',
      severity: 'High' as const,
      entity_type: 'provider' as const,
      entity_id: 'prov-4',
      message: 'Sahyadri Vocational Academy (Solapur): placement 34% for two consecutive batches.',
      suggested_action: 'Issue performance improvement notice; audit placement records within 14 days.',
      status: 'Open' as const,
      created_on: '2024-03-01'
    },
    {
      id: 'alt-2',
      type: 'Low Follow-up Response',
      severity: 'Medium' as const,
      entity_type: 'district' as const,
      entity_id: 'dist-12',
      message: 'Gadchiroli: 12-month follow-up response rate is 46%, below the 50% state minimum threshold.',
      suggested_action: 'Deploy village-level Anganwadi / District Skill Officer assisted calling campaign.',
      status: 'Open' as const,
      created_on: '2024-03-02'
    },
    {
      id: 'alt-3',
      type: 'Curriculum Skill Gap',
      severity: 'High' as const,
      entity_type: 'course' as const,
      entity_id: 'crs-1',
      message: 'Data Entry Operator: critical skill gap on "Advanced Excel" demanded by 78% of BPO employers.',
      suggested_action: 'Mandate NSQF module update with 20 hours hands-on spreadsheet formula training.',
      status: 'In Progress' as const,
      created_on: '2024-03-04'
    },
    {
      id: 'alt-4',
      type: 'Demographic Equity Gap',
      severity: 'High' as const,
      entity_type: 'district' as const,
      entity_id: 'dist-11',
      message: 'Female placement is 12 percentage points below male peers in rural Nanded cohorts.',
      suggested_action: 'Initiate dedicated local women self-help group livelihood linkage program.',
      status: 'Open' as const,
      created_on: '2024-03-05'
    },
    {
      id: 'alt-5',
      type: 'Unverified Employer Claims',
      severity: 'Medium' as const,
      entity_type: 'provider' as const,
      entity_id: 'prov-10',
      message: 'Latur Rural Skills Foundation: 42% of placement claims lack GSTIN-verified employer confirmation.',
      suggested_action: 'Trigger employer verification task to District Employment Officer.',
      status: 'In Progress' as const,
      created_on: '2024-03-06'
    },
    {
      id: 'alt-6',
      type: 'Wage Stagnation',
      severity: 'Low' as const,
      entity_type: 'course' as const,
      entity_id: 'crs-4',
      message: 'Retail Sales Associate: 12-month wage growth is 6.2%, below the inflation index.',
      suggested_action: 'Coordinate with Retailers Association of Maharashtra for supervisory career pathways.',
      status: 'Resolved' as const,
      created_on: '2024-02-15'
    },
    {
      id: 'alt-7',
      type: 'Provider Underperformance',
      severity: 'High' as const,
      entity_type: 'provider' as const,
      entity_id: 'prov-11',
      message: 'Nanded Tribal Skills Academy: 6-month retention dropped to 41%.',
      suggested_action: 'Convene joint review with ITDA project officer on migration and lodging support.',
      status: 'Open' as const,
      created_on: '2024-03-07'
    },
    {
      id: 'alt-8',
      type: 'Curriculum Skill Gap',
      severity: 'Medium' as const,
      entity_type: 'course' as const,
      entity_id: 'crs-2',
      message: 'Electrician (Domestic): Solar Basics demanded by 60% of contractors is missing from syllabus.',
      suggested_action: 'Introduce green skilling bridge module across all government ITIs.',
      status: 'Open' as const,
      created_on: '2024-03-08'
    }
  ];

  // 9. Users (4 demo users + extra)
  const users = [
    {
      id: 'user-gov',
      name: 'Dr. Sanjay Deshmukh (IAS)',
      email: 'gov@demo.in',
      password_hash: passwordHash,
      role: 'government' as const,
      language: 'en' as const
    },
    {
      id: 'user-prov',
      name: 'Pune Skill Development Centre Admin',
      email: 'provider@demo.in',
      password_hash: passwordHash,
      role: 'provider' as const,
      provider_id: 'prov-1',
      language: 'en' as const
    },
    {
      id: 'user-emp',
      name: 'Tata Motors HR Operations',
      email: 'employer@demo.in',
      password_hash: passwordHash,
      role: 'employer' as const,
      employer_id: 'emp-1',
      language: 'en' as const
    },
    {
      id: 'user-trainee',
      name: 'Harsh Panchal',
      email: 'harsh.panchal@trainee.in',
      password_hash: passwordHash,
      role: 'trainee' as const,
      trainee_id: 'trainee-1',
      language: 'en' as const
    }
  ];

  // Give trainee-1 a complete and interesting profile
  const trainee1 = trainees[0];
  trainee1.full_name = 'Harsh Panchal';
  trainee1.skill_id = 'MH-SK-000001';
  trainee1.gender = 'Female';
  trainee1.category = 'OBC';
  trainee1.district_id = 'dist-2'; // Pune

  // Put trainee-1 in an IT/ITES or Electronics batch
  const t1Enrolment = enrolments[0];
  t1Enrolment.attendance_pct = 94;
  t1Enrolment.assessment_score = 88;
  t1Enrolment.certified = true;

  // Make employer-1 have 6 pending hire confirmations awaiting confirmation
  // We can select 6 outcomes of trainees employed by employer-1 where employer_confirmed is false
  const emp1Outcomes = outcomes.filter((o) => o.employer_id === 'emp-1');
  for (let k = 0; k < Math.min(6, emp1Outcomes.length); k++) {
    emp1Outcomes[k].trainee_confirmed = true;
    emp1Outcomes[k].employer_confirmed = false;
    emp1Outcomes[k].confidence = 'Medium';
  }

  const newState: DatabaseState = {
    users,
    districts,
    providers,
    courses,
    batches,
    trainees,
    consents,
    enrolments,
    employers,
    outcomes,
    followups,
    employer_demands: employerDemands,
    alerts,
    audit_log: []
  };

  db.reset(newState);
  console.log(`Database seeded successfully!
  - Users: ${users.length}
  - Districts: ${districts.length}
  - Providers: ${providers.length}
  - Courses: ${courses.length}
  - Batches: ${batches.length}
  - Trainees: ${trainees.length}
  - Consents: ${consents.length}
  - Enrolments: ${enrolments.length}
  - Employers: ${employers.length}
  - Outcomes: ${outcomes.length}
  - Followups: ${followups.length}
  - Demands: ${employerDemands.length}
  - Alerts: ${alerts.length}`);
}
