/**
 * Commandes — the shop's orders, modelled on the real Dreams Mom back-office
 * (TikTak PRO order list + edit form). See docs/data-plan.md. The live
 * dashboard is read behind a captcha login, so these are believable seed rows
 * shaped exactly like the real orders; lines point at real catalogue products.
 * Seed rows keep readable slug ids (cmd-<numero>); rows added at runtime get UUIDs.
 */
import type { RemiseType } from "@/data/seed/produits"

/* ── Statut : the order-list tabs, in the shop's order ──────────────────── */
export type StatutCommande =
  | "panier-abandonne"
  | "en-attente"
  | "confirmee"
  | "pret-a-expedier"
  | "expediee"
  | "livree"
  | "retour-non-recue"
  | "annulee"
  | "retour-recue"

/** Tabs across the top of the list, each a status (+ the "toutes" pseudo-tab in the screen). */
export const STATUTS_COMMANDE: { value: StatutCommande; label: string }[] = [
  { value: "panier-abandonne", label: "Panier abandonné" },
  { value: "en-attente", label: "En attente" },
  { value: "confirmee", label: "Confirmées" },
  { value: "pret-a-expedier", label: "Prêt à expédier" },
  { value: "expediee", label: "Expédiées" },
  { value: "livree", label: "Livrées" },
  { value: "retour-non-recue", label: "Retour non reçues" },
  { value: "annulee", label: "Annulées" },
  { value: "retour-recue", label: "Retour reçues" },
]

/* ── Source de la commande ──────────────────────────────────────────────── */
export type SourceCommande =
  | "site-v2"
  | "facebook"
  | "instagram"
  | "whatsapp"
  | "messenger"
  | "appel"

export const SOURCES_COMMANDE: { value: SourceCommande; label: string }[] = [
  { value: "site-v2", label: "Site V2" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "messenger", label: "Messenger" },
  { value: "appel", label: "Appel" },
]

/* ── Canal de contact (les puces verte / grise de la liste) ─────────────── */
export type CanalContact = "whatsapp" | "dispo"

/* ── Type de paiement ───────────────────────────────────────────────────── */
export type TypePaiement = "espece" | "carte" | "virement"

export const TYPES_PAIEMENT: { value: TypePaiement; label: string }[] = [
  { value: "espece", label: "Espèce" },
  { value: "carte", label: "Carte bancaire" },
  { value: "virement", label: "Virement" },
]

/* ── Gouvernorats de Tunisie (select « Gouvernorat » côté boutique) ─────── */
export const GOUVERNORATS = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba",
  "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "La Manouba",
  "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana",
  "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
] as const

/* ── Transporteurs (suggestions du select « Transporteur ») ─────────────── */
export const TRANSPORTEURS = [
  "First Delivery",
  "Aramex",
  "Navex",
  "Intigo",
  "Jax Delivery",
] as const

/** Une ligne de commande : un produit du catalogue, une quantité, un prix unitaire figé. */
export type LigneCommande = {
  id: string
  /** → Commande.id (cascade delete). */
  commandeId: string
  /** → Produit.id du catalogue (réutilise sa photo). */
  produitId: string
  /** Nom figé au moment de la commande. */
  nom: string
  /** Prix unitaire TTC en DT, figé. */
  prixUnitaire: number
  quantite: number
}

