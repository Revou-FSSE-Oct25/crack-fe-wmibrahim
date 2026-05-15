import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-orange-500">GymBook</h1>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 rounded-lg transition"
          >
            Daftar
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-32">
        <h2 className="text-5xl font-extrabold mb-4 leading-tight">
          Booking Gym,<br />
          <span className="text-orange-500">Kapan Saja.</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-md mb-8">
          Pilih jadwal latihan favoritmu, booking dalam hitungan detik,
          dan latih dirimu tanpa antri.
        </p>
        <Link
          href="/register"
          className="px-8 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-lg font-semibold transition"
        >
          Mulai Sekarang
        </Link>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-24 max-w-5xl mx-auto">
        {[
          { icon: '🗓️', title: 'Booking Mudah', desc: 'Pilih slot waktu yang tersedia dan booking langsung dari website.' },
          { icon: '⚡', title: 'Real-time Kuota', desc: 'Lihat sisa kuota setiap sesi secara langsung sebelum booking.' },
          { icon: '📋', title: 'Riwayat Lengkap', desc: 'Pantau semua histori booking kamu di satu tempat.' },
        ].map((f) => (
          <div key={f.title} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}