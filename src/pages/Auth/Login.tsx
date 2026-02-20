import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await login(email, pass);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Invalid credentials');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
            <h1>Welcome Back</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Sign in to continue building your systems.</p>

            <form onSubmit={handleSubmit}>
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

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign In</button>
            </form>

            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
                New here? <button onClick={() => navigate('/signup')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>Create Account</button>
            </p>
        </div>
    );
};

export default LoginPage;