export type Commande = {
  id: string
  /** Numéro affiché (#42390). */
  numero: number
  /** « Nom du client * » */
  client: string
  /** « Téléphone principal * » — mono. */
  telephone: string
  /** « Téléphone supplémentaire » ; peut être vide. */
  telephoneSecondaire: string
  /** « Gouvernement * » */
  gouvernorat: string
  /** « Ville » */
  ville: string
  /** « Adresse complète * » */
  adresse: string
  /** « Code postal » ; peut être vide. */
  codePostal: string
  /** « Source de la commande * » */
  source: SourceCommande
  statut: StatutCommande
  /** Canal de contact mis en avant dans la liste (WhatsApp / Dispo). */
  canalContact: CanalContact
  /** « Transporteur * » ; "" = non sélectionné. */
  transporteur: string
  /** « Livraison gratuite » */
  livraisonGratuite: boolean
  /** « Échange » */
  echange: boolean
  /** « Frais de livraison » en DT. */
  fraisLivraison: number
  /** « Remise » appliquée au total. */
  remise: number
  remiseType: RemiseType
  /** « Type de paiement » */
  typePaiement: TypePaiement
  /** « Email » ; peut être vide. */
  email: string
  /** « Messenger » (nom d'utilisateur) ; peut être vide. */
  messenger: string
  /** « Date de livraison prévue » — chaîne d'affichage ; peut être vide. */
  dateLivraison: string
  /** « Commentaire » ; peut être vide. */
  commentaire: string
  /** Date de création — chaîne d'affichage ("14 oct. 2026"). */
  date: string
}

/* ── Seed : 15 commandes variées (une par étape, des cas limites) ───────── */

