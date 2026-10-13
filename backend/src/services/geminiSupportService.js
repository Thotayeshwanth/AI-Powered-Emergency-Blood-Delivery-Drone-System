import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const LIFEDRONE_SYSTEM_PROMPT = `You are the LifeDrone Dedicated AI Assistant.
You specialize EXCLUSIVELY in the LifeDrone emergency blood delivery drone management system operating across Prakasam District, Andhra Pradesh, India.

Your knowledge base includes:
1. LifeDrone platform operations, features, roles (Hospital Admin, Hospital Receiver, Blood Bank Admin, Blood Bank Authorizer).
2. How hospitals search live inventory and submit emergency blood requests.
3. How blood banks verify stock, accept requests, reserve inventory transactionally, and prepare cold-chain packages (+2°C to +6°C).
4. How A* route planning calculates optimal drone corridors between vertipads across Prakasam District (RIMS Ongole, Red Cross Ongole, Chirala, Markapur, Kandukur).
5. How the single-use cryptographic 6-digit passkey secures the package handover at the hospital vertipad, preventing token reuse.
6. Blood group compatibilities (O- universal donor, AB+ universal recipient) and medical logistics guidelines.
7. Simulated drone tracking mode, ETA estimation, cruising speed (~65 km/h), and battery monitoring.

STRICT BOUNDARY RULE:
You are strictly restricted to questions about LifeDrone, blood banking, medical drone logistics, and the LifeDrone software platform.
If the user asks about ANYTHING unrelated (such as general programming, recipes, politics, weather outside drone operations, gaming, pop culture, non-medical advice), you MUST politely refuse and respond:
"I am the dedicated LifeDrone AI Assistant and can only answer questions related to the LifeDrone emergency blood delivery platform, drone flight corridors, blood bank workflows, and passkey verification. How can I assist your medical delivery today?"

Keep your answers concise, professional, clear, and well-structured using markdown bullet points when helpful.`;

