export default function App() {
  return (
    <div className="min-h-screen bg-[#FFFDFE] text-gray-700">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#FCE4EC] shadow-sm">
        <h1 className="text-2xl font-semibold text-[#AD1457]">
          Agenda Studio
        </h1>

        <button className="px-4 py-2 rounded-full bg-[#F8BBD0] text-[#6A1B9A] font-medium hover:opacity-90 transition">
          Entrar
        </button>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-4xl font-bold text-[#6A1B9A] mb-4">
          Agende seu momento de beleza
        </h2>

        <p className="text-lg text-gray-600 mb-8">
          Escolha o serviço, o profissional e o melhor horário para você.
        </p>

        <button className="px-8 py-4 rounded-full bg-[#D1C4E9] text-[#4A148C] font-semibold text-lg hover:opacity-90 transition">
          Agendar agora
        </button>
      </section>

      {/* Cards */}
      <section className="px-6 grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">

        <Card
          title="Serviços"
          description="Cabelo, unhas, estética e muito mais"
        />

        <Card
          title="Profissionais"
          description="Escolha quem vai cuidar de você"
        />

        <Card
          title="Horários"
          description="De segunda a sábado, das 9h às 19h"
        />

      </section>

      {/* Footer */}
      <footer className="mt-16 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Agenda Studio · Segunda a Sábado · 9h às 19h
      </footer>
    </div>
  )
}

function Card({ title, description }) {
  return (
    <div className="rounded-2xl p-6 bg-white shadow-md hover:shadow-lg transition">
      <h3 className="text-xl font-semibold text-[#AD1457] mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  )
}