export const commandesSeed: Commande[] = [
  {
    id: "cmd-42390", numero: 42390, client: "Ahmed Abdelkefi",
    telephone: "54926864", telephoneSecondaire: "", gouvernorat: "Sfax",
    ville: "Sfax", adresse: "Route de taniour km 2,5", codePostal: "3002",
    source: "site-v2", statut: "confirmee", canalContact: "whatsapp",
    transporteur: "First Delivery", livraisonGratuite: true, echange: false,
    fraisLivraison: 0, remise: 0, remiseType: "montant", typePaiement: "espece",
    email: "", messenger: "", dateLivraison: "17 oct. 2026", commentaire: "",
    date: "14 oct. 2026",
  },
  {
    id: "cmd-42383", numero: 42383, client: "Aymen Ounalli",
    telephone: "23555299", telephoneSecondaire: "52110043", gouvernorat: "Le Kef",
    ville: "Jerissa", adresse: "Jerissa El Kef, cité ouvrière", codePostal: "7114",
    source: "site-v2", statut: "confirmee", canalContact: "whatsapp",
    transporteur: "Navex", livraisonGratuite: false, echange: false,
    fraisLivraison: 8, remise: 10, remiseType: "montant", typePaiement: "espece",
    email: "aymen.ounalli@gmail.com", messenger: "", dateLivraison: "18 oct. 2026",
    commentaire: "Appeler avant livraison, sonnette en panne.", date: "14 oct. 2026",
  },
  {
    id: "cmd-42384", numero: 42384, client: "Rokbi Rokbi",
    telephone: "25444407", telephoneSecondaire: "", gouvernorat: "Sfax",
    ville: "Sfax", adresse: "Route afran km 5", codePostal: "",
    source: "site-v2", statut: "panier-abandonne", canalContact: "whatsapp",
    transporteur: "", livraisonGratuite: false, echange: false,
    fraisLivraison: 8, remise: 0, remiseType: "montant", typePaiement: "espece",
    email: "", messenger: "", dateLivraison: "", commentaire: "", date: "14 oct. 2026",
  },
  {
    id: "cmd-42371", numero: 42371, client: "Mohamed Ali Ben Romdhane",
    telephone: "98341122", telephoneSecondaire: "", gouvernorat: "Tunis",
    ville: "Le Bardo", adresse: "Avenue Habib Bourguiba, imm. El Yasmine, apt 4",
    codePostal: "2000", source: "facebook", statut: "en-attente",
    canalContact: "dispo", transporteur: "", livraisonGratuite: false, echange: false,
    fraisLivraison: 7, remise: 0, remiseType: "montant", typePaiement: "espece",
    email: "", messenger: "m.benromdhane", dateLivraison: "", commentaire: "",
    date: "13 oct. 2026",
  },
  {
    id: "cmd-42366", numero: 42366, client: "Oussama Gharbi",
    telephone: "27889654", telephoneSecondaire: "", gouvernorat: "Sousse",
    ville: "Hammam Sousse", adresse: "Rue de la plage, résidence Corniche",
    codePostal: "4011", source: "instagram", statut: "pret-a-expedier",
    canalContact: "whatsapp", transporteur: "Aramex", livraisonGratuite: false,
    echange: false, fraisLivraison: 8, remise: 0, remiseType: "montant",
    typePaiement: "espece", email: "oussama.gharbi@outlook.fr", messenger: "",
    dateLivraison: "16 oct. 2026", commentaire: "", date: "13 oct. 2026",
  },
  {
    id: "cmd-42352", numero: 42352, client: "Bilel JENDOUBI",
    telephone: "52003344", telephoneSecondaire: "99003344", gouvernorat: "Ariana",
    ville: "Raoued", adresse: "Cité El Ghazala 2, rue du lac", codePostal: "2083",
    source: "site-v2", statut: "expediee", canalContact: "dispo",
    transporteur: "Intigo", livraisonGratuite: true, echange: false,
    fraisLivraison: 0, remise: 0, remiseType: "montant", typePaiement: "espece",
    email: "", messenger: "", dateLivraison: "15 oct. 2026", commentaire: "",
    date: "12 oct. 2026",
  },
  {
    id: "cmd-42340", numero: 42340, client: "Khalil Mansouri",
    telephone: "21567890", telephoneSecondaire: "", gouvernorat: "Nabeul",
    ville: "Hammamet", adresse: "Zone touristique, villa 12", codePostal: "8050",
    source: "whatsapp", statut: "livree", canalContact: "whatsapp",
    transporteur: "First Delivery", livraisonGratuite: false, echange: false,
    fraisLivraison: 8, remise: 15, remiseType: "pourcentage", typePaiement: "carte",
    email: "khalil.mansouri@gmail.com", messenger: "", dateLivraison: "11 oct. 2026",
    commentaire: "Client fidèle.", date: "9 oct. 2026",
  },
  {
    id: "cmd-42331", numero: 42331, client: "Seif Eddine Trabelsi",
    telephone: "94112233", telephoneSecondaire: "", gouvernorat: "Monastir",
    ville: "Monastir", adresse: "Avenue de l'environnement, imm. Carthage",
    codePostal: "5000", source: "site-v2", statut: "livree", canalContact: "whatsapp",
    transporteur: "Navex", livraisonGratuite: true, echange: false,
    fraisLivraison: 0, remise: 0, remiseType: "montant", typePaiement: "espece",
    email: "", messenger: "", dateLivraison: "10 oct. 2026", commentaire: "",
    date: "8 oct. 2026",
  },
  {
    id: "cmd-42318", numero: 42318, client: "Wassim Haddad",
    telephone: "50667788", telephoneSecondaire: "", gouvernorat: "Gabès",
    ville: "Gabès", adresse: "Rue Farhat Hached", codePostal: "6000",
    source: "facebook", statut: "retour-non-recue", canalContact: "dispo",
    transporteur: "Jax Delivery", livraisonGratuite: false, echange: false,
    fraisLivraison: 9, remise: 0, remiseType: "montant", typePaiement: "espece",
    email: "", messenger: "", dateLivraison: "", commentaire: "Colis refusé à la livraison.",
    date: "6 oct. 2026",
  },
  {
    id: "cmd-42305", numero: 42305, client: "Hamza Belhaj",
    telephone: "26998877", telephoneSecondaire: "", gouvernorat: "Bizerte",
    ville: "Menzel Bourguiba", adresse: "Cité Hbibi", codePostal: "7050",
    source: "instagram", statut: "annulee", canalContact: "whatsapp",
    transporteur: "", livraisonGratuite: false, echange: false,
    fraisLivraison: 8, remise: 0, remiseType: "montant", typePaiement: "espece",
    email: "", messenger: "", dateLivraison: "", commentaire: "Injoignable après 3 appels.",
    date: "5 oct. 2026",
  },
  {
    id: "cmd-42298", numero: 42298, client: "Nizar Chedly",
    telephone: "55443322", telephoneSecondaire: "", gouvernorat: "Kairouan",
    ville: "Kairouan", adresse: "Avenue de la République", codePostal: "3100",
    source: "appel", statut: "retour-recue", canalContact: "dispo",
    transporteur: "Aramex", livraisonGratuite: false, echange: true,
    fraisLivraison: 8, remise: 0, remiseType: "montant", typePaiement: "espece",
    email: "", messenger: "", dateLivraison: "", commentaire: "Mauvaise taille, échange demandé.",
    date: "4 oct. 2026",
  },
  {
    id: "cmd-42287", numero: 42287, client: "Firas Ben Youssef",
    telephone: "20112358", telephoneSecondaire: "", gouvernorat: "Tunis",
    ville: "La Marsa", adresse: "Rue du Golf, résidence Les Pins, bloc C",
    codePostal: "2078", source: "site-v2", statut: "confirmee", canalContact: "whatsapp",
    transporteur: "First Delivery", livraisonGratuite: false, echange: false,
    fraisLivraison: 7, remise: 0, remiseType: "montant", typePaiement: "carte",
    email: "firas.by@gmail.com", messenger: "", dateLivraison: "17 oct. 2026",
    commentaire: "", date: "14 oct. 2026",
  },
  {
    id: "cmd-42275", numero: 42275, client: "Anis Zouari",
    telephone: "29887766", telephoneSecondaire: "", gouvernorat: "Médenine",
    ville: "Djerba Midoun", adresse: "Route touristique, hôtel zone", codePostal: "4116",
    source: "whatsapp", statut: "en-attente", canalContact: "whatsapp",
    transporteur: "", livraisonGratuite: false, echange: false,
    fraisLivraison: 9, remise: 0, remiseType: "montant", typePaiement: "espece",
    email: "", messenger: "", dateLivraison: "", commentaire: "", date: "14 oct. 2026",
  },
  {
    id: "cmd-42260", numero: 42260, client: "Marwen Saidi",
    telephone: "53221100", telephoneSecondaire: "", gouvernorat: "Gafsa",
    ville: "Gafsa", adresse: "Cité Ennour", codePostal: "2100",
    source: "site-v2", statut: "pret-a-expedier", canalContact: "dispo",
    transporteur: "Navex", livraisonGratuite: false, echange: false,
    fraisLivraison: 9, remise: 5, remiseType: "montant", typePaiement: "espece",
    email: "", messenger: "", dateLivraison: "16 oct. 2026", commentaire: "",
    date: "13 oct. 2026",
  },
  {
    id: "cmd-42241", numero: 42241, client: "Yassine B.",
    telephone: "24778899", telephoneSecondaire: "", gouvernorat: "Manouba",
    ville: "Douar Hicher", adresse: "Rue 7 novembre", codePostal: "2086",
    source: "facebook", statut: "panier-abandonne", canalContact: "dispo",
    transporteur: "", livraisonGratuite: false, echange: false,
    fraisLivraison: 7, remise: 0, remiseType: "montant", typePaiement: "espece",
    email: "", messenger: "", dateLivraison: "", commentaire: "", date: "12 oct. 2026",
  },
]

