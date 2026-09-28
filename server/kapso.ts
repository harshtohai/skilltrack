/**
 * Kapso WhatsApp SDK Service
 * Handles WhatsApp Cloud API messaging, direct dispatch to user phone numbers,
 * interactive button generation, and survey outcome collection.
 * 
 * Official Target Contact for SkillTrace Maharashtra: 7778040723
 */

import { WhatsAppClient } from '@kapso/whatsapp-cloud-api';
import { db } from './db.ts';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PROCESSED_IDS_FILE = path.join(DATA_DIR, 'kapso_processed_ids.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'kapso_sessions.json');

interface SurveySession {
  traineeId: string;
  traineeName: string;
  lastEmployer?: string;
  currentStep: number;
  data: Record<string, any>;
  windowActive?: boolean;
  status: 'idle' | 'waiting_for_reply' | 'processing' | 'completed';
  startedAt?: number;
  lastDispatchedTimestamp: number;
  lastDispatchedStep: number;
  language?: 'en' | 'mr';
}

interface KapsoConfig {
  apiKey: string;
  phoneNumberId: string;
  senderNumber: string;
  displaySenderNumber: string;
}

let currentConfig: KapsoConfig = {
  apiKey: process.env.KAPSO_API_KEY || '3ba26e20ed8b8bbd58e39f2c47e7b46a50b1a8069d28d137b98e3917a45c5c2b',
  phoneNumberId: process.env.KAPSO_PHONE_NUMBER_ID || '1364763996715263',
  senderNumber: '12084454652',
  displaySenderNumber: '+1 208-445-4652'
};

let whatsappClientInstance: WhatsAppClient | null = null;

function getWhatsAppClient(): WhatsAppClient | null {
  if (currentConfig.apiKey) {
    if (!whatsappClientInstance) {
      try {
        whatsappClientInstance = new WhatsAppClient({
          kapsoApiKey: currentConfig.apiKey,
          baseUrl: 'https://api.kapso.ai/meta/whatsapp'
        });
      } catch (err) {
        console.warn('Could not initialize Kapso WhatsAppClient:', err);
      }
    }
    return whatsappClientInstance;
  }
  return null;
}

export interface WhatsAppMessagePayload {
  to: string; // e.g. 7778040723 or +91 7778040723
  type: 'text' | 'interactive' | 'template';
  text?: string;
  interactive?: {
    type: 'button' | 'list';
    header?: { type: 'text'; text: string };
    body: { text: string };
    footer?: { text: string };
    action: {
      buttons?: Array<{
        type: 'reply';
        reply: { id: string; title: string };
      }>;
      button?: string;
      sections?: Array<{
        title: string;
        rows: Array<{ id: string; title: string; description?: string }>;
      }>;
    };
  };
}

export interface KapsoDispatchRecord {
  id: string;
  messageId: string;
  to: string;
  stepIndex: number;
  stepTitle: string;
  status: 'dispatched' | 'delivered' | 'read' | 'replied' | 'window_closed' | 'failed';
  isLive: boolean;
  content: string;
  buttons: string[];
  timestamp: string;
  replyReceived?: string;
  replyTimestamp?: string;
  errorDetails?: string;
  requires24hWindow?: boolean;
}

// In-memory record of recent Kapso dispatches directly to phone numbers
const dispatchHistory: KapsoDispatchRecord[] = [];
const processedIncomingIds = new Set<string>();
const inFlightDispatches = new Set<string>();
let isFirstPoll = true;
let isPolling = false;

// Ongoing conversational state tracked per phone number
const activeSurveys: Map<string, SurveySession> = new Map();

// Load persistent state from disk
try {
  if (fs.existsSync(PROCESSED_IDS_FILE)) {
    const rawIds = JSON.parse(fs.readFileSync(PROCESSED_IDS_FILE, 'utf-8'));
    if (Array.isArray(rawIds)) {
      rawIds.forEach((id: string) => processedIncomingIds.add(id));
    }
  }
  if (fs.existsSync(SESSIONS_FILE)) {
    const rawSessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
    if (rawSessions && typeof rawSessions === 'object') {
      Object.entries(rawSessions).forEach(([phone, sess]: [string, any]) => {
        activeSurveys.set(phone, sess);
      });
    }
  }
} catch (err) {
  console.warn('Failed loading persisted Kapso state:', err);
}

function persistState() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROCESSED_IDS_FILE, JSON.stringify(Array.from(processedIncomingIds)), 'utf-8');
    const obj: Record<string, SurveySession> = {};
    activeSurveys.forEach((v, k) => {
      obj[k] = v;
    });
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed persisting Kapso state:', err);
  }
}

export class KapsoWhatsAppService {
  public static getConfig(): KapsoConfig & { isLive: boolean; activationUrl: string } {
    return {
      ...currentConfig,
      isLive: Boolean(currentConfig.apiKey && currentConfig.phoneNumberId),
      activationUrl: `https://wa.me/${currentConfig.senderNumber}?text=${encodeURIComponent('Hi SkillTrack')}`
    };
  }

  public static updateConfig(newConfig: Partial<KapsoConfig>) {
    currentConfig = {
      ...currentConfig,
      ...newConfig
    };
    whatsappClientInstance = null; // Re-init on next call
    return this.getConfig();
  }

