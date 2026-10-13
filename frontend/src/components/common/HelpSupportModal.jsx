import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Bot, 
  PhoneCall, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  CornerDownRight,
  RefreshCw,
  Phone,
  Mail,
  ChevronLeft
} from 'lucide-react';
import { supportAPI } from '../../services/api';

export default function HelpSupportModal({ isOpen, onClose }) {
  const [activeView, setActiveView] = useState('select'); // 'select' | 'chatbot' | 'human'
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am the **LifeDrone Dedicated AI Assistant**. I can help you with emergency blood requests, A* flight corridor routing, single-use passkey verification, and blood bank operations across Prakasam District.\n\nHow can I assist your medical delivery today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Human callback form state
  const [callbackData, setCallbackData] = useState({
    name: '',
    phone: '',
    hospitalOrBank: '',
    urgency: 'HIGH',
    reason: ''
  });
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeView === 'chatbot') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeView]);

  if (!isOpen) return null;

  const handleSend = async (customText = null) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await supportAPI.chat({
        message: textToSend.trim(),
        conversationHistory: messages.slice(-4)
      });

      if (res.data?.success && res.data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: res.data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: res.data.source
          }
        ]);
      } else {
        throw new Error('No reply from LifeDrone AI');
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "I am having temporary connectivity issues. You can ask directly about blood requests, route planning, or single-use passkeys, or connect to our 24/7 Human Dispatch Desk.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    if (!callbackData.name || !callbackData.phone) return;
    setCallbackLoading(true);
    try {
      const res = await supportAPI.requestCallback(callbackData);
      if (res.data?.success) {
        setCallbackSuccess(true);
      }
    } catch (err) {
      console.error('Callback error:', err);
      alert('Unable to send callback request. Please call our direct hotline at +91-8592-280100.');
    } finally {
      setCallbackLoading(false);
    }
  };

  const quickPrompts = [
    "How do I request emergency blood?",
    "How does the single-use passkey work?",
    "What vertipads are in Prakasam District?",
    "How fast does the delivery drone travel?",
    "What are the cold chain storage requirements?"
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: activeView === 'chatbot' ? '680px' : '620px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(18, 70, 118, 0.25)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activeView !== 'select' && (
              <button
                onClick={() => setActiveView('select')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px',
                  borderRadius: '8px',
                  color: '#64748B',
                  backgroundColor: '#F1F5F9'
                }}
                title="Back to Support Options"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: activeView === 'human' ? '#ECFDF5' : '#EEF5FA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeView === 'human' ? '#16A34A' : '#124676'
              }}
            >
              {activeView === 'human' ? <PhoneCall size={20} /> : <Bot size={20} />}
            </div>

            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#152238', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeView === 'select' && 'LifeDrone Assistance & Support Hub'}
                {activeView === 'chatbot' && 'LifeDrone AI Assistant'}
                {activeView === 'human' && '24/7 Human Emergency Dispatch Desk'}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                {activeView === 'select' && 'Choose AI Consultation or Direct Operational Contact'}
                {activeView === 'chatbot' && 'Dedicated to LifeDrone operations • Powered by Gemini AI'}
                {activeView === 'human' && 'Prakasam District Drone & Blood Logistics Ops'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              color: '#94A3B8',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* View 1: Selection Cards */}
        {activeView === 'select' && (
          <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#124676', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                How Can We Help You?
              </span>
              <h4 style={{ fontSize: '22px', fontWeight: '800', color: '#152238', marginTop: '4px' }}>
                Select Your Support Channel
              </h4>
              <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '460px', margin: '6px auto 0 auto' }}>
                Get instant answers from our trained LifeDrone AI, or connect with our human dispatch coordinators.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              {/* Option A: LifeDrone Chatbot */}
              <div
                onClick={() => setActiveView('chatbot')}
                className="card-sharp-hover"
                style={{
                  padding: '24px',
                  cursor: 'pointer',
                  border: '2px solid #B8D3E9',
                  backgroundColor: '#F8FAFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderRadius: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#124676',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(18, 70, 118, 0.3)'
                    }}
                  >
                    <Sparkles size={22} />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#124676',
                      backgroundColor: '#EEF5FA',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      border: '1px solid #B8D3E9'
                    }}
                  >
                    Gemini AI Powered
                  </span>
                </div>

                <div>
                  <h5 style={{ fontSize: '17px', fontWeight: '800', color: '#152238', marginBottom: '4px' }}>
                    LifeDrone AI Assistant
                  </h5>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
                    Instant intelligent answers on blood inventory search, A* flight paths, passkey security, and hospital workflows.
                  </p>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#124676' }}>
                  <span>Launch AI Assistant</span>
                  <CornerDownRight size={15} />
                </div>
              </div>

              {/* Option B: Human Support */}
              <div
                onClick={() => setActiveView('human')}
                className="card-sharp-hover"
                style={{
                  padding: '24px',
                  cursor: 'pointer',
                  border: '2px solid #BBF7D0',
                  backgroundColor: '#F8FDF9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderRadius: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                    }}
                  >
                    <PhoneCall size={22} />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#16A34A',
                      backgroundColor: '#DCFCE7',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      border: '1px solid #BBF7D0'
                    }}
                  >
                    24/7 Human Dispatch
                  </span>
                </div>

                <div>
                  <h5 style={{ fontSize: '17px', fontWeight: '800', color: '#152238', marginBottom: '4px' }}>
                    Human Support Desk
                  </h5>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
                    Speak directly with a blood logistics coordinator, request an urgent callback, or coordinate emergency overrides.
                  </p>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#16A34A' }}>
                  <span>Connect with Dispatcher</span>
                  <CornerDownRight size={15} />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: '#F1F5F9',
                fontSize: '12px',
                color: '#64748B'
              }}
            >
              <ShieldCheck size={16} color="#D2252F" style={{ flexShrink: 0 }} />
              <span>
                <strong>Safety Notice:</strong> For critical medical trauma emergencies, always alert the attending surgeon and hospital blood bank supervisor immediately.
              </span>
            </div>
          </div>
        )}

        {/* View 2: Interactive AI Chatbot */}
        {activeView === 'chatbot' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '580px' }}>
            {/* Quick Prompt Chips */}
            <div
              style={{
                padding: '10px 18px',
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: '#FFFFFF',
                    color: '#0D375E',
                    border: '1px solid #B8D3E9',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#EEF5FA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div
              style={{
                flex: 1,
                padding: '18px 22px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                backgroundColor: '#FFFFFF'
              }}
            >
              {messages.map((m, idx) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: isUser ? 'row-reverse' : 'row',
                      gap: '10px',
                      alignItems: 'flex-start'
                    }}
                  >
                    {!isUser && (
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#124676',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Bot size={18} />
                      </div>
                    )}

                    <div
                      style={{
                        maxWidth: '82%',
                        backgroundColor: isUser ? '#124676' : '#F8FAFC',
                        color: isUser ? '#FFFFFF' : '#152238',
                        padding: '12px 16px',
                        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        border: isUser ? 'none' : '1px solid #E2E8F0',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        boxShadow: isUser ? '0 4px 12px rgba(18, 70, 118, 0.2)' : 'none'
                      }}
                    >
                      {m.text}
                      <div
                        style={{
                          fontSize: '10px',
                          color: isUser ? 'rgba(255, 255, 255, 0.75)' : '#94A3B8',
                          marginTop: '4px',
                          textAlign: isUser ? 'right' : 'left'
                        }}
                      >
                        {m.time}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#124676',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Bot size={18} />
                  </div>
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      padding: '10px 16px',
                      borderRadius: '16px 16px 16px 4px',
                      border: '1px solid #E2E8F0',
                      fontSize: '13px',
                      color: '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Analyzing LifeDrone knowledge base...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder="Ask anything about LifeDrone blood delivery or corridors..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#152238'
                }}
              />

              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || loading}
                className="btn-primary"
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  opacity: !inputText.trim() || loading ? 0.6 : 1
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* View 3: Human Emergency Support */}
        {activeView === 'human' && (
          <div style={{ padding: '24px 28px', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {/* Direct Hotline */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>
                  <Phone size={16} />
                  <span>24/7 Operations Hotline</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#065F46' }}>
                  +91-8592-280100
                </div>
                <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>
                  Direct line to Ongole Vertipad Dispatch Desk
                </div>
                <a
                  href="tel:+918592280100"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '10px',
                    padding: '6px 12px',
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}
                >
                  <Phone size={12} />
                  <span>Call Hotline Now</span>
                </a>
              </div>

              {/* Email Desk */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  backgroundColor: '#EEF5FA',
                  border: '1px solid #B8D3E9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#124676', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>
                  <Mail size={16} />
                  <span>Emergency Email Desk</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0D375E' }}>
                  emergency@lifedrone.io
                </div>
                <div style={{ fontSize: '12px', color: '#124676', marginTop: '4px' }}>
                  Monitored continuously by duty flight operators
                </div>
                <a
                  href="mailto:emergency@lifedrone.io"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '10px',
                    padding: '6px 12px',
                    backgroundColor: '#124676',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}
                >
                  <Mail size={12} />
                  <span>Compose Email</span>
                </a>
              </div>
            </div>

            {/* Callback Request Form */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <h5 style={{ fontSize: '15px', fontWeight: '800', color: '#152238', marginBottom: '6px' }}>
                Request Urgent Coordinator Callback
              </h5>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                Leave your details below and a regional flight controller will contact your medical facility within 2 minutes.
              </p>

              {callbackSuccess ? (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <CheckCircle2 size={20} color="#16A34A" />
                  <div>
                    <strong>Callback Dispatched!</strong> An Ongole flight operator has been assigned and will call you immediately.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={callbackData.name}
                        onChange={(e) => setCallbackData({ ...callbackData, name: e.target.value })}
                        placeholder="Dr. / Officer Name"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                        Direct Mobile / Ext *
                      </label>
                      <input
                        type="tel"
                        required
                        value={callbackData.phone}
                        onChange={(e) => setCallbackData({ ...callbackData, phone: e.target.value })}
                        placeholder="+91-9876543210"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                        Hospital / Blood Bank Facility
                      </label>
                      <input
                        type="text"
                        value={callbackData.hospitalOrBank}
                        onChange={(e) => setCallbackData({ ...callbackData, hospitalOrBank: e.target.value })}
                        placeholder="e.g., RIMS Ongole Trauma Unit"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                        Urgency Level
                      </label>
                      <select
                        value={callbackData.urgency}
                        onChange={(e) => setCallbackData({ ...callbackData, urgency: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <option value="CRITICAL">Critical (Immediate)</option>
                        <option value="HIGH">High (Within 5m)</option>
                        <option value="ROUTINE">Routine Coordination</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                      Reason for Callback (Optional)
                    </label>
                    <input
                      type="text"
                      value={callbackData.reason}
                      onChange={(e) => setCallbackData({ ...callbackData, reason: e.target.value })}
                      placeholder="e.g. Urgent blood pack dispatch coordination"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={callbackLoading}
                    className="btn-primary"
                    style={{
                      marginTop: '6px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      justifyContent: 'center'
                    }}
                  >
                    {callbackLoading ? 'Registering with Command Desk...' : 'Request Emergency Callback'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
