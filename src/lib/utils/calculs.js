/**
 * Fonctions de calcul financier pour le simulateur de prêt immobilier
 * Toutes les valeurs monétaires sont arrondies à 2 décimales
 */

/**
 * Arrondit à 2 décimales (centime)
 */
export function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Calcul de l'échéance mensuelle (formule PMT)
 * @param {number} montant - Capital emprunté
 * @param {number} tauxAnnuel - Taux nominal annuel en pourcentage (ex: 3.5 pour 3.5%)
 * @param {number} dureeMois - Durée en mois
 * @returns {number} Échéance mensuelle hors assurance
 */
export function calculerEcheance(montant, tauxAnnuel, dureeMois) {
  if (montant <= 0 || dureeMois <= 0) return 0;
  if (tauxAnnuel === 0) return round2(montant / dureeMois);

  const tauxMensuel = tauxAnnuel / 100 / 12;
  const echeance = montant * (tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -dureeMois)));
  return round2(echeance);
}

/**
 * Calcul du montant empruntable à partir de l'échéance
 * @param {number} echeance - Échéance mensuelle souhaitée
 * @param {number} tauxAnnuel - Taux nominal annuel en pourcentage
 * @param {number} dureeMois - Durée en mois
 * @returns {number} Montant empruntable
 */
export function calculerMontant(echeance, tauxAnnuel, dureeMois) {
  if (echeance <= 0 || dureeMois <= 0) return 0;
  if (tauxAnnuel === 0) return round2(echeance * dureeMois);

  const tauxMensuel = tauxAnnuel / 100 / 12;
  const montant = echeance * (1 - Math.pow(1 + tauxMensuel, -dureeMois)) / tauxMensuel;
  return round2(montant);
}

/**
 * Calcul de la durée à partir du montant et de l'échéance
 * @param {number} montant - Capital emprunté
 * @param {number} echeance - Échéance mensuelle
 * @param {number} tauxAnnuel - Taux nominal annuel en pourcentage
 * @returns {number} Durée en mois (arrondie à l'entier supérieur)
 */
export function calculerDuree(montant, echeance, tauxAnnuel) {
  if (montant <= 0 || echeance <= 0) return 0;
  if (tauxAnnuel === 0) return Math.ceil(montant / echeance);

  const tauxMensuel = tauxAnnuel / 100 / 12;
  // Vérification que l'échéance couvre au moins les intérêts
  if (echeance <= montant * tauxMensuel) return Infinity;

  const duree = -Math.log(1 - montant * tauxMensuel / echeance) / Math.log(1 + tauxMensuel);
  return Math.ceil(duree);
}

/**
 * Calcul du taux par dichotomie (bissection)
 * @param {number} montant - Capital emprunté
 * @param {number} echeance - Échéance mensuelle
 * @param {number} dureeMois - Durée en mois
 * @param {number} precision - Précision souhaitée (défaut: 0.0001%)
 * @returns {number} Taux annuel en pourcentage
 */
export function calculerTaux(montant, echeance, dureeMois, precision = 0.0001) {
  if (montant <= 0 || echeance <= 0 || dureeMois <= 0) return 0;

  // Cas taux = 0 : échéance = montant / durée
  if (Math.abs(echeance - montant / dureeMois) < 0.01) return 0;

  let tauxMin = 0;
  let tauxMax = 50; // 50% max
  let taux = (tauxMin + tauxMax) / 2;
  let iterations = 0;
  const maxIterations = 100;

  while (iterations < maxIterations) {
    const echeanceCalculee = calculerEcheance(montant, taux, dureeMois);
    const diff = echeanceCalculee - echeance;

    if (Math.abs(diff) < precision) break;

    if (diff > 0) {
      tauxMax = taux;
    } else {
      tauxMin = taux;
    }

    taux = (tauxMin + tauxMax) / 2;
    iterations++;
  }

  return round2(taux * 100) / 100; // Arrondi à 2 décimales pour le taux
}

/**
 * Calcul de l'assurance mensuelle
 * @param {number} base - Capital initial ou CRD selon le mode
 * @param {number} tauxAssurance - Taux annuel d'assurance en pourcentage
 * @param {number} quotite - Quotité d'assurance en pourcentage (0-200)
 * @returns {number} Prime d'assurance mensuelle
 */
export function calculerAssurance(base, tauxAssurance, quotite) {
  if (base <= 0 || tauxAssurance <= 0 || quotite <= 0) return 0;
  return round2(base * (tauxAssurance / 100) * (quotite / 100) / 12);
}

/**
 * Calcul des intérêts mensuels
 * @param {number} crd - Capital restant dû
 * @param {number} tauxAnnuel - Taux nominal annuel en pourcentage
 * @returns {number} Intérêts du mois
 */
export function calculerInterets(crd, tauxAnnuel) {
  if (crd <= 0 || tauxAnnuel <= 0) return 0;
  return round2(crd * (tauxAnnuel / 100) / 12);
}

/**
 * Génère le tableau d'amortissement pour un prêt amortissable classique
 */
export function genererAmortissementClassique(montant, tauxAnnuel, dureeMois, tauxAssurance, quotite, assuranceSurCRD) {
  const tableau = [];
  const echeance = calculerEcheance(montant, tauxAnnuel, dureeMois);
  let crd = montant;

  for (let mois = 1; mois <= dureeMois; mois++) {
    const interets = calculerInterets(crd, tauxAnnuel);
    const amortissement = round2(echeance - interets);
    const baseAssurance = assuranceSurCRD ? crd : montant;
    const assurance = calculerAssurance(baseAssurance, tauxAssurance, quotite);

    tableau.push({
      mois,
      crd: round2(crd),
      interets,
      amortissement,
      echeanceHorsAssurance: echeance,
      assurance,
      echeanceTTC: round2(echeance + assurance)
    });

    crd = round2(crd - amortissement);
    if (crd < 0) crd = 0;
  }

  return tableau;
}

