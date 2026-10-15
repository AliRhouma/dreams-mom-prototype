import { Link } from "react-router-dom"
import { AtSign, Mail, Send, Share2 } from "lucide-react"

const STORE = "DREAMS MOM"

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Boutique",
    links: [
      { label: "Nouveautés", to: "/client/shop" },
      { label: "Promotions", to: "/client/shop" },
      { label: "Toute la collection", to: "/client/shop" },
    ],
  },
  {
    title: "Aide",
    links: [
      { label: "Livraison & retours", to: "/client/shop" },
      { label: "Suivi de commande", to: "/client/shop" },
      { label: "Nous contacter", to: "/client/shop" },
    ],
  },
  {
    title: "À propos",
    links: [
      { label: "La marque", to: "/client/shop" },
      { label: "Nos boutiques", to: "/client/shop" },
      { label: "Changer d’espace", to: "/" },
    ],
  },
]

/** Shopco footer — newsletter band, link columns, socials, copyright. */
export function Footer() {
  return (
    <footer className="mt-24 bg-[#F0F0F0]">
      <div className="mx-auto max-w-[1240px] px-4 xl:px-0">
        {/* Newsletter band — pulled up to float over the section boundary */}
        <div className="-mt-12 mb-10 flex flex-col gap-6 rounded-[20px] bg-black px-6 py-8 text-white md:-mt-16 md:flex-row md:items-center md:justify-between md:px-16 md:py-9">
          <h3 className="font-display-shopco max-w-md text-[28px] leading-tight text-white md:text-[40px]">
            Restez informé des nouveautés
          </h3>
          <form className="flex w-full max-w-sm flex-col gap-3 md:ml-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3">
              <Mail className="size-5 shrink-0 text-black/40" />
              <input
                type="email"
                placeholder="Votre adresse email"
                className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/40"
              />
            </div>
            <button type="submit" className="rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition-opacity hover:opacity-80">
              S’abonner à la newsletter
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-8 pb-10 pt-4 md:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
            <span className="font-display-shopco text-[28px]">{STORE}</span>
            <p className="max-w-xs text-sm text-black/60">
              La mode masculine qui vous ressemble — livrée partout en Tunisie,
              paiement à la livraison.
            </p>
            <div className="flex gap-3">
              {[Send, Share2, AtSign].map((Icon, i) => (
                <span
                  key={i}
                  className="flex size-7 items-center justify-center rounded-full border border-black/20 bg-white text-black transition-colors hover:bg-black hover:text-white"
                >
                  <Icon className="size-3.5" />
                </span>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <span className="text-sm font-medium uppercase tracking-[0.12em]">{col.title}</span>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-black/60 transition-colors hover:text-black">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-black/10 py-6 sm:flex-row">
          <p className="text-sm text-black/60">
            {STORE} © {new Date().getFullYear()}. Tous droits réservés.
          </p>
          <p className="text-xs text-black/40">Paiement à la livraison · Espèce ou carte</p>
        </div>
      </div>
    </footer>
  )
}
