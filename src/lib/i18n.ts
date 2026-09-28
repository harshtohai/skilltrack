export type Language = 'en' | 'mr';

export const translations = {
  en: {
    // Brand & App
    appName: 'SkillTrack Maharashtra',
    stateGov: 'Government of Maharashtra',
    departmentName: 'Dept. of Skills, Employment, Entrepreneurship & Innovation',
    subTitle: 'Longitudinal Skilling-Outcomes & Impact-Measurement Platform',

    // Roles
    role_government: 'Government Official',
    role_provider: 'Training Institute',
    role_employer: 'Verified Employer',
    role_trainee: 'Trainee / Youth',

    // Navigation
    nav_dashboard: 'Executive Dashboard',
    nav_whatsappFollowups: 'WhatsApp Trainee Follow-ups',
    nav_providers: 'Provider Scorecards',
    nav_courses: 'Courses & Cohorts',
    nav_districts: 'Districts & Equity',
    nav_skillGaps: 'Skill Gaps & Heatmap',
    nav_alerts: 'Early Warning & Alerts',
    nav_impact: 'Impact & Policy Brief',
    nav_durability: 'Livelihood Durability (LDI)',
    nav_dataQuality: 'Data Quality Index',
    nav_ai: 'AI Policy Advisor',
    nav_privacy: 'Privacy & Audit Log',

    nav_providerDashboard: 'Institute Dashboard',
    nav_providerDurability: 'My Durability (LDI)',
    nav_providerTrainees: 'Enrolled Trainees',
    nav_providerBatches: 'Training Batches',
    nav_providerFollowups: 'Follow-up Queue',

    nav_employerDashboard: 'Employer Portal',
    nav_employerRegister: 'Company Verification',
    nav_employerHires: 'Confirm Hires',
    nav_employerDemand: 'Post Skill Demand',

    nav_traineeHome: 'My Skilling Record',
    nav_traineeConsent: 'Privacy & Consent',
    nav_traineeFollowup: '60s Follow-up Survey',
    nav_traineeJobs: 'Matched Opportunities',

    // Common Buttons
    switchRole: 'Switch Role (Demo)',
    loginAs: 'Demo as',
    logout: 'Sign Out',
    save: 'Save Changes',
    submit: 'Submit Outcome',
    cancel: 'Cancel',
    exportCsv: 'Export CSV',
    printBrief: 'Print Policy Brief',
    filterBy: 'Filter Analytics',
    clearFilters: 'Reset Filters',

    // Statuses
    status_wageEmployed: 'Wage Employed',
    status_selfEmployed: 'Self-Employed',
    status_apprenticeship: 'Apprenticeship',
    status_furtherStudy: 'Further Study',
    status_unemployed: 'Unemployed',
    status_notReachable: 'Not Reachable',

    // Confidence
    conf_high: 'Verified (High Confidence)',
    conf_med: 'Single Source (Medium)',
    conf_low: 'Unverified (Low)',

    // Follow-up Form
    survey_title: 'Post-Training Outcome Survey',
    survey_subtitle: 'Takes under 60 seconds. Helps the Government evaluate course impact.',
    q1_title: '1. Are you currently engaged in work or livelihood?',
    q1_sub: 'Includes salaried jobs, self-employment, family business, or apprenticeship.',
    q2_title: '2. Where are you currently working?',
    q2_sub: 'Company / business name and location.',
    q3_title: '3. What is your monthly income band?',
    q3_sub: 'All responses are strictly confidential and encrypted under your SkillID.',
    q4_title: '4. Are you still working in the same trade/job as certified?',
    q4_sub: 'Continuity of job placement and skill utilization.',
    q5_title: '5. What is the primary reason you are currently not working?',
    q5_sub: 'Type your explanation in your own words (English, Marathi or Hindi). Gemini AI will classify it.',

    // Gemini
    ai_insights: 'Gemini Policy Intelligence',
    ai_insights_sub: 'Synthesized directly from real-time cohort statistics without PII.',
    ai_ask_placeholder: 'Ask about district trends, women retention, skill gaps...',
    ai_badge: 'AI Policy Assistant',

    // Landing Page & Navigation
    landing_hero_badge: 'Official Government of Maharashtra Skilling Platform',
    landing_hero_title: 'Longitudinal Skilling Outcomes & Livelihood Measurement',
    landing_hero_subtitle: 'A consent-based, longitudinal platform connecting vocational trainees, training institutes, verified employers, and government policy makers to guarantee real, sustainable careers.',
    landing_btn_login: 'Sign In (All Roles)',
    landing_btn_signup: 'Trainee Registration (Sign Up)',
    landing_btn_whatsapp: 'WhatsApp Bot Simulator',
    landing_btn_explore: 'View Executive Dashboard',
    landing_trainee_title: 'Empowering Trainees: Your Verifiable Career Passport',
    landing_trainee_desc: 'Receive automated 60-second follow-up surveys via WhatsApp, verify your official salary and employment status, access employer openings, and keep full DPDP Act 2023 control over your personal data.',
    nav_whatsapp: 'WhatsApp Simulator',
    nav_landing: 'Portal Overview',
    auth_login_title: 'Sign In to SkillTrack Maharashtra',
    auth_login_sub: 'Select your role category or enter registered credentials',
    auth_signup_title: 'Trainee Registration (Sign Up)',
    auth_signup_sub: 'Exclusively for vocational trainees & ITI youth in Maharashtra'
  },
  mr: {
    // Brand & App
    appName: 'स्किलट्रॅक महाराष्ट्र',
    stateGov: 'महाराष्ट्र शासन',
    departmentName: 'कौशल्य, रोजगार, उद्योजकता व नाविन्यता विभाग',
    subTitle: 'प्रशिक्षण पश्चात रोजगार पडताळणी व प्रभाव मोजमाप प्रणाली',

    // Roles
    role_government: 'शासकीय अधिकारी',
    role_provider: 'प्रशिक्षण संस्था',
    role_employer: 'नोंदणीकृत नियोक्ता',
    role_trainee: 'प्रशिक्षणार्थी / तरुण',

    // Navigation
    nav_dashboard: 'मुख्य डॅशबोर्ड',
    nav_whatsappFollowups: 'व्हॉट्सअ‍ॅप पाठपुरावा नोंदी',
    nav_providers: 'संस्था कामगिरी तक्ता',
    nav_courses: 'अभ्यासक्रम व तुकड्या',
    nav_districts: 'जिल्हे व सामाजिक समता',
    nav_skillGaps: 'कौशल्य तूट व हीटमॅप',
    nav_alerts: 'पूर्वसूचना व उपाययोजना',
    nav_impact: 'सामाजिक प्रभाव अहवाल',
    nav_durability: 'उपजीविका टिकाऊपणा (LDI)',
    nav_dataQuality: 'माहिती गुणवत्ता निर्देशांक',
    nav_ai: 'AI धोरण सल्लागार',
    nav_privacy: 'गोपनीयता व ऑडिट लॉग',

    nav_providerDashboard: 'संस्था डॅशबोर्ड',
    nav_providerDurability: 'माझा टिकाऊपणा (LDI)',
    nav_providerTrainees: 'प्रशिक्षणार्थी यादी',
    nav_providerBatches: 'प्रशिक्षण बॅचेस',
    nav_providerFollowups: 'फॉलो-अप पाठपुरावा',

    nav_employerDashboard: 'नियोक्ता दालन',
    nav_employerRegister: 'कंपनी पडताळणी',
    nav_employerHires: 'भरती पुष्टीकरण',
    nav_employerDemand: 'कौशल्य मागणी नोंदवा',

    nav_traineeHome: 'माझे कौशल्य ओळखपत्र',
    nav_traineeConsent: 'गोपनीयता व संमती',
    nav_traineeFollowup: '६०-सेकंद फॉलो-अप फॉर्म',
    nav_traineeJobs: 'नोकरी संधी',

    // Common Buttons
    switchRole: 'भूमिका बदला (डेमो)',
    loginAs: 'या नात्याने लॉगिन करा',
    logout: 'बाहेर पडा',
    save: 'जतन करा',
    submit: 'माहिती सादर करा',
    cancel: 'रद्द करा',
    exportCsv: 'CSV डाउनलोड करा',
    printBrief: 'धोरण अहवाल छापा',
    filterBy: 'माहिती गाळा',
    clearFilters: 'पूर्ववत करा',

    // Statuses
    status_wageEmployed: 'वेतन रोजगार',
    status_selfEmployed: 'स्वयंरोजगार',
    status_apprenticeship: 'शिकाऊ उमेदवारी (Apprentice)',
    status_furtherStudy: 'पुढील शिक्षण',
    status_unemployed: 'सध्या बेरोजगार',
    status_notReachable: 'संपर्क होऊ शकला नाही',

    // Confidence
    conf_high: 'पडताळणीकृत (उच्च विश्वासार्हता)',
    conf_med: 'एकेरी स्रोत (मध्यम)',
    conf_low: 'अपडताळणीकृत (कमी)',

    // Follow-up Form
    survey_title: 'प्रशिक्षणोत्तर रोजगार सर्वेक्षण',
    survey_subtitle: 'फक्त ६० सेकंद. प्रशिक्षणाचा प्रभाव तपासण्यास शासनाला मदत करा.',
    q1_title: '१. आपण सध्या नोकरी किंवा व्यवसायात कार्यरत आहात का?',
    q1_sub: 'यामध्ये वेतन नोकरी, स्वयंरोजगार, कौटुंबिक व्यवसाय किंवा अप्रेंटिसशिप समाविष्ट आहे.',
    q2_title: '२. आपण सध्या कोठे काम करत आहात?',
    q2_sub: 'कंपनीचे / व्यवसायाचे नाव व तालुका/जिल्हा.',
    q3_title: '३. आपले मासिक उत्पन्न अंदाजे किती आहे?',
    q3_sub: 'आपली माहिती गोपनीय आणि आपल्या SkillID अंतर्गत सुरक्षित ठेवली जाते.',
    q4_title: '४. आपण शिकलेल्या ट्रेड/कौशल्याशी संबंधित कामात कार्यरत आहात का?',
    q4_sub: 'मिळालेल्या प्रशिक्षणाचा कामामध्ये उपयोग.',
    q5_title: '५. आपण सध्या काम करत नसल्यास त्याचे मुख्य कारण काय आहे?',
    q5_sub: 'आपल्या शब्दांत कारण लिहा (मराठी, इंग्रजी किंवा हिंदी). जेमिनी AI याचे वर्गीकरण करेल.',

    // Gemini
    ai_insights: 'जेमिनी धोरणात्मक विश्लेषण',
    ai_insights_sub: 'एकत्रित सांख्यिकीवरून त्वरित विश्लेषित (व्यक्तिगत ओळख गुप्त ठेवून).',
    ai_ask_placeholder: 'जिल्हा कल, महिलांचे प्रमाण, कौशल्य तूट याबद्दल विचारा...',
    ai_badge: 'AI धोरण सहाय्यक',

    // Landing Page & Navigation
    landing_hero_badge: 'महाराष्ट्र शासन अधिकृत कौशल्य विकास व्यासपीठ',
    landing_hero_title: 'शाश्वत उपजीविका व दीर्घकालीन रोजगार पडताळणी प्रणाली',
    landing_hero_subtitle: 'प्रशिक्षणार्थी, संस्था, नोंदणीकृत उद्योजक आणि शासकीय धोरणकर्त्यांना एका व्यासपीठावर आणून महाराष्ट्रातील प्रत्येक तरुणाला शाश्वत रोजगाराची हमी.',
    landing_btn_login: 'पोर्टलवर लॉगिन करा (सर्व वर्गवारी)',
    landing_btn_signup: 'प्रशिक्षणार्थी नोंदणी (Sign Up)',
    landing_btn_whatsapp: 'व्हॉट्सअ‍ॅप बॉट सिम्युलेटर',
    landing_btn_explore: 'मुख्य डॅशबोर्ड पहा',
    landing_trainee_title: 'प्रशिक्षणार्थी व तरुणांसाठी: डिजिटल कौशल्य ओळखपत्र',
    landing_trainee_desc: 'आपल्या मोबाईलवर व्हॉट्सअ‍ॅपद्वारे अवघ्या ६० सेकंदांत रोजगार पडताळणी करा, खात्रीशीर वेतन नोंदवा आणि नामांकित कंपन्यांच्या थेट नोकरी संधी मिळवा.',
    nav_whatsapp: 'व्हॉट्सअ‍ॅप सिम्युलेटर',
    nav_landing: 'पोर्टल माहिती',
    auth_login_title: 'स्किलट्रॅक महाराष्ट्र लॉगिन',
    auth_login_sub: 'आपली भूमिका निवडा किंवा खात्याचा तपशील भरा',
    auth_signup_title: 'प्रशिक्षणार्थी नोंदणी (Sign Up)',
    auth_signup_sub: 'फक्त आयटीआय व कौशल्य विकास प्रशिक्षणार्थींसाठी'
  }
};
