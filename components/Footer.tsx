import React from 'react';
import { useShop } from '../context/ShopContext';

const Footer: React.FC = () => {
  const { socialConfig } = useShop();

  return (
    <footer className="bg-[#050505] border-t border-gray-900 pt-16 pb-8">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-white">
              <div className="size-5 text-primary">
                <span className="material-symbols-outlined text-2xl">diamond</span>
              </div>
              <h2 className="text-xl font-bold uppercase tracking-wider">SAVAGE</h2>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {socialConfig.address || 'Ropa y joyería urbana premium diseñada para quienes no siguen tendencias, sino que las crean. Estilo agresivo, calidad intransigente.'}
            </p>
            <div className="flex gap-4">
              <a className="text-gray-400 hover:text-white transition-colors text-xs font-bold tracking-widest" href={socialConfig.instagram} target="_blank" rel="noreferrer">INSTAGRAM</a>
              <a className="text-gray-400 hover:text-white transition-colors text-xs font-bold tracking-widest" href={socialConfig.tiktok} target="_blank" rel="noreferrer">TIKTOK</a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Comprar</h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li><a className="hover:text-primary transition-colors" href="#">Novedades</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Ropa</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Accesorios</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Rebajas</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Gift Cards</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Ayuda</h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li><a className="hover:text-primary transition-colors" href="#">Envíos y Devoluciones</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Guía de Tallas</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Preguntas Frecuentes</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Términos Mayoristas</a></li>
              <li><a className="hover:text-primary transition-colors" href={`mailto:${socialConfig.email}`}>Contacto</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Newsletter</h3>
            <p className="text-gray-500 text-sm mb-4">Suscríbete para acceso anticipado a drops exclusivos.</p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                className="bg-surface-dark border border-gray-800 text-white px-4 py-3 rounded text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                placeholder="Tu email"
                type="email"
              />
              <button className="bg-white text-black font-bold uppercase tracking-widest text-xs py-3 rounded hover:bg-primary hover:text-white transition-all transform active:scale-95">
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">© 2026 SAVAGE BRAND. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-xs text-gray-600">
            <a className="hover:text-gray-400" href="#">Política de Privacidad</a>
            <a className="hover:text-gray-400" href="#">Términos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
