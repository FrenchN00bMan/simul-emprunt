# Cahier des charges — Simulateur de plan de financement immobilier

## 1. Contexte et objectif

Application web monopage destinée à **un courtier en prêt immobilier** (utilisateur unique). Elle reproduit les fonctionnalités d'un fichier Excel existant de simulation d'endettement utilisé en banque (Banque Populaire). L'objectif est de permettre au courtier de saisir les paramètres d'un dossier emprunteur, de configurer jusqu'à 5 prêts simultanés de types différents, et d'obtenir instantanément les tableaux d'amortissement, les indicateurs d'endettement et les coûts totaux.

**Pas de base de données, pas de comptes utilisateurs, pas de sauvegarde serveur.** Tout le calcul se fait côté client en JavaScript. L'application peut être hébergée en statique (GitHub Pages, Netlify, etc.).

---

## 2. Stack technique

- **Frontend uniquement** : HTML + CSS + JavaScript (vanilla ou React au choix du développeur)
- **Pas de backend** : tous les calculs sont réalisés côté navigateur
- **Responsive** : utilisable sur desktop et tablette (le mobile n'est pas prioritaire)
- **Export PDF** : possibilité d'imprimer / exporter le plan de financement complet
- **Sauvegarde locale** : les simulations en cours peuvent être sauvegardées / rechargées via `localStorage` ou export/import JSON

---

## 3. Structure de l'interface

L'interface est organisée en **3 zones principales** visibles simultanément (pas d'onglets cachés) :

### Zone A — Paramètres de l'emprunteur (en haut)

Formulaire compact en ligne, champs éditables :

| Champ | Type | Défaut | Description |
|---|---|---|---|
| Nom du client | texte | vide | Identifiant libre du dossier |
| Revenus annuels bruts | nombre | 0 | Revenus du ménage |
| Nombre de personnes au foyer | nombre (1-9) | 1 | Pour le calcul du quotient familial |
| Taux d'endettement existant | pourcentage | 0% | Crédits en cours / revenus mensuels |
| Loyer actuel | nombre | 0 | Loyer mensuel actuel du ménage |
| Loyers payés et autres charges | nombre | 0 | Autres charges mensuelles |
| Loyers perçus | nombre | 0 | Revenus locatifs mensuels |
| Seuil d'endettement max | pourcentage | 35% | Seuil réglementaire |

**Indicateurs calculés affichés en lecture seule :**

| Indicateur | Formule |
|---|---|
| Revenus mensuels | `revenus_annuels / 12` |
| Charges crédit existantes (€/mois) | `taux_endettement_existant × revenus_mensuels` |
| QF RAV (Quotient Familial - Reste À Vivre) | `(revenus_annuels - charges_crédit_existantes × 12) / nb_personnes` |
| QF de référence | Lookup dans la table ci-dessous selon `nb_personnes` |

**Table du Quotient Familial de référence** (intégrée en dur) :

| Nb personnes | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| QF référence | 610 | 460 | 420 | 370 | 340 | 310 | 290 | 250 | 230 |

Un indicateur visuel (vert/rouge) doit signaler si le QF RAV est supérieur ou inférieur au QF de référence.

### Zone B — Configuration des prêts (milieu)

**5 colonnes de prêts** côte à côte, chacune configurable indépendamment. L'utilisateur peut activer/désactiver chaque prêt via une case à cocher.

#### Types de prêts disponibles (sélecteur par colonne) :

1. **Amortissable classique** (type par défaut) — ex: PNE, PEL, prêt conso, etc.
2. **PTZ (Prêt à Taux Zéro)** — avec gestion du différé
3. **In Fine** — remboursement du capital en une seule fois à échéance
4. **Prêt Relais** — adossé à la vente d'un bien

#### Paramètres communs à tous les prêts :

| Champ | Type | Description |
|---|---|---|
| Label | texte | Nom libre du prêt (ex: "PNE", "PEL", "Prêt employeur") |
| Montant emprunté (€) | nombre | Capital initial |
| Durée (mois) | nombre | Nombre de mensualités |
| Taux nominal annuel (%) | nombre | Taux d'intérêt |
| Taux assurance (%) | nombre | Taux annuel d'assurance emprunteur |
| Quotité assurance (%) | nombre (0-100) | Couverture assurance (ex: 100%, 50%) |
| Assurance sur CRD | oui/non | Si oui : assurance calculée sur le capital restant dû. Si non : sur le capital initial. |

#### Paramètres spécifiques au PTZ :

| Champ | Type | Description |
|---|---|---|
| Durée pré-différé (mois) | nombre | Période sans aucun remboursement |
| Durée post-différé (mois) | nombre | Durée de remboursement après le différé |

#### Paramètres spécifiques au Prêt Relais :

| Champ | Type | Description |
|---|---|---|
| Valeur du bien à vendre (€) | nombre | Estimation du bien |
| Capital restant dû sur le bien (€) | nombre | Solde du prêt en cours sur ce bien |
| Pourcentage de financement (%) | nombre (défaut: 70%) | % de la valeur du bien accordé en relais |

