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
If the user asks about ANYTHING unrelated (such as general programming, recipes, politics, outside topics, sports, gaming, entertainment, general knowledge, or third-party issues), you MUST politely refuse and respond ONLY with:
"Please ask questions related to our services. I am here to help, but the given question is not related to the services we provide."

Keep your answers concise, professional, clear, and well-structured using markdown bullet points when helpful.`;

const UNRELATED_TOPIC_REPLY = "Please ask questions related to our services. I am here to help, but the given question is not related to the services we provide.";

/**
 * Checks whether user message is related to LifeDrone medical drone logistics,
 * blood banking, emergency delivery services, or platform support.
 */
export function isRelatedToLifeDrone(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') return false;
  const lower = userMessage.toLowerCase().trim();

  // Explicit off-topic check
  const explicitOffTopic = [
    'recipe', 'cook', 'cooking', 'bake', 'baking', 'cake', 'food', 'restaurant',
    'movie', 'film', 'cinema', 'song', 'music', 'lyrics', 'netflix', 'anime',
    'sport', 'sports', 'cricket', 'ipl', 'football', 'soccer', 'fifa', 'basketball', 'tennis',
    'python', 'java code', 'c++', 'javascript code', 'html code', 'css code', 'write code',
    'debug code', 'write an essay', 'write a poem', 'tell a story', 'joke', 'riddle',
    'capital of', 'president', 'prime minister', 'election', 'politics',
    'crypto', 'bitcoin', 'stock market', 'share market', 'trading', 'investment',
    'weather in', 'rain forecast', 'actor', 'actress', 'celebrity',
    'game', 'gaming', 'video game', 'playstation', 'xbox', 'car', 'bike', 'motorcycle',
    'dating', 'fashion', 'clothes', 'shoes', 'shopping'
  ];
  for (const term of explicitOffTopic) {
    if (lower.includes(term)) return false;
  }

  // Keywords that belong specifically to LifeDrone ecosystem and emergency services
  const domainKeywords = [
    // Pure greetings & bot identity
    'who are you', 'what can you do', 'what is your name', 'how can you help',
    'lifedrone', 'about lifedrone', 'what is lifedrone', 'operations desk', 'emergency hotline',
    'what services do you provide', 'our services', 'your services',

    // Blood & clinical logistics
    'blood', 'prbc', 'rbc', 'platelet', 'platelets', 'plasma', 'ffp', 'whole blood',
    'donor', 'donate', 'donation', 'recipient', 'compatibility', 'transfusion',
    'hemoglobin', 'inventory', 'blood unit', 'blood units', 'units of blood',
    'blood group', 'blood groups', 'blood type', 'blood types',
    'o+', 'o-', 'a+', 'a-', 'b+', 'b-', 'ab+', 'ab-', 'rh factor', 'crossmatch',
    'blood stock', 'available units',

    // Drone, aerial, and flight routing
    'drone', 'drones', 'uav', 'quadcopter', 'delivery', 'deliveries',
    'flight', 'flight corridor', 'flight corridors', 'flight path', 'drone path',
    'corridor', 'corridors', 'route', 'routes', 'routing', 'pathfinding',
    'a*', 'astar', 'algorithm', 'straight line', 'vertiport', 'vertipad', 'vertipads',
    'helipad', 'skyway', 'cruising speed', 'drone speed', 'altitude', 'telemetry',
    'drone tracking', 'flight tracking', 'eta', 'gps coordinates', 'latitude', 'longitude',
    'drone dispatch', 'drone launch', 'takeoff', 'touchdown', 'payload', 'km/h',

    // Security & passkey
    'passkey', 'single-use', 'handover', 'verification code', 'handover code',
    'delivery pin', '6-digit', 'crypto salt', 'sha-256', 'sha256',

    // Healthcare & platform entities
    'hospital', 'hospitals', 'blood bank', 'blood banks', 'clinic',
    'doctor', 'nurse', 'hospital receiver', 'hospital admin', 'bank admin', 'authorizer',
    'portal login', 'hospital login', 'blood bank login', 'register hospital', 'register blood bank',
    'hospital registration', 'blood bank registration', 'cms certificate', 'cms number',
    'prakasam', 'ongole', 'rims', 'kims', 'chirala', 'markapur', 'kandukur', 'red cross',
    'under review', 'application approval',

    // Cold chain & container
    'cold chain', 'cold box', 'cooling box', 'medical container', 'temperature control', 'ice pack',

    // Urgency & operations
    'emergency request', 'blood request', 'request blood', 'place request', 'urgent request'
  ];

  // Specific check for standalone greetings
  const shortGreetings = ['hello', 'hi', 'hey', 'help', 'good morning', 'good afternoon', 'good evening'];
  const words = lower.split(/\s+/);
  if (words.length <= 3 && shortGreetings.some((g) => lower === g || lower.startsWith(g + ' ') || lower.endsWith(' ' + g))) {
    return true;
  }

  return domainKeywords.some((kw) => lower.includes(kw));
}

// Intelligent fallback knowledge engine for when Gemini API key is not configured or network quotas occur
function getFallbackResponse(userMessage) {
  if (!isRelatedToLifeDrone(userMessage)) {
    return UNRELATED_TOPIC_REPLY;
  }

  const lower = userMessage.toLowerCase().trim();

  // Registration & Onboarding (CMS Certificate, Doctor/Owner, GPS Coordinates, Under Review Email)
  if (lower.includes('register') || lower.includes('registration') || lower.includes('cms') || lower.includes('under review') || lower.includes('approval') || lower.includes('license')) {
    return `### Hospital & Blood Bank Registration on LifeDrone:
1. **CMS Certificate Number:** Every medical institution must enter their official State/National CMS registration number for regulatory compliance.
2. **Authorization Details:** Enter the authorized Hospital/Bank Owner name, Chief Medical Doctor name, and official contact phone and email.
3. **Automatic GPS Pinpoint:** When selecting or typing your institutional address, the system automatically detects the exact **latitude and longitude** coordinates for drone vertipad corridor routing.
4. **Under-Review Security Email:** Upon successful submission, your registered email immediately receives an official notification: *"Your application is under review and will be approved soon by LifeDrone Health Administration."*
5. **Activation:** Once verified by platform administrators, your portal access and vertipad are activated for live dispatch.`;
  }

  // How to place emergency blood request
  if (lower.includes('how to request') || lower.includes('request blood') || lower.includes('place request')) {
    return `### How to Request Blood on LifeDrone:
1. **Log in** to your Hospital Account as an authorized Hospital user.
2. Go to **"Request Blood"** from the navigation or dashboard.
3. Select the required **Blood Group** (e.g., O+, A-, B+) and **Component** (Whole Blood, PRBC, Platelets, Plasma).
4. Enter the required **quantity in units** and select clinical urgency (*EMERGENCY*, *CRITICAL*, *ROUTINE*).
5. Provide a **Patient Reference ID** and assign a designated **Hospital Receiver** who will receive the delivery passkey.
6. The system queries participating blood banks and submits your request with real-time transactional reservation.`;
  }

  // Passkey & Handover Security
  if (lower.includes('passkey') || lower.includes('security') || lower.includes('single-use') || lower.includes('handover') || lower.includes('verification')) {
    return `### Single-Use Delivery Passkey Security:
- **Cryptographic Generation:** When blood bank staff dispatch the flight, the system uses Node.js cryptographic randomness to generate a unique 6-digit passkey.
- **Salted Hashing:** The passkey is stored using SHA-256 with a unique random salt—it is never stored in plaintext.
- **Confidential Delivery:** The passkey is delivered exclusively to the designated Hospital Receiver via authenticated alert and email.
- **Touchdown Handover:** When the drone touches down at the hospital vertipad, the receiver enters the passkey. The system verifies it using timing-safe comparison, consumes it atomically, and marks the delivery as **DELIVERED**. It can never be reused.`;
  }

  // A* Routing & Flight Corridors
  if (lower.includes('corridor') || lower.includes('route') || lower.includes('a*') || lower.includes('astar') || lower.includes('pathfinding') || lower.includes('straight line') || lower.includes('prakasam')) {
    return `### A* Intelligent Route Planning in LifeDrone:
- **Airspace Corridors:** LifeDrone plans aerial routes between verified vertipads across Prakasam District (Red Cross Blood Bank Ongole, RIMS Government Hospital Helipad, Chirala Area Hospital, Markapur District Hospital, Kandukur Area Hospital).
- **A* Algorithm:** Evaluates flight corridor waypoints using Haversine distance heuristics to minimize transit time while maintaining safe, obstacle-free direct aerial corridors.
- **Straight Flight Paths:** Clean waypoint connections provide direct point-to-point transit between blood bank launch vertipads and destination hospital helipads.
- **Cruising Profile:** Drones cruise at ~65 km/h at an altitude of 75 meters with live simulated telemetry including battery percentage and dynamic ETA.`;
  }

  // Blood Bank Operations & Inventory Reservation
  if (lower.includes('blood bank') || lower.includes('inventory') || lower.includes('accept') || lower.includes('prepare') || lower.includes('stock') || lower.includes('reserve')) {
    return `### Blood Bank Operations Workflow:
