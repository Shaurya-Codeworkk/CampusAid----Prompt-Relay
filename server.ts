import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Types defined locally for server state
export interface PollVotes {
  needsImmediateHelp: number;
  helpBeingProvided: number;
  situationUnclear: number;
  userVotes: Record<string, string>;
}

export interface AiTriageResult {
  incidentType: string;
  urgency: "LOW" | "MODERATE" | "HIGH" | "URGENT";
  severityScore: number;
  whatWeObserve: string;
  immediateSteps: string[];
  thingsToAvoid: string[];
  warningSigns: string[];
  recommendedHumanHelp: string[];
  responderBrief: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
}

export interface Incident {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  type: string;
  location: string;
  note?: string;
  timestamp: string;
  status: "ACTIVE" | "RESPONDING" | "HELP PROVIDED" | "RESOLVED";
  responders: string[];
  firstResponder?: string;
  poll: PollVotes;
  aiTriage?: AiTriageResult;
  hasImage?: boolean;
  imageUrl?: string;
}

// In-memory incidents database initialized with realistic sample data
let incidents: Incident[] = [
  {
    id: "INC-8492",
    studentId: "STU-003",
    studentName: "Ananya Rao",
    studentAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjNdfpIs-UL--bSmOcibhSQA28HtrBr_aBb4WtcU-mJa-u5p9VoRVbwg523_a3qY8dConhE-MPImYXZ6GkwWoF3LOBIezAerYuTcwZdQkNwnJgAYKBht3BYSM5g9WbyOhFbNuYVI7SV_P34USzp-rffVVSdqdDcDM0_WMWzRKmW-NHW-TTp79lWW_noCh7a76lPmJnp7Plee7rJa5SyCmAUO6q7vkj-7a4cehAq4WiTA9198TcJ1YV",
    type: "Suspicious Activity",
    location: "North Parking Lot, Section B",
    note: "Unattended bag near electrical closet",
    timestamp: "10 mins ago",
    status: "RESOLVED",
    responders: ["Officer Singh", "Dr. Mehta"],
    firstResponder: "Officer Singh",
    poll: {
      needsImmediateHelp: 1,
      helpBeingProvided: 3,
      situationUnclear: 1,
      userVotes: {}
    },
    aiTriage: {
      incidentType: "Suspicious Activity / Security Hazard",
      urgency: "MODERATE",
      severityScore: 5,
      whatWeObserve: "Unattended object in sensitive campus parking sector near utility infrastructure.",
      immediateSteps: [
        "Maintain a safe distance of at least 50 feet.",
        "Do not touch or move the unattended item.",
        "Direct nearby pedestrians away from the zone."
      ],
      thingsToAvoid: ["Opening or disturbing the bag", "Using radio equipment near the object"],
      warningSigns: ["Pungent odors", "Exposed wires or ticking sounds"],
      recommendedHumanHelp: ["Campus Security Patrol", "Facility Supervisor"],
      responderBrief: "Security incident reported at North Parking Lot. Officer Singh on scene inspecting section B.",
      confidence: "HIGH"
    }
  },
  {
    id: "INC-8491",
    studentId: "STU-004",
    studentName: "Karan Patel",
    studentAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMxSZdh2EaZvHRzYrwuiGZLZeJmICYFUF7hOa9Skn7dyCYFVNOKVtJwnTKC3p5FnuQBd38Yl-iaWMpTxD5lRDEHhY7GMlBmPsyvMs2euxSpTAMzFWYNZXLF6L3Ypf8J_LDNhThYhphmalKhVv0gkinoM5a_jgdF4EQuR-GgrHljp90TjV9f4VQL1PIQJh_AabWwV_PlTN6Ezzl6AtR3Lm3Mv-BuKGbnp5OXFdjOGc4thoUmy-4E7mf",
    type: "Fire Alarm / Burn",
    location: "Science Building, 3rd Floor Chem Lab",
    note: "Minor flash burn on forearm during lab experiment",
    timestamp: "22 mins ago",
    status: "RESOLVED",
    responders: [],
    poll: {
      needsImmediateHelp: 3,
      helpBeingProvided: 1,
      situationUnclear: 0,
      userVotes: {}
    },
    aiTriage: {
      incidentType: "Thermal Injury / Chemical Flash",
      urgency: "HIGH",
      severityScore: 7,
      whatWeObserve: "Reported superficial skin burn following lab reaction. Smoke detectors activated on floor 3.",
      immediateSteps: [
        "Cool burn under lukewarm running water for 10-15 minutes.",
        "Evacuate chemical lab area immediately.",
        "Remove constricting jewelry or outerwear before swelling occurs."
      ],
      thingsToAvoid: ["Applying ice directly to burn", "Popping any blisters", "Applying butter or greasy ointments"],
      warningSigns: ["Difficulty breathing from smoke inhalation", "Charred or white skin appearance"],
      recommendedHumanHelp: ["Campus First Aid Team", "City Emergency Paramedics"],
      responderBrief: "Flash burn reported at Science Bldg 3rd floor. Student conscious; requires burn dressing.",
      confidence: "HIGH"
    }
  },
  {
    id: "INC-8490",
    studentId: "STU-005",
    studentName: "Priya Sharma",
    studentAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjNdfpIs-UL--bSmOcibhSQA28HtrBr_aBb4WtcU-mJa-u5p9VoRVbwg523_a3qY8dConhE-MPImYXZ6GkwWoF3LOBIezAerYuTcwZdQkNwnJgAYKBht3BYSM5g9WbyOhFbNuYVI7SV_P34USzp-rffVVSdqdDcDM0_WMWzRKmW-NHW-TTp79lWW_noCh7a76lPmJnp7Plee7rJa5SyCmAUO6q7vkj-7a4cehAq4WiTA9198TcJ1YV",
    type: "Other Safety Emergency",
    location: "Dormitory C, Room 204",
    note: "Water leak near power strip",
    timestamp: "1 hour ago",
    status: "RESOLVED",
    responders: ["Dr. Mehta", "Resident Advisor Alex"],
    firstResponder: "Dr. Mehta",
    poll: {
      needsImmediateHelp: 0,
      helpBeingProvided: 4,
      situationUnclear: 0,
      userVotes: {}
    },
    aiTriage: {
      incidentType: "Electrical & Water Hazard",
      urgency: "LOW",
      severityScore: 3,
      whatWeObserve: "Water puddle approaching wall outlets in student residence room.",
      immediateSteps: [
        "Do not step in standing water near energized electronics.",
        "Locate main breaker if safely accessible."
      ],
      thingsToAvoid: ["Touching wet electrical cords with bare hands"],
      warningSigns: ["Sparks or buzzing sounds"],
      recommendedHumanHelp: ["Campus Maintenance"],
      responderBrief: "Power cut to Room 204. Leak repaired by campus facilities.",
      confidence: "HIGH"
    }
  }
];

