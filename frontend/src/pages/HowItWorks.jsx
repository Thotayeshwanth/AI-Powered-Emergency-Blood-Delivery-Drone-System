import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  ExternalLink, 
  CheckCircle2, 
  ArrowDown, 
  Cpu, 
  Database, 
  Server, 
  Mail, 
  Map, 
  Lock, 
  Compass,
  FileText,
  Activity
} from 'lucide-react';

export default function HowItWorks() {
  const references = [
    {
      title: 'Design and Optimization of Medical Drone Delivery Networks for Emergency Logistics',
      author: 'King Fahd University of Petroleum and Minerals (KFUPM Thesis)',
      url: 'https://eprints.kfupm.edu.sa/id/eprint/142393/2/Thesis_201473720.pdf'
    },
    {
      title: 'Adopting Drone Technology for Blood Delivery: A Feasibility Study to Evaluate Efficiency and Sustainability',
      author: 'ResearchGate Journal of Healthcare Logistics',
      url: 'https://www.researchgate.net/publication/392930487_Adopting_drone_technology_for_blood_delivery_a_feasibility_study_to_evaluate_its_efficiency_and_sustainability'
    },
    {
      title: 'Evaluating Unmanned Aerial Vehicle (UAV) Delivery for Essential Medical Supplies & Blood Products: A Systematic Trial',
      author: 'The Lancet Global Health',
      url: 'https://www.thelancet.com/journals/langlo/article/PIIS2214-109X(22)00272-8/fulltext'
    }
  ];

  const workflowSteps = [
    { title: 'Hospital', desc: 'Clinical emergency department triggers blood product requirement.' },
    { title: 'Blood Availability Search', desc: 'Hospital queries real-time regional blood bank stock & compatibility.' },
    { title: 'Request Submitted', desc: 'Patient reference, required-by time, and authorized receiver recorded in MySQL.' },
    { title: 'Blood Bank Approval', desc: 'Blood bank verifies inventory availability and reserves units transactionally.' },
    { title: 'Package Preparation', desc: 'Operational cold-chain verification (+2°C to +6°C) and tamper-proof sealing.' },
    { title: 'Route Planning', desc: 'Backend A* algorithm calculates optimal corridor waypoints & flight duration.' },
    { title: 'Drone Dispatch', desc: 'Simulated drone liftoff; cryptographic single-use passkey issued.' },
    { title: 'Delivery Notifications', desc: 'Hospital receiver receives dispatch alert and periodic 5-minute flight pings.' },
    { title: 'Passkey Verification', desc: 'Receiver enters 6-digit confidential code at touchdown vertipad.' },
    { title: 'Delivery Completed', desc: 'Passkey atomically consumed, custody verified, completion email generated.' }
  ];

  const techStack = [
    { name: 'React & Vite', icon: Activity, desc: 'Responsive single-page application with modern light-theme component system.' },
    { name: 'Node.js & Express.js', icon: Server, desc: 'RESTful API architecture with transactional processing and rate-limited endpoints.' },
    { name: 'MySQL Relational Database', icon: Database, desc: 'ACID-compliant persistent storage with foreign keys, indexes, and audit trails.' },
    { name: 'SMTP Email via Nodemailer', icon: Mail, desc: 'Automated HTML notifications for order status and 5-minute flight progress.' },
    { name: 'A* Pathfinding Algorithm', icon: Compass, desc: 'Deterministic aerial graph search with Haversine distance admissible heuristic.' },
    { name: 'JWT & Bcrypt Security', icon: Lock, desc: 'Role-based authorization and cryptographic passkey salt-and-hash verification.' },
    { name: 'Leaflet & OpenStreetMap', icon: Map, desc: 'Interactive geographic visualization of vertipads, routes, and drone positions.' }
  ];

  return (
    <div style={{ backgroundColor: '#FFFFFF', paddingBottom: '90px' }}>
      
      {/* Page Header */}
      <div style={{ backgroundColor: '#F5F8FC', borderBottom: '1px solid #E2E8F0', padding: '60px 0' }}>
        <div className="container-custom">
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#124676', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Architecture &amp; Methodology
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#152238', margin: '10px 0 16px 0', letterSpacing: '-1px' }}>
            How LifeDrone Works
          </h1>
          <p style={{ fontSize: '17px', color: '#64748B', maxWidth: '720px' }}>
            A rigorous engineering breakdown of our autonomous emergency medical delivery workflow,
            scientific foundations, and technical architecture.
          </p>
        </div>
      </div>

      <div className="container-custom" style={{ marginTop: '60px' }}>

        {/* ====================================================
            SECTION A: PROBLEM STATEMENT
            ==================================================== */}
        <section style={{ marginBottom: '80px' }}>
          
          {/* Exact Problem Statement Box */}
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '2px solid #FCA5A5',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '48px',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626', fontWeight: '800', marginBottom: '14px', textTransform: 'uppercase', fontSize: '13px' }}>
              <AlertCircle size={20} />
              <span>Core Medical Logistics Problem Statement</span>
            </div>
            <blockquote
              style={{
                fontSize: '20px',
                fontWeight: '600',
                lineHeight: '1.6',
                color: '#991B1B',
                fontStyle: 'italic',
                margin: 0
              }}
            >
              &ldquo;Current medical logistics infrastructure fails to guarantee the rapid,
              secure, and temperature-compliant delivery of blood products during critical
              emergencies due to unpredictable ground delays and the lack of automated,
              intelligent aerial distribution networks.&rdquo;
            </blockquote>
          </div>

          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#152238', marginBottom: '16px' }}>
            The Challenge in Medical Logistics
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.7', marginBottom: '32px' }}>
            Blood products (Packed Red Blood Cells, Platelets, Cryoprecipitate, Fresh Frozen Plasma) have extremely perishable shelf lives and require stringent cold-chain adherence (+2°C to +6°C for RBCs, continuous agitation at +20°C to +24°C for platelets). Conventional ground ambulances face insurmountable bottlenecks:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '48px'
            }}
          >
            {[
              {
                title: 'Road Traffic & Unpredictable Delays',
                desc: 'Urban congestion and highway incidents can turn a 20-minute transit into over 90 minutes, exhausting emergency trauma resuscitations.'
              },
              {
                title: 'Difficult Access to Remote Locations',
                desc: 'Rural and taluk area hospitals often lack direct highway corridors, requiring lengthy detours across congested bypass roads.'
              },
              {
                title: 'Fragmented Coordination',
                desc: 'Lack of shared real-time inventory visibility leads to desperate manual phone calls between blood banks while emergency patients bleed out.'
              },
              {
                title: 'Limited Delivery Visibility',
                desc: 'Once blood packages leave the blood bank in conventional taxis or couriers, clinical teams have zero telemetry on actual ETA.'
              },
              {
                title: 'Temperature-Controlled Transport',
                desc: 'Unmonitored heat exposure causes hemolysis and bacterial contamination. Continuous temperature validation is legally and medically essential.'
              },
              {
                title: 'Accountable and Secure Handovers',
                desc: 'Critical medical cargo requires unbroken chain-of-custody verification to prevent package mix-ups and unverified deliveries.'
              }
            ].map((item) => (
              <div key={item.title} className="card-light" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#152238', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Academic References */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '28px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FileText size={18} color="#124676" />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#152238', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Academic &amp; Clinical Research References
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {references.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#124676';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(18, 70, 118, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#124676' }}>
                      [{idx + 1}] {ref.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      {ref.author}
                    </div>
                  </div>
                  <ExternalLink size={16} color="#124676" style={{ flexShrink: 0, marginLeft: '12px' }} />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================
            SECTION B: OUR SOLUTION
            ==================================================== */}
        <section style={{ marginBottom: '80px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#D2252F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            System Architecture
          </span>
          <h2 style={{ fontSize: '34px', fontWeight: '800', color: '#152238', margin: '10px 0 20px 0' }}>
            Introducing LifeDrone
          </h2>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '32px',
              lineHeight: '1.8',
              fontSize: '16px',
              color: '#152238',
              marginBottom: '40px'
            }}
          >
            <p style={{ marginBottom: '16px' }}>
              <strong>LifeDrone is an AI-powered blood delivery coordination system designed to connect hospitals and blood banks through an organized, secure, and trackable workflow.</strong>
            </p>
            <p style={{ marginBottom: '16px', color: '#64748B' }}>
              Hospital administrators can search participating blood banks for required blood products and submit requests based on availability. Blood bank personnel review requests, confirm inventory, and prepare approved orders.
            </p>
            <p style={{ marginBottom: '16px', color: '#64748B' }}>
              After package preparation, authorized blood bank staff configure the delivery destination and dispatch information. The system plans a route using the A* algorithm and presents the delivery progress to authorized hospital and blood bank users.
            </p>
            <p style={{ marginBottom: '16px', color: '#64748B' }}>
              Email notifications keep the hospital's designated receiver informed about important delivery events and periodic progress updates.
            </p>
            <p style={{ color: '#152238', fontWeight: '500' }}>
              At delivery, an authorized hospital receiver enters a unique, single-use, time-limited passkey. The system verifies the token and confirms the handover. Once successfully used, the passkey cannot be reused.
            </p>
          </div>

          {/* Animated/Structured Workflow Diagram */}
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#152238', marginBottom: '20px' }}>
            Operational Pipeline Flow
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxWidth: '650px',
              margin: '0 auto'
            }}
          >
            {workflowSteps.map((step, idx) => (
              <React.Fragment key={step.title}>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: idx === workflowSteps.length - 1 ? '#ECFDF5' : '#EEF5FA',
                      color: idx === workflowSteps.length - 1 ? '#16A34A' : '#124676',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '13px',
                      flexShrink: 0
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#152238' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>
                      {step.desc}
                    </div>
                  </div>
                </div>

                {idx < workflowSteps.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ArrowDown size={18} color="#94A3B8" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* ====================================================
            SECTION C: TECHNOLOGY OVERVIEW
            ==================================================== */}
        <section>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#124676', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Implementation Stack
          </span>
          <h2 style={{ fontSize: '34px', fontWeight: '800', color: '#152238', margin: '10px 0 20px 0' }}>
            Technology Overview
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.6', marginBottom: '32px' }}>
            Engineered with a clean separation of concerns, transactional safety, and non-blocking asynchronous event processing:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}
          >
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <div key={tech.name} className="card-light" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#EEF5FA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#124676'
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#152238' }}>{tech.name}</h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
                    {tech.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div
            style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #B8D3E9',
              borderRadius: '12px',
              padding: '20px',
              fontSize: '14px',
              color: '#0D375E',
              lineHeight: '1.6'
            }}
          >
            <strong>Engineering Integrity Note:</strong> For this MVP, deterministic A* route planning and rule-based workflow automation are utilized. The code structure is designed with clean service abstraction layers so that predictive AI modules (e.g., blood stock shortage forecasting and meteorological flight disruption modeling) can be plugged in without refactoring core APIs.
          </div>
        </section>

      </div>
    </div>
  );
}