1. **Live Inventory Management:** Blood banks maintain real-time units of Whole Blood, Packed Red Blood Cells (PRBC), Platelets, and Fresh Frozen Plasma (FFP).
2. **Reviewing Requests:** When an emergency request arrives, staff inspect stock and clinical compatibility.
3. **Transactional Reservation:** Accepting a request reserves stock in MySQL with row-level transactions to eliminate double-allocation risks.
4. **Cold-Chain Preparation:** Staff complete the certified medical cold-box packing checklist (+2°C to +6°C) before triggering flight dispatch.`;
  }

  // Cold Chain & Packaging
  if (lower.includes('cold chain') || lower.includes('temperature') || lower.includes('box') || lower.includes('container') || lower.includes('ice pack')) {
    return `### Cold-Chain Packaging Standards (+2°C to +6°C):
- **Whole Blood & PRBC:** Maintained strictly between **+2°C and +6°C** during entire flight transit using validated eutectic cooling packs.
- **Platelets:** Transported at **+20°C to +24°C** in temperature-stabilized compartments.
- **Fresh Frozen Plasma (FFP):** Maintained frozen at **≤ -20°C** with dry ice containment.
- **Telemetry Sensors:** Insulated smart containers monitor and log thermal integrity until handover verification.`;
  }

  // Blood Compatibility
  if (lower.includes('compatibility') || lower.includes('universal') || lower.includes('blood type') || lower.includes('o-') || lower.includes('ab+')) {
    return `### Clinical Blood Compatibility Overview:
- **O Negative (O-):** Universal Red Blood Cell donor; critical for emergency trauma cases before cross-matching.
- **O Positive (O+):** Can be given to O+, A+, B+, and AB+ recipients.
- **AB Positive (AB+):** Universal Red Blood Cell recipient; can receive any blood group.
- **AB Negative (AB-):** Universal Plasma donor.
*Note: Certified medical authorizers verify cross-matching before package dispatch.*`;
  }

  // Tracking & ETA
  if (lower.includes('tracking') || lower.includes('eta') || lower.includes('simulate') || lower.includes('telemetry') || lower.includes('live map') || lower.includes('speed') || lower.includes('battery')) {
    return `### Drone Delivery Tracking & Telemetry:
- **Live Flight Map:** Interactive OpenStreetMap Leaflet visualization displays origin vertipad, destination hospital, planned A* corridor, and dynamic drone coordinates.
- **Telemetry Metrics:** Shows ground speed (~65 km/h), flight altitude (75m), remaining distance in kilometers, battery percentage, and dynamic ETA in minutes.
- **Simulated Demonstration Mode:** In pilot mode, avionics telemetry is calculated via backend trajectory interpolation over the Prakasam corridor graph.`;
  }

  // Human Support Hotline
  if (lower.includes('human') || lower.includes('contact') || lower.includes('phone') || lower.includes('emergency desk') || lower.includes('call')) {
    return `### LifeDrone Emergency Human Support:
- **24/7 Operations Desk Hotline:** \`+91-8592-280100\`
- **Emergency Ops Email:** \`emergency@lifedrone.io\`
- **Vertipad Command Center:** Red Cross Blood Bank & RIMS Hospital Helipad, Ongole, Prakasam District, Andhra Pradesh.
- You can also request an urgent callback directly from the "Human Support" tab in this Help modal!`;
  }

  // Greetings & General Questions
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('who are you') || lower.includes('what can you do') || lower.includes('what is your name')) {
    return `Hello! I am the **LifeDrone AI Assistant**. I am here to help you with our emergency blood delivery drone operations:
- **Emergency Blood Requests:** How hospitals place urgent orders and search inventory.
- **Hospital & Blood Bank Registration:** CMS certificate verification, GPS coordinates, and approval process.
- **A* Corridor Routing:** Intelligent aerial pathfinding across Prakasam District vertipads.
- **Single-Use Passkey Handover:** Cryptographic verification at the destination helipad.
- **Cold-Chain Compliance:** Maintaining blood temperature (+2°C to +6°C) throughout transit.

How can I assist you with LifeDrone today?`;
  }

  return `LifeDrone is an AI-assisted emergency medical drone logistics platform connecting hospitals and blood banks in Prakasam District.
You can ask me about:
- **Hospital / Blood Bank Registration:** CMS certificate, authorization, GPS pinpoint, and under-review emails.
- **Blood Requests:** How hospitals search inventory and place urgent orders.
- **Route Planning:** How the A* algorithm plans drone flight corridors.
- **Passkey Handover:** How single-use cryptographic passkeys ensure secure delivery.
- **Blood Bank Workflow:** How inventory is reserved and packed in cold-chain containers (+2°C to +6°C).

Please specify what part of the LifeDrone delivery system you need assistance with!`;
}

export async function askGemini(userMessage, conversationHistory = []) {
  // Immediately reject questions unrelated to LifeDrone services
  if (!isRelatedToLifeDrone(userMessage)) {
    return UNRELATED_TOPIC_REPLY;
  }

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
