
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Loader } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMssg, setErrorMssg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signInWithEmail } = useAuth(); // Note: we implemented this as (email, password) => ... in Context
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMssg('');
        setIsSubmitting(true);

        try {
            // @ts-ignore - casting signInWithEmail to accept password as per our implementation
            const { error } = await signInWithEmail(email, password);

            if (error) {
                setErrorMssg('Credenciales inválidas. Por favor intenta de nuevo.');
            } else {
                navigate('/admin');
            }
        } catch (err) {
            setErrorMssg('Ocurrió un error inesperado.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/5 rounded-lg shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="p-8 pb-0 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4 border border-white/10">
                        <Lock size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Admin Savage</h2>
                    <p className="text-gray-500 text-sm">Ingresa tus credenciales para continuar</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    {errorMssg && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-red-500 text-xs font-bold">
                            <AlertCircle size={14} />
                            {errorMssg}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                                    placeholder="admin@savage.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contraseña</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-white text-black font-bold uppercase tracking-widest py-3 rounded hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader size={16} className="animate-spin" /> Ingresando
                                </>
                            ) : (
                                'Ingresar'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
