import QRCode from 'react-qr-code';
import logoProyecto from '../assets/logo_conciencia.webp';

interface CourseQrPosterProps {
  url: string;
  nombreMateria: string;
  grupo: string;
  nombreProfesor: string;
}

export function CourseQrPoster({
  url,
  nombreMateria,
  grupo,
  nombreProfesor,
}: CourseQrPosterProps) {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 w-[320px] h-[480px] relative overflow-hidden flex flex-col items-center justify-between py-6">
      <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-university-red rounded-tl-3xl" />
      <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-university-red rounded-tr-3xl" />

      <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-university-red rounded-bl-3xl" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-university-red rounded-br-3xl" />

      <div className="relative z-10 w-full flex flex-col items-center gap-4 px-4">
        <div className="text-center mt-2">
          <p className="text-lg font-extrabold tracking-wide text-university-red uppercase">
            {nombreMateria}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-800 uppercase tracking-wide">
            Grupo {grupo}
          </p>
        </div>

        <div className="mt-2 relative bg-university-red rounded-2xl p-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-full p-1.5 shadow-md">
              <img
                src={logoProyecto}
                alt="ConCiencia Académica"
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>

          <QRCode
            value={url}
            size={200}
            bgColor="#ffffff"
            fgColor="#ffffff"
            style={{ borderRadius: 16 }}
          />
        </div>

        <div className="mt-2 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-wide">
            Docente
          </p>
          <p className="text-base font-bold text-gray-900">
            {nombreProfesor}
          </p>
        </div>
      </div>
    </div>
  );
}

