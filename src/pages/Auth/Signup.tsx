import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignupPage: React.FC = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!age) return;
        const result = await signup(email, pass, name, Number(age));
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Signup failed. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
            <h1>Start Your Journey</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Join us to build better habits.</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        className="form-input"
                        type="text"
                        placeholder="First Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        className="form-input"
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={e => setAge(Number(e.target.value))}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        className="form-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        className="form-input"
                        type="password"
                        placeholder="Password"
                        value={pass}
                        onChange={e => setPass(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Account</button>
            </form>

            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
                Already have an account? <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>Sign In</button>
            </p>
        </div>
    );
};

export default SignupPage;
