import React from 'react';
import { Shield, Users, Trophy, Truck } from 'lucide-react';
import SEO from '../components/SEO';

const AboutUs: React.FC = () => {
    return (
        <div className="bg-black min-h-screen text-white pt-20">
            <SEO
                title="Nosotros - Savage Store Paraguay"
                description="Conoce la historia detrás de Savage Store, tu destino premium de streetwear y camisetas retro en Paraguay."
            />

            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=2000"
                    alt="Savage Team"
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-60"
                />
                <div className="relative z-20 text-center px-6 max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase glitch-effect">
                        Somos <span className="text-primary">Savage</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 font-medium leading-relaxed">
                        Más que una tienda, somos un movimiento. Redefiniendo el estilo urbano y la pasión por el fútbol en Paraguay desde 2026.
                    </p>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider border-l-4 border-primary pl-6">
                            Nuestra Historia
                        </h2>
                        <div className="space-y-6 text-gray-400 leading-loose text-lg">
                            <p>
                                Savage nació de una obsesión: la búsqueda de la perfección en el estilo. Nos dimos cuenta de que en Paraguay faltaba un lugar que fusionara la cultura del streetwear global con la pasión innegable por el fútbol retro y moderno.
                            </p>
                            <p>
                                Comenzamos como un pequeño proyecto de importación de camisetas exclusivas, pero nuestra comunidad exigía más. Querían calidad, querían exclusividad, y querían una experiencia que los hiciera sentir parte de algo grande.
                            </p>
                            <p>
                                Hoy, Savage Store es el referente número uno para quienes no se conforman con lo básico. Buscamos las piezas más codiciadas alrededor del mundo y las traemos directamente a tu puerta.
                            </p>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-primary/20 rounded-lg blur-xl group-hover:bg-primary/40 transition-all duration-500"></div>
                        <img
                            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000"
                            alt="Our Story"
                            className="relative rounded-lg shadow-2xl w-full object-cover h-[500px]"
                        />
                    </div>
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-20 bg-white/5 border-y border-white/10">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="p-8 bg-black/50 border border-white/10 rounded-xl hover:border-primary/50 transition-colors group">
                            <Shield className="w-12 h-12 text-gray-400 group-hover:text-primary mb-6 transition-colors" />
                            <h3 className="text-xl font-bold uppercase mb-3">Autenticidad</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Productos 100% originales y de la más alta calidad garantizada.</p>
                        </div>
                        <div className="p-8 bg-black/50 border border-white/10 rounded-xl hover:border-primary/50 transition-colors group">
                            <Truck className="w-12 h-12 text-gray-400 group-hover:text-primary mb-6 transition-colors" />
                            <h3 className="text-xl font-bold uppercase mb-3">Rapidez</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Envíos a todo el país con la logística más eficiente del mercado.</p>
                        </div>
                        <div className="p-8 bg-black/50 border border-white/10 rounded-xl hover:border-primary/50 transition-colors group">
                            <Users className="w-12 h-12 text-gray-400 group-hover:text-primary mb-6 transition-colors" />
                            <h3 className="text-xl font-bold uppercase mb-3">Comunidad</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Más que clientes, somos una familia unida por el estilo.</p>
                        </div>
                        <div className="p-8 bg-black/50 border border-white/10 rounded-xl hover:border-primary/50 transition-colors group">
                            <Trophy className="w-12 h-12 text-gray-400 group-hover:text-primary mb-6 transition-colors" />
                            <h3 className="text-xl font-bold uppercase mb-3">Exclusividad</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Acceso a drops limitados y ediciones especiales que no verás en otro lado.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-black mb-8 uppercase">¿Estás listo para el siguiente nivel?</h2>
                <a href="/category/all" className="inline-block bg-primary text-black font-black text-lg px-12 py-4 rounded-full hover:scale-105 transition-transform">
                    VER COLECCIÓN
                </a>
            </section>
        </div>
    );
};

export default AboutUs;