// Server-Sent Events subscribers
let sseClients: Array<{ id: string; res: express.Response }> = [];

const broadcastState = (event: string, data: any) => {
  sseClients.forEach((client) => {
    client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  });
};

// Gemini Client initialization helper
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper function to call Gemini API with retries and fallback models
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: Parameters<typeof ai.models.generateContent>[0],
  maxRetries = 2
) {
  const primaryModel = params.model || "gemini-3.7-flash";
  const modelsToTry = [
    primaryModel,
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.1-pro-preview",
  ];

  const uniqueModels = Array.from(new Set(modelsToTry));
  let lastError: any = null;

  for (const model of uniqueModels) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err);
        console.warn(
          `Gemini call with model ${model} (attempt ${attempt + 1}/${maxRetries + 1}) failed:`,
          errStr
        );

        const isTransient =
          err?.status === 503 ||
          err?.code === 503 ||
          err?.status === 429 ||
          err?.code === 429 ||
          errStr.includes("503") ||
          errStr.includes("UNAVAILABLE") ||
          errStr.includes("high demand") ||
          errStr.includes("fetch failed");

        if (isTransient && attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        } else {
          // Break to try next fallback model immediately
          break;
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content with Gemini models after retries");
}

// Fallback AI Triage Generator
function generateFallbackTriage(type: string, note?: string, location?: string): AiTriageResult {
  const typeLower = (type || "").toLowerCase();
  
  if (typeLower.includes("burn") || typeLower.includes("fire")) {
    return {
      incidentType: "Thermal / Fire Emergency",
      urgency: "HIGH",
      severityScore: 8,
      whatWeObserve: "Reported thermal or fire-related incident on campus. Potential skin burn or smoke presence.",
      immediateSteps: [
        "Cool burn under lukewarm running water for at least 10 minutes.",
        "Evacuate immediate area if smoke or open flame is present.",
        "Keep victim calm and comfortable until campus responders arrive."
      ],
      thingsToAvoid: [
        "Do NOT apply ice, butter, or greasy ointments to burns.",
        "Do NOT break or puncture blisters.",
        "Do NOT re-enter affected building."
      ],
      warningSigns: ["Shortness of breath or coughing", "Deep tissue numbness or charring"],
      recommendedHumanHelp: ["Campus Emergency Medical Responders", "Local Fire Department (911)"],
      responderBrief: `Fire/Burn alert reported at ${location || "Campus location"}. ${note ? `Details: ${note}` : "Immediate first aid kit and burn dressing required."}`,
      confidence: "HIGH"
    };
  }

  if (typeLower.includes("fall") || typeLower.includes("injury")) {
    return {
      incidentType: "Physical Trauma / Injury",
      urgency: "MODERATE",
      severityScore: 6,
      whatWeObserve: "Reported physical fall or blunt impact injury.",
      immediateSteps: [
        "Check for consciousness and steady breathing.",
        "Keep victim still to avoid spinal movement if neck pain is reported.",
        "Apply clean pressure to any visible bleeding."
      ],
      thingsToAvoid: [
        "Do NOT move the person if spinal trauma is suspected.",
        "Do NOT offer food or drink until evaluated by medical staff."
      ],
      warningSigns: ["Loss of consciousness", "Severe dizziness or nausea", "Inability to move limbs"],
      recommendedHumanHelp: ["Campus Health Services", "On-duty First Responder"],
      responderBrief: `Injury/Fall reported at ${location || "Campus area"}. ${note ? `Note: ${note}` : "Bring splint kit and cervical collar."}`,
      confidence: "HIGH"
    };
  }

  return {
    incidentType: type || "General Campus Emergency",
    urgency: "URGENT",
    severityScore: 9,
    whatWeObserve: "One-tap SOS emergency alert activated on campus.",
    immediateSteps: [
      "Stay in a safe location if possible.",
      "Keep phone line open for emergency coordination.",
      "Follow direct instructions from arriving campus security."
    ],
    thingsToAvoid: [
      "Do NOT panic or run into unsafe zones.",
      "Do NOT leave the student alone if you are nearby."
    ],
    warningSigns: ["Unresponsiveness", "Severe distress or hemorrhage"],
    recommendedHumanHelp: ["Campus Security Command Center", "Local Paramedics (911)"],
    responderBrief: `Urgent SOS dispatch for ${type} at ${location || "Campus area"}. ${note ? `Notes: ${note}` : "Dispatch immediate field units."}`,
    confidence: "HIGH"
  };
}

