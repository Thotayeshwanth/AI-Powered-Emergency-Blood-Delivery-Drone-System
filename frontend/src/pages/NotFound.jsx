import React from 'react';
import { Link } from 'react-router-dom';
import { PlaneTakeoff, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: '#FFFFFF'
      }}
    >
      <div style={{ maxWidth: '480px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#EEF5FA',
            color: '#124676',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}
        >
          <PlaneTakeoff size={40} />
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#152238', marginBottom: '12px' }}>
          404 &bull; Page Not Found
        </h1>
        <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.6', marginBottom: '32px' }}>
          The flight route or page you are looking for does not exist in our airspace corridor.
        </p>
        <Link to="/" className="btn-primary">
          <ArrowLeft size={16} />
          <span>Return to LifeDrone Home</span>
        </Link>
      </div>
    </div>
  );
}