// Intelligent fallback knowledge engine for when Gemini API key is not configured or network quotas occur
function getFallbackResponse(userMessage) {
  const lower = userMessage.toLowerCase().trim();

  // Off-topic guardrail detection
  const offTopicKeywords = [
    'recipe', 'cook', 'movie', 'song', 'sports', 'cricket', 'football',
    'python code for game', 'joke', 'capital of', 'who is the president',
    'write an essay', 'crypto bitcoin', 'weather in tokyo', 'stock market'
  ];

  for (const word of offTopicKeywords) {
    if (lower.includes(word)) {
      return "I am the dedicated LifeDrone AI Assistant and can only answer questions related to the LifeDrone emergency blood delivery platform, drone flight corridors, blood bank workflows, and passkey verification. How can I assist your medical delivery today?";
    }
  }

  if (lower.includes('how to request') || lower.includes('request blood') || lower.includes('place request')) {
    return `### How to Request Blood on LifeDrone:
1. **Log in** to your Hospital Account as a Hospital Administrator.
2. Go to **"Request Blood"** from the navigation or dashboard.
3. Select the required **Blood Group** (e.g., O+, A-, B+) and **Component** (Whole Blood, PRBC, Platelets, Plasma).
4. Enter the required **quantity in units** and select clinical urgency (*EMERGENCY*, *CRITICAL*, *ROUTINE*).
5. Provide a **Patient Reference ID** and assign a designated **Hospital Receiver** who will receive the delivery passkey.
6. The system queries participating blood banks and submits your request with real-time transactional reservation.`;
  }

  if (lower.includes('passkey') || lower.includes('security') || lower.includes('single-use') || lower.includes('handover')) {
    return `### Single-Use Delivery Passkey Security:
- **Generation:** When authorized blood bank staff dispatch the flight, the system uses Node.js cryptographic randomness to generate a unique 6-digit passkey.
- **Salted Hashing:** The passkey is stored using SHA-256 with a unique random salt—never stored in plaintext.
- **Confidentiality:** Sent exclusively to the designated Hospital Receiver via authenticated alert and email.
- **Verification:** When the drone touches down at the hospital vertipad, the receiver enters the passkey. The system verifies it using timing-safe comparison, consumes it atomically, and marks the delivery as **DELIVERED**. It can never be reused.`;
  }

  if (lower.includes('corridor') || lower.includes('route') || lower.includes('a*') || lower.includes('pathfinding') || lower.includes('prakasam')) {
    return `### A* Intelligent Route Planning in LifeDrone:
- **Airspace Graph:** LifeDrone models Prakasam District airspace with dedicated vertipads (Red Cross Blood Bank Ongole, RIMS Government Hospital Helipad, Chirala Area Hospital, Markapur District Hospital, Kandukur Area Hospital).
- **A* Algorithm:** Evaluates corridor nodes using Haversine distance heuristics to minimize aerial transit time while strictly avoiding restricted ground terrain.
- **Cruising Profile:** Drones cruise at ~65 km/h at an altitude of 75 meters with live simulated telemetry including battery percentage and dynamic ETA.`;
  }

  if (lower.includes('blood bank') || lower.includes('inventory') || lower.includes('accept') || lower.includes('prepare')) {
    return `### Blood Bank Operations Workflow:
1. **Inventory Management:** Blood banks maintain live inventory of Whole Blood, Packed Red Blood Cells (PRBC), Platelets, and Fresh Frozen Plasma (FFP) with strict cold chain tracking (+2°C to +6°C for RBC, -20°C for plasma).
2. **Reviewing Requests:** When a hospital submits an emergency request, blood bank staff inspect inventory and clinical compatibility.
3. **Transactional Reservation:** Accepting a request reserves stock in the MySQL database to prevent double allocation.
4. **Package Preparation:** Staff complete the certified medical cold-box packing checklist before drone authorizers trigger flight dispatch.`;
  }

  if (lower.includes('compatibility') || lower.includes('universal') || lower.includes('blood type')) {
    return `### Clinical Blood Compatibility Overview:
- **O Negative (O-):** Universal Red Blood Cell donor; vital for emergency trauma cases before cross-matching.
- **O Positive (O+):** Can be given to O+, A+, B+, and AB+ recipients.
- **AB Positive (AB+):** Universal Red Blood Cell recipient; can receive any blood group.
- **AB Negative (AB-):** Universal Plasma donor.
*Note: LifeDrone requires certified medical authorizers to verify laboratory cross-matching before package release.*`;
  }

  if (lower.includes('tracking') || lower.includes('eta') || lower.includes('simulate') || lower.includes('live')) {
    return `### Drone Delivery Tracking:
- **Live Flight Map:** OpenStreetMap Leaflet visualization displays origin vertipad, destination hospital, planned A* corridor, and dynamic drone coordinates.
- **Metrics Displayed:** Ground speed (~65 km/h), flight altitude (75m), remaining distance in kilometers, battery percentage, and dynamic ETA in minutes.
- **Simulated Demonstration Mode:** In this pilot version, avionics telemetry is calculated via backend trajectory interpolation over the Prakasam corridor graph.`;
  }

  if (lower.includes('human') || lower.includes('contact') || lower.includes('phone') || lower.includes('emergency desk')) {
    return `### LifeDrone Emergency Human Support:
- **24/7 Operations Desk Hotline:** \`+91-8592-280100\`
- **Emergency Ops Email:** \`emergency@lifedrone.io\`
- **Vertipad Command Center:** Red Cross Blood Bank & RIMS Hospital Helipad, Ongole, Prakasam District, Andhra Pradesh.
- You can also request an urgent callback directly from the "Human Support" tab in this Help modal!`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help')) {
    return `Hello! I am the **LifeDrone AI Assistant**. I can help you with:
- How to submit emergency blood requests
- Blood bank review & inventory reservation workflows
- A* flight corridor routing across Prakasam District
- Single-use passkey security & handover verification
- Real-time drone tracking and cold-chain compliance

What would you like to know about LifeDrone?`;
  }

  return `LifeDrone is an AI-assisted emergency medical drone logistics platform connecting hospitals and blood banks in Prakasam District.
You can ask me about:
- **Blood Requests:** How hospitals search inventory and place urgent orders.
- **Route Planning:** How the A* algorithm plans drone flight corridors.
- **Passkey Handover:** How single-use cryptographic passkeys ensure secure delivery.
- **Blood Bank Workflow:** How inventory is reserved and packed in cold-chain containers (+2°C to +6°C).

Please specify what part of the LifeDrone delivery system you need assistance with!`;
}

export async function askGemini(userMessage, conversationHistory = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('replace_with')) {
    // Return high-quality domain fallback response
    return getFallbackResponse(userMessage);
  }

  try {
    const formattedContents = [];

    // System instruction passed in request or contents
    formattedContents.push({
      role: 'user',
      parts: [{ text: `${LIFEDRONE_SYSTEM_PROMPT}\n\nUser Question: ${userMessage}` }]
    });

    // Try Gemini 1.5 Flash endpoint via native fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formattedContents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600
          }
        })
      }
    );

    if (!response.ok) {
      console.warn(`[Gemini API] Returned status ${response.status}. Falling back to LifeDrone engine.`);
      return getFallbackResponse(userMessage);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidateText && candidateText.trim().length > 0) {
      return candidateText.trim();
    }

    return getFallbackResponse(userMessage);
  } catch (error) {
    console.error('[Gemini API Exception]', error.message);
    return getFallbackResponse(userMessage);
  }
}