function generateFallbackHealthGuide(message: string, language?: string, simpleLanguage?: boolean) {
  const isHindi = language === "Hindi";
  const msgLower = (message || "").toLowerCase();

  // Guardrail check: Refuse non-medical topics
  const isMedicalQuery =
    msgLower.includes("pain") ||
    msgLower.includes("bleed") ||
    msgLower.includes("cut") ||
    msgLower.includes("blood") ||
    msgLower.includes("burn") ||
    msgLower.includes("fire") ||
    msgLower.includes("fall") ||
    msgLower.includes("injury") ||
    msgLower.includes("wound") ||
    msgLower.includes("dizzy") ||
    msgLower.includes("faint") ||
    msgLower.includes("headache") ||
    msgLower.includes("sick") ||
    msgLower.includes("doctor") ||
    msgLower.includes("health") ||
    msgLower.includes("help") ||
    msgLower.includes("sos") ||
    msgLower.includes("first aid") ||
    msgLower.includes("hospital") ||
    msgLower.includes("medicine font") ||
    msgLower.includes("emergency");

  if (!isMedicalQuery && msgLower.length > 5) {
    return {
      understand: isHindi
        ? "WHAT I UNDERSTAND: मैं केवल आपका एआई डॉक्टर और प्राथमिक चिकित्सा गाइड हूँ। मैं केवल स्वास्थ्य, चोट, दर्द और घाव में मदद कर सकता हूँ।"
        : "WHAT I UNDERSTAND: I am strictly your AI Doctor & First-Aid Guide. I can only assist with medical symptoms, pain analysis, bleeding control, burn care, and campus emergency first aid.",
      doNow: isHindi
        ? [
            "मुझसे स्वास्थ्य, चोट या दर्द से जुड़ा प्रश्न पूछें।",
            "खून बहने, घाव या दर्द की जानकारी दें।",
            "आपात स्थिति में SOS बटन का उपयोग करें।"
          ]
        : [
            "Ask me any medical, pain, bleeding, or first-aid question.",
            "Describe bleeding, cuts, thermal burns, or physical pain.",
            "Trigger One-Tap SOS if you need immediate emergency response."
          ],
      avoid: isHindi
        ? ["इमरजेंसी मेडिकल गाइड पर गैर-चिकित्सकीय प्रश्न ना पूछें।"]
        : ["Do NOT ask non-medical or off-topic questions in emergency triage mode."],
      humanHelp: isHindi
        ? ["कैंपस मेडिकल सेंटर (555) 019-2834 से संपर्क करें।"]
        : ["Contact Campus Medical Center (555) 019-2834 for campus health services."]
    };
  }

  if (msgLower.includes("bleed") || msgLower.includes("cut") || msgLower.includes("blood") || msgLower.includes("wound")) {
    return {
      understand: isHindi
        ? "WHAT I UNDERSTAND: मुझे समझ आ रहा है कि खून बह रहा है या घाव हुआ है।"
        : "WHAT I UNDERSTAND: I understand there is active bleeding or a cut requiring immediate hemorrhage control.",
      doNow: isHindi
        ? [
            "साफ कपड़े या पैड से घाव पर सीधा और मजबूत दबाव डालें।",
            "यदि सम्भव हो तो चोट वाले स्थान को दिल के स्तर से ऊपर उठाएं।",
            "कम से कम 10-15 मिनट तक लगातार दबाव बनाए रखें।"
          ]
        : [
            "Apply firm, continuous direct pressure over the wound using a clean cloth or sterile pad.",
            "Elevate the injured limb above heart level if no bone fracture is suspected.",
            "Maintain steady pressure for at least 10-15 minutes without lifting the cloth."
          ],
      avoid: isHindi
        ? ["पट्टी को बार-बार उठाकर घाव ना देखें", "गंदे कपड़े से दबाव ना डालें"]
        : ["Do NOT lift the cloth repeatedly to check if bleeding stopped.", "Do NOT apply a tourniquet unless trained and blood is spurting uncontrollably."],
      humanHelp: isHindi
        ? ["यदि 10 मिनट बाद भी खून बहना बंद ना हो तो तुरंत कैंपस SOS बटन दबाएं।"]
        : ["Seek immediate emergency responder care if bleeding spurts or does not stop within 10 minutes."]
    };
  }

  if (msgLower.includes("burn") || msgLower.includes("fire")) {
    return {
      understand: isHindi
        ? "WHAT I UNDERSTAND: मुझे समझ आ रहा है कि यह जलन या झुलसने की स्थिति है।"
        : "WHAT I UNDERSTAND: I understand you are dealing with a burn or thermal exposure.",
      doNow: isHindi
        ? [
            "10-15 मिनट तक ठंडे बहते पानी के नीचे रखें।",
            "सूजन आने से पहले अंगूठी या तंग कपड़े हटा दें।",
            "साफ और सूखे कपड़े से हल्का सा ढकें।"
          ]
        : [
            "Run cool, lukewarm tap water over the burn for 10-15 minutes.",
            "Remove rings or tight clothing before swelling occurs.",
            "Cover loosely with a clean, dry cloth or sterile bandage."
          ],
      avoid: isHindi
        ? ["बर्फ सीधे त्वचा पर ना लगाएं", "फफोले ना फोड़ें", "तेल या मक्खन ना लगाएं"]
        : ["Do NOT apply ice directly to skin.", "Do NOT pop any blisters.", "Do NOT apply butter or grease."],
      humanHelp: isHindi
        ? ["यदि जलन गंभीर है तो तुरंत कैंपस मेडिकल सेंटर (555) 019-2834 से संपर्क करें।"]
        : ["Seek campus medical care if burn is larger than 3 inches or on face/hands."]
    };
  }

  if (
    msgLower.includes("fall") ||
    msgLower.includes("injury") ||
    msgLower.includes("pain")
  ) {
    return {
      understand: isHindi
        ? "WHAT I UNDERSTAND: मुझे समझ आ रहा है कि किसी व्यक्ति के गिर जाने या चोट लगने का मामला है।"
        : "WHAT I UNDERSTAND: I understand someone experienced a fall, sprain, or physical injury.",
      doNow: isHindi
        ? [
            "व्यक्ति को शांत और स्थिर रखें।",
            "यदि गर्दन या पीठ में दर्द हो तो हिलाएं नहीं।",
            "खून बहने पर साफ कपड़े से हल्का दबाव डालें।"
          ]
        : [
            "Keep the person calm and motionless in a safe area.",
            "Check for steady breathing and responsiveness.",
            "Apply direct pressure with a clean cloth to stop any bleeding."
          ],
      avoid: isHindi
        ? ["रीढ़ की चोट की आशंका पर बिना मदद ना हिलाएं", "बिना सलाह खाने-पीने को ना दें"]
        : ["Do NOT move them if neck or spinal injury is suspected.", "Do NOT offer food or fluids immediately."],
      humanHelp: isHindi
        ? ["कैंपस हेल्थ सेंटर या फर्स्ट एड टीम को तुरंत बुलाएं।"]
        : ["Contact Campus Health Services or trigger One-Tap SOS emergency alert."]
    };
  }

  return {
    understand: isHindi
      ? `WHAT I UNDERSTAND: मैं आपके स्वास्थ्य प्रश्न "${message || "प्राथमिक चिकित्सा"}" में सहायता के लिए यहाँ हूँ।`
      : `WHAT I UNDERSTAND: I understand your query regarding "${message || "first aid assistance"}" and am here to help.`,
    doNow: isHindi
      ? [
          "शांत रहें और आरामदायक स्थान पर बैठ जाएं।",
          "यदि स्थिति गंभीर महसूस हो तो SOS बटन दबाएं।",
          "अपने पास फोन रखें ताकि इमरजेंसी टीम आपसे संपर्क कर सके।"
        ]
      : [
          "Stay calm and sit down in a comfortable position.",
          "If experiencing acute pain or dizziness, trigger the One-Tap SOS.",
          "Keep your phone line free for incoming campus emergency coordination."
        ],
    avoid: isHindi
      ? ["घबराएं नहीं", "अकेले ना रहें यदि अस्वस्थ महसूस हो"]
      : ["Do NOT panic or isolate yourself if feeling unwell.", "Do NOT take prescription medications without guidance."],
    humanHelp: isHindi
      ? ["कैंपस मेडिकल सेंटर (555) 019-2834 या कैंपस सुरक्षा (555) 911-0000 पर कॉल करें।"]
      : ["Contact Campus Emergency Medical Center or call 911 directly if symptoms worsen."]
  };
}