/* ── Seed des lignes : chaque commande a 1 à 3 produits réels du catalogue ─ */
export const lignesCommandeSeed: LigneCommande[] = [
  // cmd-42390 — 1 article, 69 DT
  { id: "lc-1", commandeId: "cmd-42390", produitId: "produit-1350057", nom: "T-shirt Cote", prixUnitaire: 69, quantite: 1 },
  // cmd-42383 — 2 articles, 158 DT
  { id: "lc-2", commandeId: "cmd-42383", produitId: "produit-1361293", nom: "pantalon Slim fit", prixUnitaire: 65, quantite: 1 },
  { id: "lc-3", commandeId: "cmd-42383", produitId: "produit-1375364", nom: "Baggy WD", prixUnitaire: 89, quantite: 1 },
  // cmd-42384 — panier abandonné, 1 article, 29 DT
  { id: "lc-4", commandeId: "cmd-42384", produitId: "produit-1275335", nom: "Casquette", prixUnitaire: 25, quantite: 1 },
  // cmd-42371 — 1 article
  { id: "lc-5", commandeId: "cmd-42371", produitId: "produit-1404722", nom: "Chaussure 003", prixUnitaire: 120, quantite: 1 },
  // cmd-42366 — 2 articles
  { id: "lc-6", commandeId: "cmd-42366", produitId: "produit-1391690", nom: "Pantalon Maco chic", prixUnitaire: 119, quantite: 1 },
  { id: "lc-7", commandeId: "cmd-42366", produitId: "produit-1354860", nom: "Ceinture reglable", prixUnitaire: 39, quantite: 1 },
  // cmd-42352 — 3 articles
  { id: "lc-8", commandeId: "cmd-42352", produitId: "produit-1300211", nom: "Pack de 5 Casquettes", prixUnitaire: 79, quantite: 1 },
  { id: "lc-9", commandeId: "cmd-42352", produitId: "produit-1275335", nom: "Casquette", prixUnitaire: 25, quantite: 2 },
  // cmd-42340 — 1 article
  { id: "lc-10", commandeId: "cmd-42340", produitId: "produit-1418395", nom: "Manteau + casquette gratuite", prixUnitaire: 109, quantite: 1 },
  // cmd-42331 — 2 articles
  { id: "lc-11", commandeId: "cmd-42331", produitId: "produit-1367420", nom: "CleoPatra", prixUnitaire: 89, quantite: 1 },
  { id: "lc-12", commandeId: "cmd-42331", produitId: "produit-1361564", nom: "Skinny dreams", prixUnitaire: 59, quantite: 1 },
  // cmd-42318 — 1 article
  { id: "lc-13", commandeId: "cmd-42318", produitId: "produit-1371040", nom: "Chaussure Orthopédique", prixUnitaire: 120, quantite: 1 },
  // cmd-42305 — 1 article
  { id: "lc-14", commandeId: "cmd-42305", produitId: "produit-1423637", nom: "Capuche alloucha", prixUnitaire: 59, quantite: 1 },
  // cmd-42298 — 1 article
  { id: "lc-15", commandeId: "cmd-42298", produitId: "produit-1354563", nom: "Boyfriend jeans + ceinture Gratuite", prixUnitaire: 94, quantite: 1 },
  // cmd-42287 — 2 articles
  { id: "lc-16", commandeId: "cmd-42287", produitId: "produit-1389627", nom: "Reguler fit + ceinture gratuite", prixUnitaire: 99, quantite: 1 },
  { id: "lc-17", commandeId: "cmd-42287", produitId: "produit-1354860", nom: "Ceinture reglable", prixUnitaire: 39, quantite: 1 },
  // cmd-42275 — 1 article
  { id: "lc-18", commandeId: "cmd-42275", produitId: "produit-1321338", nom: "Pack 6 casquettes + Ceinture gratuite", prixUnitaire: 139, quantite: 1 },
  // cmd-42260 — 1 article
  { id: "lc-19", commandeId: "cmd-42260", produitId: "produit-1395380", nom: "Chaussure 03", prixUnitaire: 99, quantite: 1 },
  // cmd-42241 — panier abandonné, 1 article
  { id: "lc-20", commandeId: "cmd-42241", produitId: "produit-1356788", nom: "Pack 4 casquette NY", prixUnitaire: 79, quantite: 1 },
]