**Indicateur calculé** : Montant autorisé du relais = `valeur_bien × %financement - capital_restant_dû`

#### Calculateur financier intégré (par prêt)

Pour les prêts amortissables : l'utilisateur saisit **3 valeurs parmi 4** (montant, durée, taux, échéance) et le système calcule la 4e. Le champ à calculer est marqué d'un "?" par l'utilisateur.

**Formule PMT** (calcul de l'échéance) :

```
échéance = montant × (taux_mensuel / (1 - (1 + taux_mensuel)^(-durée)))
où taux_mensuel = taux_annuel / 12
```

**Formule inverse pour le taux** : résolution par dichotomie (Newton-Raphson ou bissection), car pas de formule analytique.

**Formule inverse pour la durée** :

```
durée = -ln(1 - montant × taux_mensuel / échéance) / ln(1 + taux_mensuel)
```

**Formule inverse pour le montant** :

```
montant = échéance × (1 - (1 + taux_mensuel)^(-durée)) / taux_mensuel
```

### Zone C — Tableau d'amortissement consolidé (en bas)

Tableau scrollable affichant mois par mois (jusqu'à 300 lignes = 25 ans) avec **une section par prêt actif** et une **colonne de synthèse**.

#### Colonnes par prêt actif :

| Colonne | Formule |
|---|---|
| Mois | Numéro séquentiel (1, 2, 3...) |
| Capital restant dû | `CRD_précédent - amortissement_précédent` |
| Intérêts du mois | `CRD × taux_annuel / 12` |
| Échéance hors assurance | Constante (PMT) pour amortissable, intérêts seuls pour in fine |
| Assurance du mois | Si sur CRD : `CRD × taux_ass × quotité / 12`. Si sur capital initial : `capital_initial × taux_ass × quotité / 12` |
| Échéance assurance incluse | `échéance_hors_ass + assurance` |

#### Cas particuliers par type de prêt :

**Prêt amortissable classique :**
- Échéance constante
- Intérêts décroissants, amortissement croissant
- `amortissement = échéance - intérêts`
- `CRD_(n+1) = CRD_n - amortissement_n`

**PTZ :**
- Pendant le pré-différé : échéance = 0, CRD = montant initial (pas d'intérêts car taux = 0%)
- Après le pré-différé : remboursement linéaire sur la durée post-différé
- Échéance = `montant / durée_post_différé`

**In Fine :**
- Chaque mois : échéance = intérêts seulement (`CRD × taux / 12`)
- Dernier mois : échéance = intérêts + capital total
- CRD constant jusqu'au dernier mois

**Prêt Relais :**
- Même logique que In Fine (intérêts seulement pendant la durée)
- Capital remboursé à la vente du bien

#### Colonnes de synthèse (à droite du tableau) :

| Colonne | Formule |
|---|---|
| Échéance totale mensuelle | Somme des échéances TTC de tous les prêts actifs pour ce mois |
| Taux d'endettement du mois | `échéance_totale_mensuelle / revenus_mensuels` |

Le taux d'endettement doit être **coloré en rouge** si supérieur au seuil défini en Zone A.

#### Ligne de totaux (au-dessus ou en dessous du tableau) :

| Total | Formule |
|---|---|
| Coût total des intérêts | Somme de tous les intérêts de tous les prêts sur toute la durée |
| Coût total de l'assurance | Somme de toutes les primes d'assurance de tous les prêts |
| Coût total du crédit | Intérêts + assurance |

---

## 4. Barème des assurances

Table de référence affichée dans un panneau déroulant/modal, permettant au courtier de retrouver rapidement le taux à saisir.

| Catégorie | Profil | Taux | Sur CRD |
|---|---|---|---|
| Prêts en euros | Immo Casden < 35 ans | 0,188% | Non |
| Prêts en euros | Dérog immo jeunes < 35 ans | 0,23% | Non |
| Prêts en euros | Immo Casden > 35 ans | 0,261% | Non |
| Prêts en euros | Immo jeunes < 30 ans | 0,282% | Non |
| Prêts en euros | De 30 à 50 ans | 0,3842% | Non |
| Prêts en euros | De 50 à 65 ans | 0,45% | Non |
| Prêts en euros | > 65 ans DC seul | 1,74% | Non |
| Prêts en euros | Dérog 35-65 ans | 0,564% | Non |
| Prêts CHF | Immo jeune < 30 ans | 0,40% | Oui |
| Prêts CHF | Base 30-65 ans | 0,60% | Oui |
| Prêts CHF | Dérog immo jeune < 35 ans | 0,36% | Oui |
| Prêts CHF | Dérog 35-65 ans | 0,54% | Oui |
| Autres | Saisie libre | 0,24% | Non |

**Comportement attendu** : quand le courtier clique sur une ligne de ce barème, le taux et le mode "sur CRD" se remplissent automatiquement dans le prêt sélectionné.

---

## 5. Fonctionnalités complémentaires

### 5.1 Export PDF

Bouton "Exporter en PDF" qui génère un document propre contenant :
- Nom du client et date
- Paramètres de l'emprunteur
- Récapitulatif des prêts configurés
- Tableau d'amortissement complet
- Totaux (coût intérêts, assurance, coût total)
- Taux d'endettement max atteint

Utiliser `html2pdf.js`, `jsPDF` ou `window.print()` avec une CSS dédiée `@media print`.

### 5.2 Sauvegarde / chargement de simulations

- **Sauvegarde locale** : bouton "Sauvegarder" qui stocke l'état complet (paramètres + configuration des 5 prêts) dans `localStorage` avec un nom de dossier
- **Export JSON** : bouton "Exporter" qui télécharge un fichier `.json` contenant toute la simulation
- **Import JSON** : bouton "Importer" qui recharge une simulation depuis un fichier `.json`
- **Liste des simulations** : panneau latéral listant les simulations sauvegardées avec possibilité de charger / supprimer

### 5.3 Calcul en temps réel

Tous les calculs doivent se mettre à jour **instantanément** à chaque modification d'un champ. Pas de bouton "Calculer". Utiliser un debounce de 150-300ms pour éviter les recalculs trop fréquents pendant la saisie.

### 5.4 Graphique optionnel

Un graphique (Chart.js ou Recharts) montrant l'évolution dans le temps :
- Capital restant dû de chaque prêt
- Taux d'endettement mensuel avec le seuil en pointillé

Ce graphique est un bonus, pas une priorité.

---

## 6. Règles métier et validation

### Validations à appliquer :

- Revenus > 0
- Durée entre 1 et 360 mois (30 ans)
- Taux entre 0% et 20%
- Taux assurance entre 0% et 5%
- Quotité assurance entre 0% et 200% (co-emprunteurs)
- Montant emprunté > 0
- Le seuil d'endettement ne peut pas être modifié au-delà de 40%

### Alertes visuelles :

- **Endettement > seuil** : bandeau rouge persistant indiquant le mois à partir duquel le seuil est dépassé
- **QF RAV < QF de référence** : indicateur orange
- **Prêt relais : montant autorisé < 0** : alerte rouge (le capital restant dû dépasse la valeur du bien × %)

---

## 7. Précision des calculs

Toutes les valeurs monétaires doivent être calculées avec une précision de **2 décimales** (arrondi au centime). Les taux intermédiaires sont conservés en pleine précision (pas d'arrondi avant le résultat final).

Formules de référence vérifiées sur le fichier Excel source :

```
taux_mensuel = taux_annuel / 12

Échéance PMT = montant × taux_mensuel / (1 - (1 + taux_mensuel)^(-durée))

Intérêts mois N = CRD_N × taux_annuel / 12

Amortissement mois N = échéance - intérêts_N

CRD_(N+1) = CRD_N - amortissement_N

Assurance (capital initial) = capital_initial × taux_assurance × quotité / 12
Assurance (sur CRD) = CRD_N × taux_assurance × quotité / 12

Taux endettement mois = somme_échéances_TTC_mois / revenus_mensuels

QF RAV = (revenus_annuels - charges_crédit_existantes_mensuelles × 12) / nb_personnes
```

---

## 8. Design et ergonomie

- Interface sobre et professionnelle, orientée "outil de travail quotidien"
- Palette : tons neutres (gris, blanc) avec accents bleu foncé
- Les champs de saisie doivent ressembler à des cellules de tableur (bordures fines, alignement à droite pour les nombres)
- Les colonnes de prêts inactifs sont grisées
- Navigation rapide avec Tab entre les champs
- Les nombres sont formatés avec séparateur de milliers et symbole € ou %
- Le tableau d'amortissement est paginé ou scrollable avec en-têtes figés (sticky headers)

---

## 9. Arborescence suggérée du projet

```
simulateur-pret/
├── index.html
├── css/
│   ├── main.css
│   └── print.css
├── js/
│   ├── app.js              # Point d'entrée, orchestration
│   ├── calculs.js           # Toutes les fonctions de calcul financier
│   ├── amortissement.js     # Génération des tableaux d'amortissement
│   ├── ui.js                # Gestion de l'interface et du DOM
│   ├── export.js            # Export PDF et JSON
│   └── storage.js           # Sauvegarde/chargement localStorage
├── data/
│   ├── quotient-familial.json
│   └── bareme-assurances.json
└── README.md
```

---

## 10. Résumé des priorités

| Priorité | Fonctionnalité |
|---|---|
| **P0 — Indispensable** | Saisie paramètres emprunteur + indicateurs (QF RAV, endettement) |
| **P0 — Indispensable** | Configuration de 5 prêts (amortissable, PTZ, in fine, relais) |
| **P0 — Indispensable** | Tableau d'amortissement consolidé avec calcul temps réel |
| **P0 — Indispensable** | Alertes endettement et QF |
| **P1 — Important** | Calculateur financier (3 valeurs → 4e) |
| **P1 — Important** | Barème assurances avec remplissage automatique |
| **P1 — Important** | Export PDF |
| **P2 — Bonus** | Sauvegarde/chargement simulations (localStorage + JSON) |
| **P2 — Bonus** | Graphiques d'évolution |
