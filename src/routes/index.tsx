import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, HeartHandshake, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-pet.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lar de Patas · Hospedagem e Pet Sitter" },
      { name: "description", content: "Hospedagem acolhedora e pet sitter de confiança. Agende online em poucos minutos." },
      { property: "og:title", content: "Lar de Patas · Hospedagem e Pet Sitter" },
      { property: "og:description", content: "Cuidado com carinho para o seu pet, em casa ou na nossa." },
    ],
  }),
  component: Index,
});

const services = [
  {
    icon: Home,
    title: "Hospedagem",
    text: "Seu pet fica em um lar tranquilo, com rotina, passeios e muito carinho enquanto você viaja.",
    items: ["Ambiente familiar", "Fotos diárias", "Passeios incluídos"],
  },
  {
    icon: HeartHandshake,
    title: "Pet Sitter",
    text: "Visitas na sua casa para alimentar, brincar e cuidar, sem tirar seu pet do conforto dele.",
    items: ["Visitas de 1h", "Alimentação e água", "Relatório no WhatsApp"],
  },
];

function Index() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Cuidado com carinho</p>
          <h1 className="mt-4 text-4xl leading-tight text-foreground md:text-5xl">
            Um segundo lar para quem você mais ama.
          </h1>
          <p className="mt-5 max-w-md text-muted-foreground">
            Hospedagem e pet sitter com atenção de verdade. Agende online e acompanhe tudo pelo WhatsApp.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg"><Link to="/booking">Agendar</Link></Button>
            <Button asChild size="lg" variant="ghost"><a href="#servicos">Ver serviços</a></Button>
          </div>
        </div>
        <img src={hero} alt="Cachorro feliz descansando em casa" width={1600} height={1008} className="aspect-[4/3] w-full rounded-3xl object-cover object-right shadow-soft" />
      </section>

      <section id="servicos" className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="text-3xl text-foreground">Nossos serviços</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {services.map((s) => (
            <article key={s.title} className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <s.icon className="h-7 w-7 text-primary" />
              <h3 className="mt-5 text-2xl text-foreground">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.text}</p>
              <ul className="mt-5 space-y-2">
                {s.items.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" /> {i}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6"><Link to="/booking">Agendar</Link></Button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
