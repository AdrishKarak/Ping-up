import { assets } from '../assets/assets';
import { Star } from 'lucide-react';
import { SignIn } from '@clerk/react';
import { useEffect, useRef } from 'react';

const FloatingOrb = ({ style, delay = 0 }) => (
    <div
        className="floating-orb"
        style={{
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animationDelay: `${delay}s`,
            pointerEvents: 'none',
            ...style
        }}
    />
);

const ParticleDot = ({ x, y, size, opacity, delay }) => (
    <div style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(139, 92, 246, 0.6)',
        opacity,
        animation: `particlePulse ${2 + delay}s ease-in-out ${delay}s infinite`,
        pointerEvents: 'none'
    }} />
);

const Login = () => {
    const containerRef = useRef(null);
    const glowRef = useRef(null);

    const particles = Array.from({ length: 18 }, (_, i) => ({
        x: `${5 + (i * 5.5) % 90}%`,
        y: `${10 + (i * 7.3) % 80}%`,
        size: `${2 + (i % 3)}px`,
        opacity: 0.2 + (i % 5) * 0.12,
        delay: (i * 0.4) % 3
    }));

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (glowRef.current) {
                glowRef.current.style.left = `${x}px`;
                glowRef.current.style.top = `${y}px`;
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .pingup-root {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: row;
                    position: relative;
                    overflow: hidden;
                    background: #06040f;
                    font-family: 'DM Sans', sans-serif;
                }

                @keyframes orbFloat1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -60px) scale(1.08); }
                    66% { transform: translate(-30px, 40px) scale(0.95); }
                }
                @keyframes orbFloat2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    40% { transform: translate(-50px, 30px) scale(1.12); }
                    70% { transform: translate(60px, -40px) scale(0.9); }
                }
                @keyframes orbFloat3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(30px, 50px) scale(1.05); }
                }
                @keyframes particlePulse {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.8); }
                }
                @keyframes slideReveal {
                    0% { opacity: 0; transform: translateY(32px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes logoEntrance {
                    0% { opacity: 0; transform: translateX(-20px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                @keyframes starSpin {
                    0% { transform: rotate(0deg) scale(1); }
                    50% { transform: rotate(180deg) scale(1.2); }
                    100% { transform: rotate(360deg) scale(1); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes svgWave {
                    0% { d: path("M0,60 C120,20 240,100 360,55 C480,10 600,80 720,45 L720,140 L0,140 Z"); }
                    50% { d: path("M0,80 C100,40 220,120 360,70 C500,20 620,90 720,60 L720,140 L0,140 Z"); }
                    100% { d: path("M0,60 C120,20 240,100 360,55 C480,10 600,80 720,45 L720,140 L0,140 Z"); }
                }
                @keyframes ringPulse {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.35; transform: scale(1.05); }
                }
                @keyframes fadeSlideUp {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                @keyframes lineGrow {
                    0% { width: 0; opacity: 0; }
                    100% { width: 60px; opacity: 1; }
                }
                @keyframes countUp {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .floating-orb { animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
                .orb1 { animation-name: orbFloat1; animation-duration: 9s; }
                .orb2 { animation-name: orbFloat2; animation-duration: 13s; }
                .orb3 { animation-name: orbFloat3; animation-duration: 11s; }

                .left-panel {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 2.5rem 3rem 3rem;
                    position: relative;
                    z-index: 2;
                }
                .right-panel {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    position: relative;
                    z-index: 2;
                }

                .logo-wrap {
                    animation: logoEntrance 0.7s cubic-bezier(0.22,1,0.36,1) both;
                }
                .logo-wrap img { height: 44px; object-fit: contain; filter: brightness(1.2); }

                .hero-content {
                    animation: slideReveal 0.9s cubic-bezier(0.22,1,0.36,1) 0.2s both;
                }

                .stars-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 1.5rem;
                }
                .stars-row img { height: 36px; border-radius: 20px; border: 2px solid rgba(139,92,246,0.3); }
                .star-icon {
                    transition: transform 0.3s ease;
                }
                .star-icon:hover { animation: starSpin 0.6s ease forwards; }
                .stars-label {
                    font-size: 0.82rem;
                    color: rgba(200,190,240,0.7);
                    font-family: 'DM Sans', sans-serif;
                    letter-spacing: 0.02em;
                }

                .hero-title {
                    font-family: 'Syne', sans-serif;
                    font-size: clamp(2.4rem, 5vw, 4.2rem);
                    font-weight: 800;
                    line-height: 1.05;
                    letter-spacing: -0.03em;
                    background: linear-gradient(135deg, #f0edff 0%, #c4b5fd 40%, #a78bfa 70%, #7c3aed 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 4s linear infinite;
                    margin-bottom: 1rem;
                }

                .hero-sub {
                    font-size: clamp(1rem, 2vw, 1.2rem);
                    font-weight: 300;
                    color: rgba(196, 181, 253, 0.75);
                    max-width: 360px;
                    line-height: 1.6;
                    animation: fadeSlideUp 1s 0.5s both;
                }

                .accent-line {
                    display: block;
                    height: 2px;
                    background: linear-gradient(90deg, #7c3aed, #a78bfa, transparent);
                    margin: 1.2rem 0;
                    animation: lineGrow 1s cubic-bezier(0.22,1,0.36,1) 0.7s both;
                    border-radius: 2px;
                }

                .cursor-glow {
                    position: absolute;
                    width: 400px;
                    height: 400px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                    z-index: 1;
                }

                .sign-in-glass {
                    position: relative;
                    border-radius: 24px;
                    padding: 3px;
                    background: linear-gradient(135deg, rgba(139,92,246,0.5), rgba(99,102,241,0.2), rgba(139,92,246,0.4));
                    box-shadow:
                        0 0 0 1px rgba(139,92,246,0.15),
                        0 40px 80px rgba(0,0,0,0.6),
                        0 0 60px rgba(124,58,237,0.08),
                        inset 0 1px 0 rgba(255,255,255,0.07);
                    animation: fadeSlideUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.1s both;
                    transition: box-shadow 0.4s ease, transform 0.4s ease;
                }
                .sign-in-glass:hover {
                    box-shadow:
                        0 0 0 1px rgba(139,92,246,0.3),
                        0 50px 100px rgba(0,0,0,0.7),
                        0 0 80px rgba(124,58,237,0.14),
                        inset 0 1px 0 rgba(255,255,255,0.1);
                    transform: translateY(-2px);
                }
                .sign-in-inner {
                    border-radius: 22px;
                    overflow: hidden;
                    background: rgba(12, 8, 24, 0.85);
                    backdrop-filter: blur(40px) saturate(150%);
                    -webkit-backdrop-filter: blur(40px) saturate(150%);
                }

                .ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px solid rgba(139,92,246,0.2);
                    animation: ringPulse 4s ease-in-out infinite;
                    pointer-events: none;
                }

                .bottom-tag {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    animation: fadeSlideUp 1s 0.9s both;
                }
                .tag-dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    background: #7c3aed;
                    animation: glowPulse 2s ease-in-out infinite;
                    box-shadow: 0 0 8px rgba(124,58,237,0.8);
                }
                .tag-text {
                    font-size: 0.78rem;
                    color: rgba(196,181,253,0.5);
                    font-family: 'DM Sans', sans-serif;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                /* Wave SVG */
                .wave-svg { position: absolute; bottom: 0; left: 0; width: 100%; pointer-events: none; }

                /* Clerk override for dark theme */
                .cl-rootBox, .cl-card {
                    background: transparent !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                .cl-headerTitle { color: #f0edff !important; font-family: 'Syne', sans-serif !important; }
                .cl-headerSubtitle { color: rgba(196,181,253,0.6) !important; }
                .cl-formFieldLabel { color: rgba(196,181,253,0.8) !important; }
                .cl-formFieldInput {
                    background: rgba(255,255,255,0.05) !important;
                    border-color: rgba(139,92,246,0.3) !important;
                    color: #f0edff !important;
                }
                .cl-formFieldInput:focus {
                    border-color: rgba(139,92,246,0.7) !important;
                    box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important;
                }
                .cl-formButtonPrimary {
                    background: linear-gradient(135deg, #7c3aed, #5b21b6) !important;
                    box-shadow: 0 4px 20px rgba(124,58,237,0.4) !important;
                    transition: all 0.2s !important;
                }
                .cl-formButtonPrimary:hover {
                    background: linear-gradient(135deg, #8b5cf6, #6d28d9) !important;
                    box-shadow: 0 6px 28px rgba(124,58,237,0.6) !important;
                    transform: translateY(-1px) !important;
                }
                .cl-socialButtonsBlockButton {
                    background: rgba(255,255,255,0.05) !important;
                    border-color: rgba(139,92,246,0.25) !important;
                    color: rgba(196,181,253,0.9) !important;
                    transition: all 0.2s !important;
                }
                .cl-socialButtonsBlockButton:hover {
                    background: rgba(139,92,246,0.12) !important;
                    border-color: rgba(139,92,246,0.5) !important;
                    transform: translateY(-1px) !important;
                }
                .cl-dividerLine { background: rgba(139,92,246,0.2) !important; }
                .cl-dividerText { color: rgba(196,181,253,0.4) !important; }
                .cl-footerActionText { color: rgba(196,181,253,0.5) !important; }
                .cl-footerActionLink { color: #a78bfa !important; }
                .cl-internal-b3fm6y { background: rgba(12,8,24,0.4) !important; }

                @media (max-width: 768px) {
                    .pingup-root { flex-direction: column; }
                    .left-panel { padding: 1.8rem 1.5rem; }
                    .right-panel { padding: 1.5rem; }
                }
            `}</style>

            <div className="pingup-root" ref={containerRef}>

                {/* Cursor glow */}
                <div className="cursor-glow" ref={glowRef} />

                {/* Background orbs */}
                <FloatingOrb className="orb1" style={{
                    width: 520, height: 520,
                    background: 'radial-gradient(circle, rgba(109,40,217,0.28) 0%, rgba(79,70,229,0.1) 60%, transparent 100%)',
                    top: '-100px', left: '-80px',
                }} delay={0} />
                <FloatingOrb className="orb2" style={{
                    width: 400, height: 400,
                    background: 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)',
                    top: '30%', right: '10%',
                }} delay={1.5} />
                <FloatingOrb className="orb3" style={{
                    width: 300, height: 300,
                    background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
                    bottom: '10%', left: '30%',
                }} delay={3} />

                {/* Animated particles */}
                {particles.map((p, i) => <ParticleDot key={i} {...p} />)}

                {/* Decorative rings */}
                <div className="ring" style={{ width: 600, height: 600, top: '-200px', left: '-200px', animationDelay: '0s' }} />
                <div className="ring" style={{ width: 800, height: 800, top: '-300px', left: '-300px', animationDelay: '1s', opacity: 0.08 }} />

                {/* Left Panel */}
                <div className="left-panel">
                    <div className="logo-wrap">
                        <img src={assets.logo} alt="PingUp" />
                    </div>

                    <div className="hero-content">
                        <div className="stars-row">
                            <img src={assets.group_users} alt="users" />
                            <div>
                                <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                                    {Array(5).fill(0).map((_, i) => (
                                        <Star key={i} className="star-icon" style={{ width: 16, height: 16, fill: '#f59e0b', color: 'transparent' }} />
                                    ))}
                                </div>
                                <p className="stars-label">Rated 5 stars by 1000+ users</p>
                            </div>
                        </div>

                        <h1 className="hero-title">
                            More than<br />just friends
                        </h1>

                        <span className="accent-line" />

                        <p className="hero-sub">
                            Connect with people who share your interests and passions.
                        </p>
                    </div>

                    <div className="bottom-tag">
                        <span className="tag-dot" />
                        <span className="tag-text">Premium Social Platform</span>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="right-panel">
                    {/* Decorative ring behind card */}
                    <div className="ring" style={{
                        width: 500, height: 500,
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        animationDelay: '2s'
                    }} />

                    <div className="sign-in-glass">
                        <div className="sign-in-inner">
                            <SignIn />
                        </div>
                    </div>
                </div>

                {/* Animated wave at bottom */}
                <svg className="wave-svg" viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ height: 80, opacity: 0.25 }}>
                    <defs>
                        <linearGradient id="waveGrad" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="#7c3aed" />
                            <stop offset="50%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#5b21b6" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#waveGrad)" d="M0,40 C240,70 480,10 720,40 C960,70 1200,20 1440,45 L1440,80 L0,80 Z">
                        <animate attributeName="d"
                            values="M0,40 C240,70 480,10 720,40 C960,70 1200,20 1440,45 L1440,80 L0,80 Z;
                                    M0,55 C200,20 440,70 720,50 C1000,30 1240,65 1440,40 L1440,80 L0,80 Z;
                                    M0,40 C240,70 480,10 720,40 C960,70 1200,20 1440,45 L1440,80 L0,80 Z"
                            dur="6s" repeatCount="indefinite" />
                    </path>
                </svg>
            </div>
        </>
    );
};

export default Login;