/**
 * Génère le tableau d'amortissement pour un PTZ
 * Période de différé sans paiement, puis remboursement linéaire
 */
export function genererAmortissementPTZ(montant, dureeDiffere, dureeRemboursement, tauxAssurance, quotite, assuranceSurCRD) {
  const tableau = [];
  let crd = montant;
  const echeanceRemboursement = round2(montant / dureeRemboursement);

  // Période de différé (pas d'intérêts car taux = 0%)
  for (let mois = 1; mois <= dureeDiffere; mois++) {
    const baseAssurance = assuranceSurCRD ? crd : montant;
    const assurance = calculerAssurance(baseAssurance, tauxAssurance, quotite);

    tableau.push({
      mois,
      crd: round2(crd),
      interets: 0,
      amortissement: 0,
      echeanceHorsAssurance: 0,
      assurance,
      echeanceTTC: assurance
    });
  }

  // Période de remboursement
  for (let mois = dureeDiffere + 1; mois <= dureeDiffere + dureeRemboursement; mois++) {
    const baseAssurance = assuranceSurCRD ? crd : montant;
    const assurance = calculerAssurance(baseAssurance, tauxAssurance, quotite);
    const amortissement = Math.min(echeanceRemboursement, crd);

    tableau.push({
      mois,
      crd: round2(crd),
      interets: 0,
      amortissement: round2(amortissement),
      echeanceHorsAssurance: round2(amortissement),
      assurance,
      echeanceTTC: round2(amortissement + assurance)
    });

    crd = round2(crd - amortissement);
    if (crd < 0) crd = 0;
  }

  return tableau;
}

/**
 * Génère le tableau d'amortissement pour un prêt In Fine
 * Intérêts seulement pendant la durée, capital remboursé à la fin
 */
export function genererAmortissementInFine(montant, tauxAnnuel, dureeMois, tauxAssurance, quotite, assuranceSurCRD) {
  const tableau = [];
  const crd = montant;

  for (let mois = 1; mois <= dureeMois; mois++) {
    const interets = calculerInterets(crd, tauxAnnuel);
    const baseAssurance = assuranceSurCRD ? crd : montant;
    const assurance = calculerAssurance(baseAssurance, tauxAssurance, quotite);
    const isDernierMois = mois === dureeMois;
    const amortissement = isDernierMois ? montant : 0;
    const echeanceHorsAssurance = round2(interets + amortissement);

    tableau.push({
      mois,
      crd: round2(crd),
      interets,
      amortissement,
      echeanceHorsAssurance,
      assurance,
      echeanceTTC: round2(echeanceHorsAssurance + assurance)
    });
  }

  return tableau;
}

/**
 * Génère le tableau d'amortissement pour un Prêt Relais
 * Même logique que In Fine : intérêts seulement, capital remboursé à la vente
 */
export function genererAmortissementRelais(montant, tauxAnnuel, dureeMois, tauxAssurance, quotite, assuranceSurCRD) {
  // Le prêt relais fonctionne comme un In Fine
  return genererAmortissementInFine(montant, tauxAnnuel, dureeMois, tauxAssurance, quotite, assuranceSurCRD);
}

/**
 * Calcule le montant autorisé pour un prêt relais
 * @param {number} valeurBien - Valeur estimée du bien à vendre
 * @param {number} capitalRestantDu - Solde du prêt en cours sur ce bien
 * @param {number} pourcentageFinancement - Pourcentage de la valeur accordé (défaut: 70%)
 * @returns {number} Montant autorisé du relais
 */
export function calculerMontantRelais(valeurBien, capitalRestantDu, pourcentageFinancement = 70) {
  return round2(valeurBien * (pourcentageFinancement / 100) - capitalRestantDu);
}

/**
 * Calcul du taux d'endettement
 * @param {number} chargesMensuelles - Total des échéances mensuelles
 * @param {number} revenusMensuels - Revenus mensuels
 * @returns {number} Taux d'endettement en pourcentage
 */
export function calculerTauxEndettement(chargesMensuelles, revenusMensuels) {
  if (revenusMensuels <= 0) return 0;
  return round2((chargesMensuelles / revenusMensuels) * 100);
}

/**
 * Calcul du Quotient Familial Reste À Vivre
 * @param {number} revenusAnnuels - Revenus annuels bruts
 * @param {number} chargesCreditMensuelles - Charges crédit existantes mensuelles
 * @param {number} nbPersonnes - Nombre de personnes au foyer
 * @returns {number} QF RAV
 */
export function calculerQFRAV(revenusAnnuels, chargesCreditMensuelles, nbPersonnes) {
  if (nbPersonnes <= 0) return 0;
  return round2((revenusAnnuels - chargesCreditMensuelles * 12) / nbPersonnes);
}

/**
 * Calcule les totaux pour un tableau d'amortissement
 */
export function calculerTotaux(tableau) {
  return tableau.reduce((acc, ligne) => ({
    totalInterets: round2(acc.totalInterets + ligne.interets),
    totalAssurance: round2(acc.totalAssurance + ligne.assurance),
    totalEcheances: round2(acc.totalEcheances + ligne.echeanceTTC)
  }), { totalInterets: 0, totalAssurance: 0, totalEcheances: 0 });
}