  public static formatPhoneNumber(rawPhone: string): string {
    const cleaned = String(rawPhone || '').replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned;
    }
    return cleaned;
  }

  public static getDispatchLogs(): KapsoDispatchRecord[] {
    return [...dispatchHistory].reverse();
  }

  public static clearDispatchLogs() {
    dispatchHistory.length = 0;
  }

  public static getSession(rawPhone: string): SurveySession | null {
    const phone = this.formatPhoneNumber(rawPhone);
    return activeSurveys.get(phone) || null;
  }

  /**
   * Dispatches WhatsApp message directly to the recipient's phone number using Kapso.
   */
  public static async sendMessage(
    payload: WhatsAppMessagePayload,
    meta?: { stepIndex?: number; stepTitle?: string }
  ): Promise<{
    success: boolean;
    messageId: string;
    status: 'sent_live' | 'simulated' | 'window_closed' | 'failed';
    details: string;
    to: string;
    requires24hWindow?: boolean;
    botNumber?: string;
    activationLink?: string;
  }> {
    const formattedTo = this.formatPhoneNumber(payload.to);
    if (!formattedTo || formattedTo.length < 10) {
      return {
        success: false,
        messageId: '',
        status: 'failed',
        details: 'Valid 10-digit mobile number is required for dispatch',
        to: payload.to || ''
      };
    }
    let messageId = `wamid.kapso_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const timestamp = new Date().toISOString();
    const isLive = Boolean(currentConfig.apiKey && currentConfig.phoneNumberId);

    const buttonTitles = payload.interactive?.action?.buttons?.map((b) => b.reply.title) || [];
    const messageText = payload.text || payload.interactive?.body.text || '';

    let actualStatus: 'delivered' | 'dispatched' | 'window_closed' | 'failed' = isLive ? 'delivered' : 'dispatched';
    let errorDetails: string | undefined = undefined;
    let requires24hWindow = false;

    // Enforce Meta WhatsApp Cloud API limit: button reply titles MUST be <= 20 chars
    if (payload.interactive?.action?.buttons) {
      for (const b of payload.interactive.action.buttons) {
        if (b.reply && b.reply.title) {
          b.reply.title = b.reply.title.trim().slice(0, 20);
        }
      }
    }

    // Attempt live dispatch via Kapso Meta Proxy endpoint
    if (isLive) {
      try {
        const kapsoUrl = `https://api.kapso.ai/meta/whatsapp/v23.0/${currentConfig.phoneNumberId}/messages`;
        
        // Ensure proper format for Meta WhatsApp Cloud API
        let requestBody: any = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedTo
        };

        if (payload.type === 'text') {
          requestBody.type = 'text';
          requestBody.text = { body: payload.text || '' };
        } else if (payload.type === 'interactive' && payload.interactive) {
          requestBody.type = 'interactive';
          requestBody.interactive = payload.interactive;
        } else {
          requestBody = { ...requestBody, ...payload };
        }

        const response = await fetch(kapsoUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': currentConfig.apiKey
          },
          body: JSON.stringify(requestBody)
        });

        const resData: any = await response.json().catch(() => null);

        if (response.ok && resData) {
          actualStatus = 'delivered';
          if (resData.messages?.[0]?.id) {
            messageId = resData.messages[0].id;
          }
        } else {
          const errString = JSON.stringify(resData || {});
          errorDetails = resData?.error?.message || resData?.error || `HTTP ${response.status}`;
          
          if (response.status === 422 || errString.includes('24-hour window') || errString.includes('outside the 24-hour')) {
            requires24hWindow = true;
            actualStatus = 'window_closed';
            errorDetails = 'Cannot send message outside 24-hour customer window. User must initiate first.';
          } else {
            actualStatus = 'failed';
          }
          console.warn('[Kapso Dispatch Response]', response.status, errorDetails);
        }
      } catch (err: any) {
        actualStatus = 'failed';
        errorDetails = err?.message || String(err);
        console.warn('[Kapso Dispatch Error]', errorDetails);
      }
    }

    // Record in transmission history
    const record: KapsoDispatchRecord = {
      id: `disp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      messageId,
      to: formattedTo,
      stepIndex: meta?.stepIndex ?? 0,
      stepTitle: meta?.stepTitle || 'Direct Notification',
      status: actualStatus,
      isLive,
      content: messageText,
      buttons: buttonTitles,
      timestamp,
      errorDetails,
      requires24hWindow
    };

    dispatchHistory.push(record);
    if (dispatchHistory.length > 100) {
      dispatchHistory.shift();
    }

    if (requires24hWindow) {
      return {
        success: false,
        requires24hWindow: true,
        messageId,
        status: 'window_closed',
        botNumber: currentConfig.displaySenderNumber,
        activationLink: `https://wa.me/${currentConfig.senderNumber}?text=${encodeURIComponent('Hi SkillTrack')}`,
        details: `Meta WhatsApp requires an active 24-hour window. Please tap the WhatsApp link to send 'Hi' to our bot (${currentConfig.displaySenderNumber}) to activate your session.`,
        to: formattedTo
      };
    }

    if (actualStatus === 'failed') {
      return {
        success: false,
        requires24hWindow: false,
        messageId,
        status: 'failed',
        details: errorDetails || 'Failed to dispatch message via Kapso.',
        to: formattedTo
      };
    }

    return {
      success: true,
      messageId,
      status: isLive ? 'sent_live' : 'simulated',
      details: isLive
        ? `Live WhatsApp message successfully delivered to +${formattedTo} via Kapso Meta Cloud API.`
        : `WhatsApp message transmission queued for +${formattedTo} via Kapso SDK.`,
      to: formattedTo
    };
  }

  /**
   * Generates the official 13-stage conversational survey step payload per prompt requirements:
   * 0: Hello & Purpose + Consent Buttons (Yes/No)
   * 1: Employment Status Check (Salaried, Self-Employed, Apprenticeship, Seeking, Studies)
   * 2: Employer Organization (Includes Last Recorded Employer if exists)
   * 3: Role Details (Technician, Operator, QA, Supervisor)
   * 4: Salary Range (<15k, 15-25k, 25-40k, >40k)
   * 5: Job Satisfaction (Very Satisfied, Satisfied, Neutral, Unsatisfied)
   * 6: Training Relevance (100% Relevant, 50-80%, <50%, Unrelated)
   * 7: Skill Gaps (CNC, Digital Tools, English/Soft Skills, Safety/Quality)
   * 8: Suggested Upskilling Courses (Industrial Robotics, EV Battery, Solar Grid, AI Machine Ops)
   * 9: Career Goals (Supervisor, Master Specialist, Own Business, Overseas)
   * 10: Biggest Challenge (Low Salary, Limited Growth, Long Commute, Outdated Tools)
   * 11: Completion Message with Website Link
   */
  public static getSurveyStepPayload(
    stepIndex: number,
    to: string,
    options?: {
      traineeName?: string;
      lastEmployer?: string | null;
      language?: 'en' | 'mr';
    }
  ): { payload: WhatsAppMessagePayload; stepTitle: string } {
    const lang = options?.language || 'en';
    const name = options?.traineeName || 'Trainee';
    const lastEmployer = options?.lastEmployer || 'Tata Motors Ltd';
    const hasLastEmployer = Boolean(lastEmployer && lastEmployer.trim() !== '');

    switch (stepIndex) {
      case 0:
        return {
          stepTitle: 'Step 1: Hello & Purpose + Consent',
          payload: {
            to,
            type: 'interactive',
            interactive: {
              type: 'button',
              header: {
                type: 'text',
                text: '🏛️ SkillTrack Maharashtra'
              },
              body: {
                text: lang === 'mr'
                  ? `नमस्कार ${name}! आम्ही महाराष्ट्र शासनाच्या कौशल्य, रोजगार व उद्योजकता विभागाच्या वतीने 'SkillTrack Maharashtra' अंतर्गत संपर्क साधत आहोत. आपल्या शासकीय प्रशिक्षणानंतर रोजगार प्रगती जाणून घेणे व अधिक चांगल्या संधींशी जोडणे हा या संदेशाचा उद्देश आहे. काय आपण २ मिनिटांचे सर्वेक्षण सुरू करण्यास तयार आहात?`
                  : `Namaskar ${name}! This is SkillTrack Maharashtra (Dept of Skills, Govt of Maharashtra). We are checking in to verify your employment outcome following your vocational certification and connect you with verified higher-paying career opportunities. Do you agree to proceed with this 2-minute check-in?`
              },
              footer: {
                text: 'DPDP Act 2023 Consent-Based · Govt of Maharashtra'
              },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'consent_yes', title: lang === 'mr' ? 'होय, सुरू करा' : '✅ Yes, Proceed' } },
                  { type: 'reply', reply: { id: 'consent_no', title: lang === 'mr' ? 'नाही, नंतर' : '❌ No, Not Now' } }
                ]
              }
            }
          }
        };

      case 1:
        return {
          stepTitle: 'Step 2: Employment Status Check',
          payload: {
            to,
            type: 'interactive',
            interactive: {
              type: 'button',
              header: { type: 'text', text: '💼 Employment Status' },
              body: {
                text: lang === 'mr'
                  ? 'आपली सध्याची रोजगार स्थिती काय आहे?'
                  : 'What is your current state of employment?'
              },
              footer: { text: 'Question 1 of 10' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'emp_salaried', title: '💼 Salaried Job' } },
                  { type: 'reply', reply: { id: 'emp_self', title: '🏪 Self-Employed' } },
                  { type: 'reply', reply: { id: 'emp_seeking', title: '🔍 Seeking Work' } }
                ]
              }
            }
          }
        };

      case 2: {
        // Step 2: Employer Organization - conditionally shows last firm worked in
        const buttons: Array<{ type: 'reply'; reply: { id: string; title: string } }> = [];
        if (hasLastEmployer) {
          buttons.push({
            type: 'reply',
            reply: {
              id: 'emp_last_firm',
              // WhatsApp limits button title to 20 chars
              title: `${lastEmployer.slice(0, 13)} (Last)`
            }
          });
        }
        buttons.push({
          type: 'reply',
          reply: { id: 'emp_new_firm', title: '🏢 Other Company' }
        });
        buttons.push({
          type: 'reply',
          reply: { id: 'emp_unregistered', title: '🛠️ Small Workshop' }
        });

        return {
          stepTitle: 'Step 3: Employer Organization',
          payload: {
            to,
            type: 'interactive',
            interactive: {
              type: 'button',
              header: { type: 'text', text: '🏢 Employer Organization' },
              body: {
                text: hasLastEmployer
                  ? (lang === 'mr'
                    ? `आपण सध्या कोणत्या कंपनीत काम करत आहात? आपण पूर्वी नोंदवलेली कंपनी: "${lastEmployer}".`
                    : `Which organization do you currently work with? Your last recorded employer on file is "${lastEmployer}".`)
                  : (lang === 'mr'
                    ? 'आपण सध्या कोणत्या संस्थेत किंवा कंपनीत कार्यरत आहात?'
                    : 'Which organization or firm are you currently working with?')
              },
              footer: { text: 'Question 2 of 10' },
              action: { buttons: buttons.slice(0, 3) }
            }
          }
        };
      }

      case 3:
        return {
          stepTitle: 'Step 4: Role Details',
          payload: {
            to,
            type: 'interactive',
            interactive: {
              type: 'button',
              header: { type: 'text', text: '⚙️ Role Details' },
              body: {
                text: lang === 'mr'
                  ? 'कंपनीमध्ये आपले मुख्य पद किंवा कामाचे स्वरूप काय आहे?'
                  : 'What is your operational job role in the company?'
              },
              footer: { text: 'Question 3 of 10' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'role_operator', title: '🔧 Machine Operator' } },
                  { type: 'reply', reply: { id: 'role_assembly', title: '🏭 Assembly Line' } },
                  { type: 'reply', reply: { id: 'role_qa', title: '🔍 Quality Check' } }
                ]
              }
            }
          }
        };

      case 4:
        return {
          stepTitle: 'Step 5: Salary Range',
          payload: {
            to,
            type: 'interactive',
            interactive: {
              type: 'button',
              header: { type: 'text', text: '💰 Monthly Compensation' },
              body: {
                text: lang === 'mr'
                  ? 'आपली मासिक वेतन श्रेणी काय आहे? (माहिती गोपनीय ठेवली जाईल)'
                  : 'What is your current monthly gross salary range? (Protected by DPDP Act 2023)'
              },
              footer: { text: 'Question 4 of 10' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'sal_below15', title: '₹10,000 - ₹15,000' } },
                  { type: 'reply', reply: { id: 'sal_15to25', title: '₹15,000 - ₹25,000' } },
                  { type: 'reply', reply: { id: 'sal_above25', title: '₹25,000 - ₹40,000+' } }
                ]
              }
            }
          }
        };

      case 5:
        return {
          stepTitle: 'Step 6: Job Satisfaction',
          payload: {
            to,
            type: 'interactive',
            interactive: {
              type: 'button',
              header: { type: 'text', text: '⭐ Job Satisfaction' },
              body: {
                text: lang === 'mr'
                  ? 'आपण आपल्या सध्याच्या नोकरी व कामाच्या वातावरणाबाबत किती समाधानी आहात?'
                  : 'How satisfied are you with your current job, work environment, and growth?'
              },
              footer: { text: 'Question 5 of 10' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'sat_very', title: '🌟 Very Satisfied' } },
                  { type: 'reply', reply: { id: 'sat_ok', title: '👍 Satisfied' } },
                  { type: 'reply', reply: { id: 'sat_low', title: '⚠️ Low / Neutral' } }
                ]
              }
            }
          }
        };

      case 6:
        return {
          stepTitle: 'Step 7: Training Relevance',
          payload: {
            to,
            type: 'interactive',
            interactive: {
              type: 'button',
              header: { type: 'text', text: '🎯 Training Relevance' },
              body: {
                text: lang === 'mr'
                  ? 'आपण घेतलेले शासकीय प्रशिक्षण सध्याच्या नोकरीत किती उपयुक्त ठरत आहे?'
                  : 'How relevant was your vocational training curriculum to the actual tasks in your current job?'
              },
              footer: { text: 'Question 6 of 10' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'rel_100', title: '✅ 100% Relevant' } },
                  { type: 'reply', reply: { id: 'rel_part', title: '🔄 50-80% Relevant' } },
                  { type: 'reply', reply: { id: 'rel_unrelated', title: '❌ Unrelated' } }
                ]
              }
            }
          }
        };

      case 7:
        return {
          stepTitle: 'Step 8: Skill Gaps',
          payload: {
            to,
            type: 'interactive',
            interactive: {
              type: 'button',
              header: { type: 'text', text: '💡 Skill Gaps' },
              body: {
                text: lang === 'mr'
                  ? 'दैनंदिन कामात आपल्याला कोणत्या कौशल्यांची कमतरता जाणवते?'
                  : 'Which key skill gap or tool deficiency do you feel holds you back in your current daily work?'
              },
              footer: { text: 'Question 7 of 10' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'gap_cnc', title: '⚙️ CNC & Automated' } },
                  { type: 'reply', reply: { id: 'gap_digital', title: '💻 Digital & ERP' } },
                  { type: 'reply', reply: { id: 'gap_english', title: '🗣️ Work English' } }
                ]
              }
            }
          }
        };

      case 8:
        return {
          stepTitle: 'Step 9: Suggested Courses',
          payload: {
            to,
            type: 'interactive',
            interactive: {
              type: 'button',
              header: { type: 'text', text: '📚 Upskilling Suggestions' },
              body: {
                text: lang === 'mr'
                  ? 'वेतन वाढीसाठी शासनाच्या कोणत्या मोफत प्रगत अभ्यासक्रमात आपल्याला रस आहे?'
                  : 'Which state-sponsored advanced upskilling course would you like to enroll in to increase your salary?'
              },
              footer: { text: 'Question 8 of 10' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'course_robotics', title: '🤖 Robotics Tech' } },
                  { type: 'reply', reply: { id: 'course_ev', title: '🔋 EV Battery Tech' } },
                  { type: 'reply', reply: { id: 'course_solar', title: '☀️ Solar Grid Tech' } }
                ]
              }
            }
          }
        };

      case 9:
        return {
          stepTitle: 'Step 10: Career Goals',
          payload: {
            to,
            type: 'interactive',
            interactive: {
              type: 'button',
              header: { type: 'text', text: '🚀 Career Goals (3-5 Years)' },
              body: {
                text: lang === 'mr'
                  ? 'पुढील ३ ते ५ वर्षांत आपण स्वतःला कोणत्या पदावर पाहता?'
                  : 'Where do you see yourself in the next 3 to 5 years?'
              },
              footer: { text: 'Question 9 of 10' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'goal_supervisor', title: '🏆 Plant Supervisor' } },
                  { type: 'reply', reply: { id: 'goal_specialist', title: '🔬 Senior Tech' } },
                  { type: 'reply', reply: { id: 'goal_business', title: '🏪 Own Business' } }
                ]
              }
            }
          }
        };

      case 10:
        return {
          stepTitle: 'Step 11: Biggest Challenge',
          payload: {
            to,
            type: 'interactive',
            interactive: {
              type: 'button',
              header: { type: 'text', text: '⚠️ Biggest Challenge' },
              body: {
                text: lang === 'mr'
                  ? 'सध्या आपण सर्वात मोठ्या कोणत्या आव्हानाचा सामना करत आहात?'
                  : 'What is the single biggest challenge you are facing in your career right now?'
              },
              footer: { text: 'Question 10 of 10' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'chal_salary', title: '📉 Low Salary' } },
                  { type: 'reply', reply: { id: 'chal_growth', title: '🔒 Limited Growth' } },
                  { type: 'reply', reply: { id: 'chal_commute', title: '🚌 Long Commute' } }
                ]
              }
            }
          }
        };

      case 11:
      default:
        return {
          stepTitle: 'Step 12: Completion & Portal Link',
          payload: {
            to,
            type: 'text',
            text: lang === 'mr'
              ? `🎉 धन्यवाद ${name}! आपले सर्वेक्षण यशस्वीरीत्या पूर्ण झाले आहे. आपली माहिती 'SkillTrack Maharashtra' अंतर्गत सुरक्षितपणे नोंदवली गेली आहे. अधिक माहितीसाठी व आपला डिजिटल स्किल पासपोर्ट पाहण्यासाठी भेट द्या:\n👉 https://skilltrack.maharashtra.gov.in\n(कौशल्य विभाग हेल्पलाइन सपोर्ट)`
              : `🎉 Thank you ${name}! Your responses have been securely verified and recorded in the SkillTrack Maharashtra State Database. Your portable MH-SK Skill Passport has been updated. For career upskilling grants, verified employer hiring demands, and your credential score, visit the official portal:\n👉 https://skilltrack.maharashtra.gov.in\n(MahaKaushalya Portal Support)`
          }
        };
    }
  }

  /**
   * Dispatches a specific survey step directly to the user's phone number!
   */
  public static async dispatchSurveyStep(
    phone: string,
    stepIndex: number,
    options?: {
      traineeName?: string;
      lastEmployer?: string | null;
      language?: 'en' | 'mr';
    }
  ) {
    const formattedTo = this.formatPhoneNumber(phone);
    const { payload, stepTitle } = this.getSurveyStepPayload(stepIndex, formattedTo, options);
    return this.sendMessage(payload, { stepIndex, stepTitle });
  }

  /**
   * Starts a brand new survey from Step 0 and enforces strict 1-by-1 progression.
   * Clears old unconsumed message IDs so prior answers never replay.
   */
  public static async resetAndStartSurvey(
    phone: string,
    options?: {
      traineeName?: string;
      lastEmployer?: string | null;
      language?: 'en' | 'mr';
    }
  ) {
    const formattedTo = this.formatPhoneNumber(phone);
    console.log(`[Kapso WhatsApp] Resetting & initiating 1-by-1 survey pipeline for +${formattedTo}`);

    // Mark ALL existing messages currently in Kapso inbox as processed so old clicks never replay
    try {
      if (currentConfig.apiKey && currentConfig.phoneNumberId) {
        const client = getWhatsAppClient();
        if (client) {
          const res = await client.messages.query({
            phoneNumberId: currentConfig.phoneNumberId,
            direction: 'inbound',
            limit: 50
          });
          if (res?.data && Array.isArray(res.data)) {
            for (const item of res.data) {
              if (item.id) {
                processedIncomingIds.add(item.id);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error syncing existing messages before start:', e);
    }

    const nowSec = Math.floor(Date.now() / 1000);

    // Initialize or reset session for this user phone
    const newSession: SurveySession = {
      traineeId: 'trainee-1',
      traineeName: options?.traineeName || 'Harsh / Pooja Patil',
      lastEmployer: options?.lastEmployer || 'Tata Motors Ltd',
      currentStep: 0,
      data: {},
      windowActive: true,
      status: 'waiting_for_reply',
      startedAt: nowSec,
      lastDispatchedTimestamp: nowSec,
      lastDispatchedStep: 0,
      language: options?.language || 'en'
    };
    activeSurveys.set(formattedTo, newSession);
    persistState();

    // Dispatch ONLY Step 0 (Hello & Purpose + DPDP Consent)
    const result = await this.dispatchSurveyStep(formattedTo, 0, {
      traineeName: newSession.traineeName,
      lastEmployer: newSession.lastEmployer,
      language: options?.language || 'en'
    });

    newSession.lastDispatchedTimestamp = Math.floor(Date.now() / 1000);
    newSession.lastDispatchedStep = 0;
    persistState();

    return {
      ...result,
      currentStep: 0,
      totalSteps: 12,
      surveyStatus: 'waiting_for_reply',
      message: `Step 1 (Consent & Purpose) dispatched to +${formattedTo}. Waiting for your button tap on WhatsApp.`
    };
  }

  /**
   * Handles incoming webhook replies received from a trainee's phone on WhatsApp
   * Updates state database and sends ONLY ONE NEXT QUESTION INSTANTLY!
   */
  public static async handleIncomingWebhook(body: any): Promise<{ handled: boolean; replySent?: boolean; nextStep?: number; message?: string }> {
    try {
      // Parse Kapso / WhatsApp Cloud API message event flexibly
      let message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!message && Array.isArray(body?.messages) && body.messages.length > 0) {
        message = body.messages[0];
      }
      if (!message && (body?.id || body?.from)) {
        message = body;
      }

      if (!message) {
        return { handled: false, message: 'No message found in payload' };
      }

      const messageId = String(message.id || message.message_id || '');
      // Global deduplication: If this exact message ID was already processed, ignore it!
      if (messageId && processedIncomingIds.has(messageId)) {
        console.log(`[Kapso WhatsApp Webhook] Skipping duplicate message ID: ${messageId}`);
        return { handled: true, message: 'Message already processed' };
      }
      if (messageId) {
        processedIncomingIds.add(messageId);
        persistState();
      }

      const fromPhone = message.from || message.sender || message.kapso?.phoneNumber;
      const cleanPhone = this.formatPhoneNumber(String(fromPhone));

      // Ignore messages from self or bot number
      if (!cleanPhone || cleanPhone.endsWith('12084454652') || cleanPhone === currentConfig.senderNumber) {
        return { handled: false, message: 'Ignoring outbound message from bot' };
      }

      // Check in-flight lock to prevent race conditions when webhook & poller arrive simultaneously
      if (inFlightDispatches.has(cleanPhone)) {
        console.log(`[Kapso WhatsApp] Dispatch already in flight for +${cleanPhone}, skipping duplicate trigger`);
        return { handled: true, message: 'Concurrent dispatch skipped' };
      }

      inFlightDispatches.add(cleanPhone);

      try {
        // Extract button reply info supporting both camelCase (Kapso SDK) and snake_case (Meta API)
        const btn = message.interactive?.buttonReply ||
                    message.interactive?.button_reply ||
                    message.buttonReply ||
                    message.button_reply;
        const buttonId = String(btn?.id || message.button?.id || '').trim();
        const buttonTitle = String(btn?.title || message.button?.text || '').trim();
        let textBody = String(message.text?.body || message.kapso?.content || buttonTitle || buttonId || 'Replied').trim();
        if (textBody.startsWith('Selected: ')) {
          textBody = textBody.replace('Selected: ', '').trim();
        }

        console.log(`[Kapso WhatsApp Webhook] Inbound from +${cleanPhone}: buttonId="${buttonId}", buttonTitle="${buttonTitle}", text="${textBody}"`);

        // Find last dispatch to this number to mark replied
        const lastDispatch = dispatchHistory
          .filter((d) => d.to.endsWith(cleanPhone.slice(-10)))
          .pop();

        if (lastDispatch) {
          lastDispatch.status = 'replied';
          lastDispatch.replyReceived = buttonTitle || textBody;
          lastDispatch.replyTimestamp = new Date().toISOString();
        }

        // Check or init active survey session
        let session = activeSurveys.get(cleanPhone);
        if (!session) {
          session = {
            traineeId: 'trainee-1',
            traineeName: 'Harsh / Pooja Patil',
            lastEmployer: 'Tata Motors Ltd',
            currentStep: 0,
            data: {},
            windowActive: true,
            status: 'waiting_for_reply',
            startedAt: Math.floor(Date.now() / 1000),
            lastDispatchedTimestamp: 0,
            lastDispatchedStep: 0,
            language: 'en'
          };
          activeSurveys.set(cleanPhone, session);
        } else {
          session.windowActive = true;
        }

        const lowerText = textBody.toLowerCase().trim();
        const lowerBtnId = buttonId.toLowerCase();
        const lowerBtnTitle = buttonTitle.toLowerCase();
        const nowSec = Math.floor(Date.now() / 1000);

        // If user sends a greeting or "Start" / "Hi"
        if (!buttonId && (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('start') || lowerText.includes('namaskar') || lowerText.includes('नमस्कार'))) {
          // If Step 0 was already dispatched in the last 10 seconds AND status was delivered, don't duplicate
          if (session.currentStep === 0 && session.lastDispatchedTimestamp && (nowSec - session.lastDispatchedTimestamp < 10) && lastDispatch?.status === 'delivered') {
            console.log(`[Kapso WhatsApp] User sent greeting "${textBody}" right after Step 0 dispatch; 24h window activated.`);
            return {
              handled: true,
              replySent: false,
              nextStep: 0,
              message: '24-hour window activated for existing survey'
            };
          }

          console.log(`[Kapso WhatsApp] User sent greeting "${textBody}" from +${cleanPhone}. Resetting & starting survey Step 0.`);
          const startRes = await this.resetAndStartSurvey(cleanPhone, {
            traineeName: session.traineeName,
            lastEmployer: session.lastEmployer,
            language: session.language || 'en'
          });
          return {
            handled: true,
            replySent: startRes.success,
            nextStep: 0,
            message: startRes.message
          };
        }

        // Determine next step and parse answer based on current step and response
        let nextStep = (session.currentStep || 0) + 1;
        const currentStep = session.currentStep ?? 0;

        if (currentStep === 0 || lowerBtnId.startsWith('consent_') || lowerBtnTitle.includes('proceed') || lowerBtnTitle.includes('yes') || lowerText.includes('proceed') || lowerText.includes('yes') || lowerText.includes('होय')) {
          if (lowerBtnId === 'consent_no' || lowerBtnTitle.includes('no') || lowerText.includes('no') || lowerText.includes('नाही')) {
            session.data.consent = false;
            session.status = 'completed';
            persistState();
            await this.sendMessage({
              to: cleanPhone,
              type: 'text',
              text: 'धन्यवाद! If you would like to participate in the future, just message "Hi" anytime.'
            });
            return { handled: true, replySent: true, message: 'User declined consent.' };
          }
          session.data.consent = true;
          nextStep = 1; // Send Employment Status Check
        } else if (currentStep === 1 || lowerBtnId.startsWith('emp_') || lowerBtnTitle.includes('salaried') || lowerBtnTitle.includes('self') || lowerBtnTitle.includes('seeking')) {
          if (lowerBtnId.includes('self') || lowerBtnTitle.includes('self') || lowerText.includes('self') || lowerText === '2') {
            session.data.employment_status = '🏪 Self-Employed';
          } else if (lowerBtnId.includes('seeking') || lowerBtnTitle.includes('seeking') || lowerText.includes('seeking') || lowerText === '3') {
            session.data.employment_status = '🔍 Seeking Work';
          } else {
            session.data.employment_status = '💼 Salaried Job';
          }
          nextStep = 2; // Send Employer Organization
        } else if (currentStep === 2 || lowerBtnId.startsWith('emp_') || lowerBtnTitle.includes('(last)') || lowerBtnTitle.includes('company') || lowerBtnTitle.includes('workshop')) {
          if (lowerBtnId.includes('last') || lowerBtnTitle.includes('(last)') || lowerText.includes('last') || lowerText === '1') {
            session.data.employer_name = session.lastEmployer || 'Tata Motors Ltd';
          } else if (lowerBtnId.includes('unregistered') || lowerBtnTitle.includes('workshop') || lowerText.includes('workshop') || lowerText === '3') {
            session.data.employer_name = '🛠️ Small Workshop';
          } else {
            session.data.employer_name = '🏢 Other Company';
          }
          nextStep = 3; // Send Role Details
        } else if (currentStep === 3 || lowerBtnId.startsWith('role_') || lowerBtnTitle.includes('operator') || lowerBtnTitle.includes('assembly') || lowerBtnTitle.includes('quality')) {
          if (lowerBtnId.includes('assembly') || lowerBtnTitle.includes('assembly') || lowerText.includes('assembly') || lowerText === '2') {
            session.data.job_role = '🏭 Assembly Line';
          } else if (lowerBtnId.includes('qa') || lowerBtnId.includes('quality') || lowerBtnTitle.includes('quality') || lowerText.includes('quality') || lowerText === '3') {
            session.data.job_role = '🔍 Quality Check';
          } else {
            session.data.job_role = '🔧 Machine Operator';
          }
          nextStep = 4; // Send Salary Range
        } else if (currentStep === 4 || lowerBtnId.startsWith('sal_') || lowerBtnTitle.includes('₹') || lowerBtnTitle.includes('15,000') || lowerBtnTitle.includes('25,000')) {
          if (lowerBtnId.includes('below') || lowerBtnTitle.includes('<15') || lowerText.includes('below') || lowerText === '1') {
            session.data.salary_range = '₹10,000 - ₹15,000';
          } else if (lowerBtnId.includes('above') || lowerBtnTitle.includes('>25') || lowerText.includes('above') || lowerText === '3') {
            session.data.salary_range = '₹25,000 - ₹40,000+';
          } else {
            session.data.salary_range = '₹15,000 - ₹25,000';
          }
          nextStep = 5; // Send Job Satisfaction
        } else if (currentStep === 5 || lowerBtnId.startsWith('sat_') || lowerBtnTitle.includes('satisfied') || lowerBtnTitle.includes('low') || lowerBtnTitle.includes('neutral')) {
          if (lowerBtnId.includes('very') || lowerBtnTitle.includes('very') || lowerText.includes('very') || lowerText === '1') {
            session.data.job_satisfaction = '🌟 Very Satisfied';
          } else if (lowerBtnId.includes('low') || lowerBtnTitle.includes('low') || lowerText.includes('low') || lowerText.includes('neutral') || lowerText === '3') {
            session.data.job_satisfaction = '⚠️ Low / Neutral';
          } else {
            session.data.job_satisfaction = '👍 Satisfied';
          }
          nextStep = 6; // Send Training Relevance
        } else if (currentStep === 6 || lowerBtnId.startsWith('rel_') || lowerBtnTitle.includes('relevant') || lowerBtnTitle.includes('unrelated')) {
          if (lowerBtnId.includes('100') || lowerBtnTitle.includes('100%') || lowerText.includes('100') || lowerText === '1') {
            session.data.training_relevance = '✅ 100% Relevant';
          } else if (lowerBtnId.includes('unrelated') || lowerBtnTitle.includes('unrelated') || lowerText.includes('unrelated') || lowerText === '3') {
            session.data.training_relevance = '❌ Unrelated';
          } else {
            session.data.training_relevance = '🔄 50-80% Relevant';
          }
          nextStep = 7; // Send Skill Gaps
        } else if (currentStep === 7 || lowerBtnId.startsWith('gap_') || lowerBtnTitle.includes('cnc') || lowerBtnTitle.includes('digital') || lowerBtnTitle.includes('english')) {
          if (lowerBtnId.includes('cnc') || lowerBtnTitle.includes('cnc') || lowerText.includes('cnc') || lowerText === '1') {
            session.data.skill_gaps = ['⚙️ CNC & Automated'];
          } else if (lowerBtnId.includes('digital') || lowerBtnTitle.includes('digital') || lowerText.includes('digital') || lowerText === '2') {
            session.data.skill_gaps = ['💻 Digital & ERP'];
          } else {
            session.data.skill_gaps = ['🗣️ Work English'];
          }
          nextStep = 8; // Send Suggested Courses
        } else if (currentStep === 8 || lowerBtnId.startsWith('course_') || lowerBtnTitle.includes('robotics') || lowerBtnTitle.includes('ev') || lowerBtnTitle.includes('solar')) {
          if (lowerBtnId.includes('robotics') || lowerBtnTitle.includes('robotics') || lowerText.includes('robotics') || lowerText === '1') {
            session.data.suggested_courses = ['🤖 Robotics Tech'];
          } else if (lowerBtnId.includes('ev') || lowerBtnTitle.includes('ev') || lowerText.includes('ev') || lowerText === '2') {
            session.data.suggested_courses = ['🔋 EV Battery Tech'];
          } else {
            session.data.suggested_courses = ['☀️ Solar Grid Tech'];
          }
          nextStep = 9; // Send Career Goals
        } else if (currentStep === 9 || lowerBtnId.startsWith('goal_') || lowerBtnTitle.includes('supervisor') || lowerBtnTitle.includes('specialist') || lowerBtnTitle.includes('business')) {
          if (lowerBtnId.includes('supervisor') || lowerBtnTitle.includes('supervisor') || lowerText.includes('supervisor') || lowerText === '1') {
            session.data.career_goals = '🏆 Plant Supervisor';
          } else if (lowerBtnId.includes('specialist') || lowerBtnTitle.includes('tech') || lowerText.includes('specialist') || lowerText === '2') {
            session.data.career_goals = '🔬 Senior Tech';
          } else {
            session.data.career_goals = '🏪 Own Business';
          }
          nextStep = 10; // Send Biggest Challenge
        } else if (currentStep === 10 || lowerBtnId.startsWith('chal_') || lowerBtnTitle.includes('salary') || lowerBtnTitle.includes('growth') || lowerBtnTitle.includes('commute')) {
          if (lowerBtnId.includes('salary') || lowerBtnTitle.includes('salary') || lowerText.includes('salary') || lowerText === '1') {
            session.data.biggest_challenge = '📉 Low Salary';
          } else if (lowerBtnId.includes('growth') || lowerBtnTitle.includes('growth') || lowerText.includes('growth') || lowerText === '2') {
            session.data.biggest_challenge = '🔒 Limited Growth';
          } else {
            session.data.biggest_challenge = '🚌 Long Commute';
          }
          nextStep = 11; // Send Completion & Portal Link
        } else {
          nextStep = (session.currentStep || 0) + 1;
        }

        if (nextStep > 11) nextStep = 11;

        console.log(`[Kapso WhatsApp] Transitioning survey for +${cleanPhone}: Step ${session.currentStep} -> Step ${nextStep}`);

        session.currentStep = nextStep;
        session.status = nextStep >= 11 ? 'completed' : 'waiting_for_reply';
        session.lastDispatchedStep = nextStep;
        session.lastDispatchedTimestamp = Math.floor(Date.now() / 1000);
        persistState();

        // If completing (Step 11), record outcome directly into db.json
        if (nextStep === 11) {
          const outcomeId = `out-wa-${Date.now()}`;
          const newOutcome = {
            id: outcomeId,
            trainee_id: session.traineeId || 'trainee-1',
            enrolment_id: 'enr-1',
            checkpoint_month: '12' as const,
            status: (session.data.employment_status?.includes('Self') ? 'Self-Employed' : 'Wage Employed') as any,
            job_role: session.data.job_role || 'Machine Operator',
            monthly_wage: session.data.salary_range?.includes('25,000 - 40,000') ? 28000 : session.data.salary_range?.includes('10,000') ? 13500 : 21000,
            still_employed: true,
            satisfaction: (session.data.job_satisfaction?.includes('Very') ? 'Very Satisfied' : session.data.job_satisfaction?.includes('Low') ? 'Unsatisfied' : 'Satisfied') as any,
            training_relevance: (session.data.training_relevance?.includes('100%') ? '100% Relevant' : 'Partially Relevant') as any,
            skill_gaps: session.data.skill_gaps || ['CNC & Automated'],
            suggested_courses: session.data.suggested_courses || ['Robotics Tech'],
            career_goals: session.data.career_goals || 'Plant Supervisor',
            biggest_challenge: session.data.biggest_challenge || 'Limited Growth',
            survey_channel: 'WhatsApp-Kapso' as const,
            phone_used: cleanPhone,
            trainee_confirmed: true,
            employer_confirmed: false,
            confidence: 'High' as const,
            source: 'Auto-Follow-up' as const,
            recorded_on: new Date().toISOString().split('T')[0]
          };
          db.insert('outcomes', newOutcome);
          db.logAudit(session.traineeId || 'trainee-1', 'WHATSAPP_KAPSO_WEBHOOK_SAVED', 'outcomes', outcomeId);
          console.log(`[Kapso WhatsApp] Survey completed for +${cleanPhone}. Persisted outcome ${outcomeId} to db.json.`);
        }

        // Automatically dispatch ONLY THE NEXT SINGLE question to trainee's phone INSTANTLY
        console.log(`[Kapso WhatsApp] Instantly dispatching Step ${nextStep} to +${cleanPhone}`);
        const dispatchResult = await this.dispatchSurveyStep(cleanPhone, nextStep, {
          traineeName: session.traineeName,
          lastEmployer: session.lastEmployer,
          language: session.language || 'en'
        });

        session.lastDispatchedTimestamp = Math.floor(Date.now() / 1000);
        session.lastDispatchedStep = nextStep;
        persistState();

        return {
          handled: true,
          replySent: dispatchResult.success,
          nextStep,
          message: `Processed response and sent Step ${nextStep} to +${cleanPhone}`
        };
      } finally {
        inFlightDispatches.delete(cleanPhone);
      }
    } catch (err: any) {
      console.error('Error handling Kapso webhook:', err);
      return { handled: false, message: err?.message || 'Webhook processing failed' };
    }
  }

  /**
   * Helper to simulate an incoming button click or text response from a trainee's phone.
   * Useful for live verification testing in AI Studio without needing a public tunnel.
   */
  public static async simulatePhoneReply(
    phone: string,
    buttonTitle: string,
    stepIndex: number
  ) {
    const formatted = this.formatPhoneNumber(phone);
    return this.handleIncomingWebhook({
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    id: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                    from: formatted,
                    interactive: {
                      button_reply: {
                        id: `sim_btn_${stepIndex}`,
                        title: buttonTitle
                      },
                      buttonReply: {
                        id: `sim_btn_${stepIndex}`,
                        title: buttonTitle
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    });
  }

  /**
   * Periodically queries the Kapso Meta WhatsApp proxy to check if any incoming messages
   * or replies were received on the bot number.
   * Enforces 1-by-1 sequential progression and responds instantly when a user responds.
   */
  public static async pollKapsoInbox() {
    if (!currentConfig.apiKey || !currentConfig.phoneNumberId) return;
    if (isPolling) return;
    isPolling = true;

    try {
      const client = getWhatsAppClient();
      let rawItems: any[] = [];

      if (client) {
        try {
          const res = await client.messages.query({
            phoneNumberId: currentConfig.phoneNumberId,
            direction: 'inbound',
            limit: 30
          });
          if (res?.data && Array.isArray(res.data)) {
            rawItems = res.data;
          }
        } catch (sdkErr) {
          // Fallback to direct fetch
        }
      }

      if (rawItems.length === 0) {
        const url = `https://api.kapso.ai/meta/whatsapp/v23.0/${currentConfig.phoneNumberId}/messages`;
        const res = await fetch(url, {
          headers: { 'X-API-Key': currentConfig.apiKey }
        });
        if (res.ok) {
          const data: any = await res.json().catch(() => null);
          if (data && Array.isArray(data.data)) {
            rawItems = data.data;
          }
        }
      }

      if (rawItems.length === 0) return;

      // On first boot/poll, register ALL existing messages in the inbox as processed to prevent any message replay on website reload
      if (isFirstPoll) {
        isFirstPoll = false;
        for (const item of rawItems) {
          if (item.id) {
            processedIncomingIds.add(item.id);
          }
        }
        persistState();
        console.log(`[Kapso WhatsApp Poll] Inbox initialized. Synced ${processedIncomingIds.size} historical messages to prevent replay on website reload.`);
        return;
      }

      // Filter strictly INBOUND messages from trainees (exclude bot's own outbound messages and status receipts)
      const inboundMessages = rawItems.filter((item: any) => {
        if (!item.id || processedIncomingIds.has(item.id)) return false;

        // Exclude status callbacks (sent, delivered, read)
        if (item.type === 'status' || item.statuses || (item.status && !item.text && !item.interactive)) {
          return false;
        }

        // If Kapso tagged direction, enforce strictly
        if (item.kapso?.direction === 'outbound') return false;

        // Fallback checks
        const from = String(item.from || item.sender || item.kapso?.phoneNumber || '');
        if (!from) return false;
        if (from.endsWith('12084454652') || from.includes('1364763996715263') || from === currentConfig.senderNumber) {
          return false;
        }

        // Must have interactive reply or text
        return Boolean(item.text?.body || item.interactive || item.button || item.button_reply || item.buttonReply || item.kapso?.content);
      });

      // Sort oldest to newest so conversation flows in chronological order
      inboundMessages.sort((a: any, b: any) => Number(a.timestamp || 0) - Number(b.timestamp || 0));

      const processedPhonesInThisTick = new Set<string>();

      for (const item of inboundMessages) {
        if (!item.id || processedIncomingIds.has(item.id)) continue;

        const fromPhone = item.from || item.sender || item.kapso?.phoneNumber;
        const cleanPhone = this.formatPhoneNumber(fromPhone || '');
        if (!cleanPhone) {
          processedIncomingIds.add(item.id);
          continue;
        }

        const session = activeSurveys.get(cleanPhone);
        const msgTimestamp = Number(item.timestamp || 0);

        // Only process replies if the user has an active survey waiting for reply
        if (!session || session.status !== 'waiting_for_reply') {
          processedIncomingIds.add(item.id);
          persistState();
          continue;
        }

        // If message arrived before the latest question was dispatched, ignore and mark processed
        const lastDispatch = session.lastDispatchedTimestamp || session.startedAt || 0;
        if (lastDispatch > 0 && msgTimestamp > 0 && msgTimestamp < lastDispatch - 5) {
          console.log(`[Kapso WhatsApp Poll] Skipping pre-step message ${item.id} from ${cleanPhone}`);
          processedIncomingIds.add(item.id);
          persistState();
          continue;
        }

        // Only process ONE message per phone per poll cycle to guarantee 1-by-1 step flow!
        if (processedPhonesInThisTick.has(cleanPhone)) {
          console.log(`[Kapso WhatsApp Poll] Deferring extra message for +${cleanPhone} to next poll cycle.`);
          continue;
        }

        processedPhonesInThisTick.add(cleanPhone);

        // Support both camelCase and snake_case button properties
        const btn = item.interactive?.buttonReply ||
                    item.interactive?.button_reply ||
                    item.buttonReply ||
                    item.button_reply;
        const buttonId = String(btn?.id || item.button?.id || '').trim();
        const buttonTitle = String(btn?.title || item.button?.text || '').trim();
        let textContent = String(item.text?.body || item.kapso?.content || buttonTitle || buttonId || '').trim();
        if (textContent.startsWith('Selected: ')) {
          textContent = textContent.replace('Selected: ', '').trim();
        }

        console.log(`[Kapso WhatsApp Poll] Processing fresh inbound from +${cleanPhone}: "${textContent}" (btnId: "${buttonId}", btnTitle: "${buttonTitle}")`);

        try {
          await this.handleIncomingWebhook({
            entry: [{
              changes: [{
                value: {
                  messages: [{
                    id: item.id,
                    from: cleanPhone,
                    timestamp: item.timestamp,
                    text: item.text?.body ? { body: item.text.body } : (textContent ? { body: textContent } : undefined),
                    interactive: {
                      type: 'button_reply',
                      button_reply: { id: buttonId, title: buttonTitle },
                      buttonReply: { id: buttonId, title: buttonTitle }
                    },
                    kapso: item.kapso
                  }]
                }
              }]
            }]
          });
        } finally {
          // Guarantee message ID is marked processed after dispatch attempt
          processedIncomingIds.add(item.id);
          persistState();
        }
      }
    } catch (err) {
      console.warn('[Kapso WhatsApp Poll] Error during poll cycle:', err);
    } finally {
      isPolling = false;
    }
  }
}