// API Routes

// GET /api/incidents - List all incidents
app.get("/api/incidents", (req, res) => {
  res.json({ incidents });
});

// GET /api/incidents/:id - Get specific incident
app.get("/api/incidents/:id", (req, res) => {
  const incident = incidents.find((i) => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }
  res.json({ incident });
});

// POST /api/incidents - Create new SOS Emergency
app.post("/api/incidents", async (req, res) => {
  const { studentId, studentName, studentAvatar, type, location, note, image } = req.body;

  const newId = `SOS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Initial triage fallback
  let triageResult = generateFallbackTriage(type, note, location);

  const newIncident: Incident = {
    id: newId,
    studentId: studentId || "STU-001",
    studentName: studentName || "Aarav Sharma",
    studentAvatar: studentAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBMxSZdh2EaZvHRzYrwuiGZLZeJmICYFUF7hOa9Skn7dyCYFVNOKVtJwnTKC3p5FnuQBd38Yl-iaWMpTxD5lRDEHhY7GMlBmPsyvMs2euxSpTAMzFWYNZXLF6L3Ypf8J_LDNhThYhphmalKhVv0gkinoM5a_jgdF4EQuR-GgrHljp90TjV9f4VQL1PIQJh_AabWwV_PlTN6Ezzl6AtR3Lm3Mv-BuKGbnp5OXFdjOGc4thoUmy-4E7mf",
    type: type || "Medical emergency",
    location: location || "Library — Floor 1",
    note: note || "",
    timestamp: timeStr,
    status: "ACTIVE",
    responders: [],
    poll: {
      needsImmediateHelp: 1,
      helpBeingProvided: 0,
      situationUnclear: 0,
      userVotes: {},
    },
    aiTriage: triageResult,
    hasImage: !!image,
    imageUrl: image || undefined,
  };

  incidents.unshift(newIncident);

  // Broadcast to all active sessions immediately
  broadcastState("INCIDENT_CREATED", { incident: newIncident });

  res.status(201).json({ incident: newIncident });

  // Asynchronously enhance with Gemini API if key is set
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `You are a campus emergency AI triage system. Perform rapid medical/safety assessment for an active emergency alert.
Emergency Type: ${type}
Location: ${location}
User Notes: ${note || "None"}
${image ? "An image has been attached to this emergency." : ""}

Respond strictly with valid JSON matching this schema:
{
  "incidentType": "string",
  "urgency": "LOW" | "MODERATE" | "HIGH" | "URGENT",
  "severityScore": number (1 to 10),
  "whatWeObserve": "string summary",
  "immediateSteps": ["step 1", "step 2", "step 3"],
  "thingsToAvoid": ["avoid 1", "avoid 2"],
  "warningSigns": ["warning 1", "warning 2"],
  "recommendedHumanHelp": ["resource 1", "resource 2"],
  "responderBrief": "concise 2-sentence tactical brief for campus security/medical responders",
  "confidence": "LOW" | "MEDIUM" | "HIGH"
}`;

      let parts: any[] = [{ text: prompt }];
      if (image && typeof image === "string" && image.startsWith("data:")) {
        const matches = image.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          parts.unshift({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }

      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.7-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              incidentType: { type: Type.STRING },
              urgency: { type: Type.STRING, enum: ["LOW", "MODERATE", "HIGH", "URGENT"] },
              severityScore: { type: Type.NUMBER },
              whatWeObserve: { type: Type.STRING },
              immediateSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              thingsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
              warningSigns: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedHumanHelp: { type: Type.ARRAY, items: { type: Type.STRING } },
              responderBrief: { type: Type.STRING },
              confidence: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
            },
            required: [
              "incidentType",
              "urgency",
              "severityScore",
              "whatWeObserve",
              "immediateSteps",
              "thingsToAvoid",
              "warningSigns",
              "recommendedHumanHelp",
              "responderBrief",
              "confidence",
            ],
          },
        },
      });

      if (response.text) {
        const parsed: AiTriageResult = JSON.parse(response.text.trim());
        const targetIncident = incidents.find((i) => i.id === newId);
        if (targetIncident) {
          targetIncident.aiTriage = parsed;
          broadcastState("INCIDENT_UPDATED", { incident: targetIncident });
        }
      }
    } catch (err) {
      console.error("Gemini triage async error:", err);
    }
  }
});

// POST /api/incidents/:id/respond - "I'M RESPONDING"
app.post("/api/incidents/:id/respond", (req, res) => {
  const { responderName } = req.body;
  const incident = incidents.find((i) => i.id === req.params.id);

  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  const name = responderName || "Responder";
  if (!incident.responders.includes(name)) {
    if (incident.responders.length === 0) {
      incident.firstResponder = name;
    }
    incident.responders.push(name);
  }

  if (incident.status === "ACTIVE") {
    incident.status = "RESPONDING";
  }

  broadcastState("INCIDENT_UPDATED", { incident });
  res.json({ incident });
});

// POST /api/incidents/:id/poll - Submit poll vote
app.post("/api/incidents/:id/poll", (req, res) => {
  const { userId, voteOption } = req.body; // option: 'NEEDS_HELP' | 'HELP_PROVIDED' | 'UNCLEAR'
  const incident = incidents.find((i) => i.id === req.params.id);

  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  const prevVote = incident.poll.userVotes[userId];
  if (prevVote === voteOption) {
    return res.json({ incident }); // Same vote, no change
  }

  // Decrement previous vote count if changing
  if (prevVote === "NEEDS_HELP" && incident.poll.needsImmediateHelp > 0) incident.poll.needsImmediateHelp--;
  if (prevVote === "HELP_PROVIDED" && incident.poll.helpBeingProvided > 0) incident.poll.helpBeingProvided--;
  if (prevVote === "UNCLEAR" && incident.poll.situationUnclear > 0) incident.poll.situationUnclear--;

  // Increment new vote count
  if (voteOption === "NEEDS_HELP") incident.poll.needsImmediateHelp++;
  if (voteOption === "HELP_PROVIDED") incident.poll.helpBeingProvided++;
  if (voteOption === "UNCLEAR") incident.poll.situationUnclear++;

  incident.poll.userVotes[userId] = voteOption;

  broadcastState("INCIDENT_UPDATED", { incident });
  res.json({ incident });
});

// PATCH /api/incidents/:id/status - Update incident status (ACTIVE -> RESPONDING -> HELP PROVIDED -> RESOLVED)
app.patch("/api/incidents/:id/status", (req, res) => {
  const { status } = req.body;
  const incident = incidents.find((i) => i.id === req.params.id);

  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  incident.status = status;
  broadcastState("INCIDENT_UPDATED", { incident });
  res.json({ incident });
});

// POST /api/ai/health-guide - Interactive AI Health Guide Chat Endpoint
app.post("/api/ai/health-guide", async (req, res) => {
  const { message, image, language, simpleLanguage } = req.body;

  const ai = getGeminiClient();

  if (!ai) {
    const fallback = generateFallbackHealthGuide(message, language, simpleLanguage);
    return res.json(fallback);
  }

  try {
    const isHindi = language === "Hindi";
    const prompt = `You are the Assistive Google Live AI Guide, a strict AI Doctor and immediate first-aid assistant on a college campus.

STRICT MEDICAL & FIRST-AID GUARDRAILS:
1. You MUST ONLY act as an AI Doctor and Campus Emergency First-Aid Guide ("AI Guide").
2. Your sole purpose is to analyze physical health symptoms, pain levels, active bleeding, cuts, thermal burns, fall injuries, dizziness, and campus medical safety.
3. IF THE USER ASKS ANYTHING OFF-TOPIC or non-medical (e.g. coding, programming, math, jokes, politics, general chatting):
   - Set "understand" to: "${isHindi ? "WHAT I UNDERSTAND: मैं केवल आपका एआई डॉक्टर और प्राथमिक चिकित्सा गाइड हूँ। मैं केवल स्वास्थ्य, दर्द और घाव में मदद कर सकता हूँ।" : "WHAT I UNDERSTAND: I am strictly your AI Doctor & First-Aid Guide. I can only assist with medical symptoms, pain analysis, bleeding control, burn care, and campus emergency first aid."}"
   - Set "doNow": ["${isHindi ? "मुझसे प्राथमिक चिकित्सा या स्वास्थ्य से संबंधित प्रश्न पूछें।" : "Ask me any medical, pain, or first-aid question."}", "${isHindi ? "खून बहने, घाव या दर्द की जानकारी दें।" : "Describe bleeding, cuts, burns, or physical pain."}"]
   - Set "avoid": ["${isHindi ? "इमरजेंसी मेडिकल गाइड पर गैर-चिकित्सकीय प्रश्न ना पूछें।" : "Do NOT ask non-medical or off-topic questions in emergency triage mode."}"]
   - Set "humanHelp": ["${isHindi ? "कैंपस मेडिकल सेंटर (555) 019-2834 पर कॉल करें।" : "Contact Campus Medical Center (555) 019-2834 for campus health services."}"]

Language requirement: ${isHindi ? "Respond entirely in clear Hindi (Devanagari script)." : "Respond in English."}
Mode requirement: ${simpleLanguage ? "Use extremely simple, easy-to-understand words suitable for someone under stress." : "Standard clear medical first-aid language."}

User query: ${message}
${image ? "The user attached an image of their symptom/situation." : ""}

Return strictly a valid JSON object matching this schema:
{
  "understand": "1 sentence starting with 'WHAT I UNDERSTAND'",
  "doNow": ["Immediate actionable step 1", "Step 2", "Step 3"],
  "avoid": ["Thing to avoid 1", "Thing to avoid 2"],
  "humanHelp": ["When and where to get human emergency help"]
}`;

    let parts: any[] = [{ text: prompt }];
    if (image && typeof image === "string" && image.startsWith("data:")) {
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        parts.unshift({
          inlineData: {
            mimeType: matches[1],
            data: matches[2],
          },
        });
      }
    }

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            understand: { type: Type.STRING },
            doNow: { type: Type.ARRAY, items: { type: Type.STRING } },
            avoid: { type: Type.ARRAY, items: { type: Type.STRING } },
            humanHelp: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["understand", "doNow", "avoid", "humanHelp"],
        },
      },
    });

    if (response && response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json(parsed);
    }

    throw new Error("No text returned from Gemini model");
  } catch (err: any) {
    console.warn("Health Guide Gemini error handled gracefully with fallback:", err?.message || err);
    const fallback = generateFallbackHealthGuide(message, language, simpleLanguage);
    return res.json(fallback);
  }
});

// SSE endpoint for live multi-user real-time state synchronization
app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const clientId = `client-${Date.now()}-${Math.random()}`;
  sseClients.push({ id: clientId, res });

  // Send initial state snapshot
  res.write(`event: INITIAL_STATE\ndata: ${JSON.stringify({ incidents })}\n\n`);

  req.on("close", () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
