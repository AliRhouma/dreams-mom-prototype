import { Link } from "react-router-dom"
import {
  BadgeCheck,
  CreditCard,
  Headphones,
  Quote,
  RotateCcw,
  Sparkles,
  Star,
  Tag,
  Truck,
  type LucideIcon,
} from "lucide-react"

/**
 * Conversion-oriented landing blocks (Shopco-styled, French). Each is pure and
 * reused by the boutique home: a reassurance bar, value props, social proof and
 * call-to-action bands — all nudging the client toward the shop / checkout.
 */

/* ── Barre de réassurance (sous le hero) — lève les freins à l'achat ─────── */
const REASSURANCE: { icon: LucideIcon; titre: string; texte: string }[] = [
  { icon: Truck, titre: "Livraison 48–72h", texte: "Partout en Tunisie" },
  { icon: CreditCard, titre: "Paiement à la livraison", texte: "Payez à la réception" },
  { icon: RotateCcw, titre: "Échange sous 7 jours", texte: "Taille ou couleur" },
  { icon: Headphones, titre: "Service client", texte: "Une question ? On répond" },
]

export function TrustBar() {
  return (
    <section className="border-y border-black/10 bg-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-px px-4 md:grid-cols-4 xl:px-0">
        {REASSURANCE.map(({ icon: Icon, titre, texte }) => (
          <div key={titre} className="flex items-center gap-3 py-5 md:justify-center md:py-6">
            <Icon className="size-6 shrink-0 text-black" strokeWidth={1.75} />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold">{titre}</span>
              <span className="text-xs text-black/50">{texte}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Bandeau d'appel à l'action (noir, plein cadre) ─────────────────────── */
export function CtaBand({
  surtitre,
  titre,
  texte,
  cta,
  to,
}: {
  surtitre?: string
  titre: string
  texte?: string
  cta: string
  to: string
}) {
  return (
    <section className="mx-auto max-w-[1240px] px-4 xl:px-0">
      <div className="flex flex-col items-center gap-5 rounded-[20px] bg-black px-6 py-12 text-center text-white md:px-16 md:py-16">
        {surtitre ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em]">
            <Sparkles className="size-3.5" /> {surtitre}
          </span>
        ) : null}
        <h2 className="font-display-shopco max-w-2xl text-[30px] uppercase leading-[1.05] text-white md:text-[46px]">
          {titre}
        </h2>
        {texte ? <p className="max-w-xl text-sm text-white/70 md:text-base">{texte}</p> : null}
        <Link
          to={to}
          className="mt-1 inline-block rounded-full bg-white px-12 py-4 text-sm font-medium text-black transition-opacity hover:opacity-85 md:text-base"
        >
          {cta}
        </Link>
      </div>
    </section>
  )
}

/* ── « Pourquoi Dreams Mom » — arguments de valeur ──────────────────────── */
const VALEURS: { icon: LucideIcon; titre: string; texte: string }[] = [
  { icon: BadgeCheck, titre: "Qualité sélectionnée", texte: "Des matières et des coupes choisies pour durer, portées au quotidien." },
  { icon: Tag, titre: "Le juste prix", texte: "Des tarifs clairs en dinar, avec des offres régulières et des packs avantageux." },
  { icon: Truck, titre: "Livré chez vous", texte: "Expédition rapide dans les 24 gouvernorats, paiement à la livraison." },
]

export function ValueProps() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 xl:px-0">
      <div className="mb-8 text-center md:mb-12">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-black/50">L’esprit de la marque</span>
        <h2 className="font-display-shopco mt-2 text-[28px] uppercase md:text-[40px]">Pourquoi Dreams Mom</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {VALEURS.map(({ icon: Icon, titre, texte }) => (
          <div key={titre} className="flex flex-col gap-3 rounded-[20px] border border-black/10 p-6 md:p-8">
            <span className="flex size-12 items-center justify-center rounded-full bg-black text-white">
              <Icon className="size-6" strokeWidth={1.75} />
            </span>
            <h3 className="text-lg font-bold">{titre}</h3>
            <p className="text-sm leading-relaxed text-black/60">{texte}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Preuve sociale — avis clients (illustratifs, prototype) ────────────── */
const AVIS: { nom: string; ville: string; texte: string }[] = [
  { nom: "Mohamed A.", ville: "Sfax", texte: "Commande reçue en deux jours, qualité au top. Je recommande les yeux fermés." },
  { nom: "Yassine B.", ville: "Tunis", texte: "Le paiement à la livraison change tout, j’ai commandé sans stress. Parfait." },
  { nom: "Khalil M.", ville: "Sousse", texte: "Coupe impeccable et service client réactif pour l’échange de taille. Bravo." },
]

export function Testimonials() {
  return (
    <section className="bg-[#F0F0F0] py-14 md:py-20">
      <div className="mx-auto max-w-[1240px] px-4 xl:px-0">
        <div className="mb-8 text-center md:mb-12">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-black/50">Ils nous font confiance</span>
          <h2 className="font-display-shopco mt-2 text-[28px] uppercase md:text-[40px]">Avis de nos clients</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {AVIS.map((a) => (
            <figure key={a.nom} className="flex flex-col gap-4 rounded-[20px] bg-white p-6 md:p-7">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-0.5 text-black" aria-label="5 étoiles sur 5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </span>
                <Quote className="size-7 text-black/10" />
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-black/70">« {a.texte} »</blockquote>
              <figcaption className="text-sm font-bold">
                {a.nom} <span className="font-normal text-black/50">· {a.ville}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
