import { transporter, isSmtpConfigured } from '../config/smtp.js';
import { query } from '../config/database.js';

const BRAND_COLOR = '#1769FF';
const ACCENT_COLOR = '#00A6A6';
const BG_COLOR = '#F5F8FC';
const TEXT_DARK = '#152238';

function createEmailShell(title, contentHtml) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${BG_COLOR}; color: ${TEXT_DARK}; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #0052cc 100%); padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 24px; line-height: 1.6; font-size: 15px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; background: #EFF6FF; color: ${BRAND_COLOR}; }
    .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .card table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .card td { padding: 6px 0; }
    .card td.label { color: #64748B; width: 40%; font-weight: 500; }
    .card td.value { color: ${TEXT_DARK}; font-weight: 600; }
    .btn { display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; text-align: center; }
    .passkey-box { background: #ECFDF5; border: 2px dashed ${ACCENT_COLOR}; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
    .passkey-code { font-family: monospace; font-size: 32px; font-weight: 800; color: #065F46; letter-spacing: 6px; margin: 8px 0; }
    .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LifeDrone</h1>
      <p>Every Second Matters. Every Drop Counts.</p>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>This is an automated operational notification from the LifeDrone Emergency Medical Aerial Network (Prakasam District Pilot).</p>
      <p>Simulated Demonstration Environment &copy; 2026 LifeDrone System.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Core send helper: sends email if SMTP is configured, otherwise logs to DB as SIMULATED
 */
export async function sendEmail({ to, subject, templateName, html }) {
  const from = process.env.SMTP_FROM || 'LifeDrone Network <notifications@lifedrone.io>';
  let status = 'SIMULATED';
  let errorMessage = null;

  try {
    if (isSmtpConfigured && transporter) {
      await transporter.sendMail({
        from,
        to,
        subject,
        html
      });
      status = 'SENT';
      console.log(`[SMTP] Email successfully sent to ${to}: "${subject}"`);
    } else {
      console.log(`[SMTP SIMULATED] Would send email to ${to}: "${subject}" (SMTP credentials not configured)`);
    }
  } catch (err) {
    status = 'FAILED';
    errorMessage = err.message;
    console.error(`[SMTP ERROR] Failed to send email to ${to}:`, err.message);
  }

  // Persist into email_logs table
  try {
    await query(
      'INSERT INTO email_logs (recipient_email, subject, template_name, status, error_message) VALUES (?, ?, ?, ?, ?)',
      [to, subject, templateName, status, errorMessage]
    );
  } catch (dbErr) {
    console.error('Failed to write email log to database:', dbErr.message);
  }

  return { success: status === 'SENT' || status === 'SIMULATED', status };
}

// 1. Request Submitted
export async function sendRequestSubmittedEmail({ hospitalEmail, requestNumber, bloodGroup, component, quantity, bloodBankName }) {
  const html = createEmailShell(
    'Blood Request Submitted',
    `
      <span class="badge">Request Submitted</span>
      <h2 style="margin-top: 12px; color: ${TEXT_DARK};">Blood Product Request Created</h2>
      <p>Your emergency blood request has been successfully registered and transmitted to <strong>${bloodBankName}</strong> for inventory validation.</p>
      <div class="card">
        <table>
          <tr><td class="label">Request Number:</td><td class="value">${requestNumber}</td></tr>
          <tr><td class="label">Blood Group:</td><td class="value">${bloodGroup}</td></tr>
          <tr><td class="label">Component:</td><td class="value">${component}</td></tr>
          <tr><td class="label">Quantity:</td><td class="value">${quantity} Units</td></tr>
          <tr><td class="label">Target Blood Bank:</td><td class="value">${bloodBankName}</td></tr>
        </table>
      </div>
      <p>You will receive further status updates as the blood bank evaluates stock compatibility.</p>
    `
  );
  return sendEmail({ to: hospitalEmail, subject: `[LifeDrone] Blood Request Registered: ${requestNumber}`, templateName: 'REQUEST_SUBMITTED', html });
}

// 2. Request Accepted
export async function sendRequestAcceptedEmail({ hospitalEmail, requestNumber, bloodBankName, quantity, bloodGroup }) {
  const html = createEmailShell(
    'Request Accepted',
    `
      <span class="badge" style="background:#ECFDF5; color:#16A34A;">Approved by Blood Bank</span>
      <h2 style="margin-top: 12px; color: ${TEXT_DARK};">Blood Request Accepted</h2>
      <p>Great news: <strong>${bloodBankName}</strong> has accepted request <strong>${requestNumber}</strong>. Required stock (${quantity} units of ${bloodGroup}) has been reserved in cold inventory.</p>
      <p>The blood bank operations team is currently initiating medical packaging and cold-chain compliance checks.</p>
    `
  );
  return sendEmail({ to: hospitalEmail, subject: `[LifeDrone] Request Accepted: ${requestNumber}`, templateName: 'REQUEST_ACCEPTED', html });
}

// 3. Request Rejected
export async function sendRequestRejectedEmail({ hospitalEmail, requestNumber, bloodBankName, reason }) {
  const html = createEmailShell(
    'Request Declined',
    `
      <span class="badge" style="background:#FEF2F2; color:#DC2626;">Declined</span>
      <h2 style="margin-top: 12px; color: ${TEXT_DARK};">Blood Request Cannot Be Fulfilled</h2>
      <p>We regret to inform you that <strong>${bloodBankName}</strong> could not fulfill request <strong>${requestNumber}</strong>.</p>
      <div class="card">
        <table>
          <tr><td class="label">Reason provided:</td><td class="value" style="color:#DC2626;">${reason || 'Stock depletion or compatibility constraint'}</td></tr>
        </table>
      </div>
      <p>Please initiate a request with another participating blood bank in the Prakasam network immediately.</p>
    `
  );
  return sendEmail({ to: hospitalEmail, subject: `[LifeDrone] Request Declined: ${requestNumber}`, templateName: 'REQUEST_REJECTED', html });
}

// 4. Dispatch Alert with Passkey for Designated Receiver
export async function sendDispatchAlertWithPasskey({ receiverEmail, receiverName, requestNumber, deliveryRef, droneId, etaMinutes, passkey, hospitalName }) {
  const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
  const html = createEmailShell(
    'Drone Dispatched & Delivery Passkey',
    `
      <span class="badge" style="background:#EFF6FF; color:${BRAND_COLOR};">Drone In Flight</span>
      <h2 style="margin-top: 12px; color: ${TEXT_DARK};">Medical Drone Dispatched to ${hospitalName}</h2>
      <p>Hello <strong>${receiverName}</strong>, drone <strong>${droneId}</strong> has departed vertiport with emergency blood payload for request <strong>${requestNumber}</strong>.</p>
      
      <div class="card">
        <table>
          <tr><td class="label">Delivery Ref:</td><td class="value">${deliveryRef}</td></tr>
          <tr><td class="label">Estimated Arrival:</td><td class="value">${etaMinutes} minutes</td></tr>
          <tr><td class="label">Designated Receiver:</td><td class="value">${receiverName}</td></tr>
        </table>
      </div>

      <div class="passkey-box">
        <div style="font-size: 13px; font-weight: 700; color: #047857; text-transform: uppercase;">Confidential Single-Use Delivery Passkey</div>
        <div class="passkey-code">${passkey}</div>
        <p style="margin: 0; font-size: 12px; color: #065F46;">
          Enter this 6-digit code at the hospital vertipad terminal upon drone arrival to unlock and confirm receipt.
          <br /><strong>Valid for 60 minutes. Single-use only.</strong>
        </p>
      </div>

      <p style="text-align: center;">
        <a href="${appBaseUrl}/hospital/dashboard" class="btn">View Live Tracking & Passkey Console</a>
      </p>
    `
  );
  return sendEmail({ to: receiverEmail, subject: `[LifeDrone URGENT] Delivery Passkey: ${requestNumber} Dispatched`, templateName: 'DISPATCH_WITH_PASSKEY', html });
}

// 5. 5-Minute Periodic Tracking Progress Update
export async function sendProgressUpdateEmail({ receiverEmail, deliveryRef, droneId, currentStatus, currentWaypoint, etaMinutes, batteryPct }) {
  const html = createEmailShell(
    'Delivery Progress Update',
    `
      <span class="badge">In-Flight Telemetry Update</span>
      <h2 style="margin-top: 12px; color: ${TEXT_DARK};">Flight Progress: ${deliveryRef}</h2>
      <p>Periodic 5-minute status ping for active drone flight.</p>
      <div class="card">
        <table>
          <tr><td class="label">Drone ID:</td><td class="value">${droneId}</td></tr>
          <tr><td class="label">Status:</td><td class="value">${currentStatus}</td></tr>
          <tr><td class="label">Near Corridor:</td><td class="value">${currentWaypoint}</td></tr>
          <tr><td class="label">Remaining ETA:</td><td class="value">${etaMinutes} min</td></tr>
          <tr><td class="label">Battery Telemetry:</td><td class="value">${batteryPct}%</td></tr>
        </table>
      </div>
      <p style="font-size: 13px; color: #64748B;">
        Simulated telemetry mode. Keep your 6-digit delivery passkey ready for vertipad touchdown verification.
      </p>
    `
  );
  return sendEmail({ to: receiverEmail, subject: `[LifeDrone] 5-Min Flight Update: ${deliveryRef} (${etaMinutes} min remaining)`, templateName: 'FIVE_MINUTE_PROGRESS', html });
}

// 6. Arrival Alert
export async function sendArrivalAlertEmail({ receiverEmail, deliveryRef, droneId, hospitalName }) {
  const html = createEmailShell(
    'Drone Touched Down',
    `
      <span class="badge" style="background:#FEF3C7; color:#D97706;">Arrived at Vertipad</span>
      <h2 style="margin-top: 12px; color: ${TEXT_DARK};">Medical Drone Has Landed</h2>
      <p>Drone <strong>${droneId}</strong> carrying blood delivery <strong>${deliveryRef}</strong> has safely touched down at <strong>${hospitalName}</strong> Vertipad.</p>
      <p>Please proceed to the receiving vertipad and enter the single-use passkey to unlock the thermal payload box.</p>
    `
  );
  return sendEmail({ to: receiverEmail, subject: `[LifeDrone ARRIVAL] Drone Landed at Vertipad: ${deliveryRef}`, templateName: 'DELIVERY_ARRIVED', html });
}

// 7. Delivery Completed Receipt
export async function sendDeliveryCompletedEmail({ receiverEmail, deliveryRef, receiverName, hospitalName, completedAt }) {
  const html = createEmailShell(
    'Delivery Completed Receipt',
    `
      <span class="badge" style="background:#ECFDF5; color:#16A34A;">Handover Complete</span>
      <h2 style="margin-top: 12px; color: ${TEXT_DARK};">Blood Handover Confirmed</h2>
      <p>Delivery <strong>${deliveryRef}</strong> has been successfully verified and completed.</p>
      <div class="card">
        <table>
          <tr><td class="label">Verified Receiver:</td><td class="value">${receiverName}</td></tr>
          <tr><td class="label">Hospital:</td><td class="value">${hospitalName}</td></tr>
          <tr><td class="label">Completed Timestamp:</td><td class="value">${completedAt}</td></tr>
          <tr><td class="label">Passkey Status:</td><td class="value" style="color:#16A34A;">Consumed & Deactivated</td></tr>
        </table>
      </div>
      <p>Thank you for ensuring secure and rapid life-saving transfusion logistics.</p>
    `
  );
  return sendEmail({ to: receiverEmail, subject: `[LifeDrone SUCCESS] Delivery Handover Confirmed: ${deliveryRef}`, templateName: 'DELIVERY_COMPLETED', html });
}

// 8. Contact Inquiry Acknowledgement & Project Notification
export async function sendContactEmails({ fullName, email, organizationName, organizationType, subject, message }) {
  const projectEmail = process.env.PROJECT_CONTACT_EMAIL || 'emergency@lifedrone.io';

  // Ack to user
  const userHtml = createEmailShell(
    'Inquiry Received',
    `
      <h2>Thank You for Contacting LifeDrone</h2>
      <p>Hello <strong>${fullName}</strong>,</p>
      <p>We have received your message regarding the LifeDrone Emergency Blood Delivery Network pilot in Prakasam district. Our operations and technical team will review your inquiry shortly.</p>
      <div class="card">
        <table>
          <tr><td class="label">Organization:</td><td class="value">${organizationName} (${organizationType})</td></tr>
          <tr><td class="label">Subject:</td><td class="value">${subject}</td></tr>
        </table>
      </div>
    `
  );
  await sendEmail({ to: email, subject: `[LifeDrone] We Received Your Inquiry: ${subject}`, templateName: 'CONTACT_USER_ACK', html: userHtml });

  // Notification to admin
  const adminHtml = createEmailShell(
    'New Contact Inquiry',
    `
      <h2>New Partnership / Contact Inquiry</h2>
      <div class="card">
        <table>
          <tr><td class="label">From:</td><td class="value">${fullName} (${email})</td></tr>
          <tr><td class="label">Organization:</td><td class="value">${organizationName} [${organizationType}]</td></tr>
          <tr><td class="label">Subject:</td><td class="value">${subject}</td></tr>
          <tr><td class="label">Message:</td><td class="value">${message}</td></tr>
        </table>
      </div>
    `
  );
  await sendEmail({ to: projectEmail, subject: `[LifeDrone Contact] ${subject} - ${organizationName}`, templateName: 'CONTACT_ADMIN_ALERT', html: adminHtml });
}
