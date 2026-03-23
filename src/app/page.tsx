import Link from 'next/link'
import { ArrowRight, CheckSquare, BarChart, PenTool } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neo-bg dark:bg-neo-bgDark text-neo-black dark:text-white font-body selection:bg-brand-yellow selection:text-neo-black overflow-x-hidden">
      {/* Navbar */}
      <nav className="border-b-[3px] border-neo-black dark:border-white bg-brand-yellow dark:bg-brand-purple">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-display tracking-[2px] text-2xl text-neo-black uppercase">
            Brutabit
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login" className="neo-btn bg-white text-neo-black border-[2px] border-neo-black hover:bg-gray-100 hidden sm:block">
              Masuk
            </Link>
            <Link href="/auth/register" className="neo-btn bg-neo-black text-brand-yellow border-[2px] border-neo-black hover:bg-gray-900 border-none sm:border-solid">
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-brand-blue border-[3px] border-neo-black z-0 rounded-full animate-bounce-neo hidden md:block" />
        <div className="absolute top-40 right-10 w-16 h-16 bg-brand-green border-[3px] border-neo-black z-0 hidden md:block" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-brand-pink border-[3px] border-neo-black z-0 rotate-12 hidden md:block" />
        
        <div className="relative z-10 max-w-4xl mt-8">
          <div className="inline-block mb-6 neo-badge bg-brand-green text-neo-black px-4 py-2 text-sm border-[2.5px]">
            Hancurkan Rasa Malas
          </div>
          <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] tracking-[4px] uppercase leading-[0.85] mb-8 text-shadow-neo text-brand-red dark:text-brand-yellow">
            BANGUN HABIT<br/>JADI AGRESIF
          </h1>
          <p className="font-mono text-lg md:text-xl max-w-2xl mx-auto mb-10 text-neo-black dark:text-gray-300 font-bold border-l-4 border-brand-yellow pl-4 text-left bg-white dark:bg-neo-black p-4 border-[2px] border-neo-black dark:border-white md:shadow-[5px_5px_0px_#0a0a0a] dark:md:shadow-[5px_5px_0px_#f0f0f0]">
            Aplikasi habit tracker, jurnal, dan to-do list dengan tema neobrutalism. 
            Tinggalkan antarmuka yang membosankan. Saatnya brutal dengan tujuanmu.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            <Link href="/auth/register" className="neo-btn bg-brand-purple text-white text-lg py-4 px-8 flex items-center gap-2 group border-[3px] border-neo-black w-full sm:w-auto justify-center hover:bg-brand-blue">
              MULAI SEKARANG 
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/login" className="neo-btn bg-white dark:bg-neo-cardDk text-neo-black dark:text-white text-lg py-4 px-8 border-[3px] border-neo-black w-full sm:w-auto justify-center hover:bg-gray-100 dark:hover:bg-neo-black">
              SUDAH PUNYA AKUN?
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y-[3px] border-neo-black dark:border-white bg-white dark:bg-[#111]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-6xl tracking-[2px] text-neo-black dark:text-white uppercase mb-4">
              FITUR BRUTAL
            </h2>
            <div className="w-24 h-2 bg-brand-red mx-auto border-[2px] border-neo-black dark:border-white"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="neo-card-lg p-8 bg-brand-yellow transition-transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-neo-black text-brand-yellow flex items-center justify-center border-[2px] border-neo-black mb-6">
                <CheckSquare size={36} />
              </div>
              <h3 className="font-display text-3xl uppercase tracking-[2px] mb-4 text-neo-black">Habit Tracker</h3>
              <p className="font-mono text-neo-black font-semibold text-[15px] leading-relaxed">
                Pantau kebiasaan buruk dan ciptakan rutinitas baru. Dapetin XP dan kumpulkan lencana tiap progres yang kamu buat!
              </p>
            </div>
            
            <div className="neo-card-lg p-8 bg-brand-blue transition-transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-neo-black text-brand-blue flex items-center justify-center border-[2px] border-neo-black mb-6">
                <BarChart size={36} />
              </div>
              <h3 className="font-display text-3xl uppercase tracking-[2px] mb-4 text-neo-black">Statistik Brutal</h3>
              <p className="font-mono text-neo-black font-semibold text-[15px] leading-relaxed">
                Visualisasikan datamu dengan heatmap 12 minggu dan grafik real-time. Nggak ada alasan buat nggak konsisten.
              </p>
            </div>

            <div className="neo-card-lg p-8 bg-brand-green transition-transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-neo-black text-brand-green flex items-center justify-center border-[2px] border-neo-black mb-6">
                <PenTool size={36} />
              </div>
              <h3 className="font-display text-3xl uppercase tracking-[2px] mb-4 text-neo-black">Jurnal & Todo</h3>
              <p className="font-mono text-neo-black font-semibold text-[15px] leading-relaxed">
                Tulis isi pikiranmu dan jadwalkan tugas-tugas penting biar harimu nggak berantakan. Tetap fokus!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-red px-6 py-32 text-center">
        <h2 className="font-display text-6xl md:text-8xl tracking-[3px] uppercase text-brand-yellow mb-8 text-shadow-neo">
          SIAP BERUBAH?
        </h2>
        <p className="font-mono text-white text-xl md:text-2xl max-w-3xl mx-auto mb-12 font-bold bg-neo-black p-4 border-[3px] border-white shadow-[5px_5px_0px_#ffffff]">
          Bergabunglah sekarang dan jadilah versi dirimu yang paling brutal dalam produktivitas!
        </p>
        <Link href="/auth/register" className="neo-btn bg-brand-yellow text-neo-black text-2xl py-5 px-12 inline-block border-[4px] border-neo-black hover:bg-white hover:text-neo-black transition-colors">
          DAFTAR GRATIS SEKARANG
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t-[3px] border-neo-black dark:border-white bg-neo-black text-white px-6 py-8 flex flex-col items-center font-mono text-sm gap-2">
        <p className="font-display tracking-[2px] text-xl text-brand-yellow">BRUTABIT</p>
        <p className="text-gray-400 font-bold max-w-md text-center">
          &copy; {new Date().getFullYear()} BRUTABIT. Dibangun dengan keringat dan kode untuk membantu kamu tetap konsisten.
        </p>
      </footer>
    </div>
  )
}
