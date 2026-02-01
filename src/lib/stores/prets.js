import { writable, derived } from 'svelte/store';
import {
  calculerEcheance,
  genererAmortissementClassique,
  genererAmortissementPTZ,
  genererAmortissementInFine,
  genererAmortissementRelais,
  calculerMontantRelais,
  calculerTotaux,
  round2
} from '../utils/calculs.js';

// Types de prêts disponibles
export const TYPES_PRETS = {
  AMORTISSABLE: 'amortissable',
  PTZ: 'ptz',
  IN_FINE: 'inFine',
  RELAIS: 'relais'
};

// Configuration par défaut d'un prêt
function createDefaultPret(index) {
  return {
    id: index,
    actif: index === 0, // Seul le premier est actif par défaut
    type: TYPES_PRETS.AMORTISSABLE,
    label: index === 0 ? 'Prêt principal' : `Prêt ${index + 1}`,
    montant: 0,
    dureeMois: 240,
    tauxAnnuel: 3.5,
    tauxAssurance: 0.36,
    quotiteAssurance: 100,
    assuranceSurCRD: false,
    // Paramètres PTZ
    dureeDiffere: 60,
    dureeRemboursement: 180,
    // Paramètres Relais
    valeurBien: 0,
    capitalRestantDu: 0,
    pourcentageFinancement: 70,
    // Calculateur : champ à calculer (null = aucun, 'montant', 'duree', 'taux', 'echeance')
    champACalculer: null,
    echeanceCible: 0
  };
}

// Store des 5 prêts
export const prets = writable([
  createDefaultPret(0),
  createDefaultPret(1),
  createDefaultPret(2),
  createDefaultPret(3),
  createDefaultPret(4)
]);

// Fonction pour mettre à jour un prêt spécifique
export function updatePret(index, updates) {
  prets.update(current => {
    const newPrets = [...current];
    newPrets[index] = { ...newPrets[index], ...updates };
    return newPrets;
  });
}

// Fonction pour réinitialiser un prêt
export function resetPret(index) {
  prets.update(current => {
    const newPrets = [...current];
    newPrets[index] = createDefaultPret(index);
    return newPrets;
  });
}

// Calcul des tableaux d'amortissement pour chaque prêt actif
export const tableauxAmortissement = derived(prets, ($prets) => {
  return $prets.map((pret, index) => {
    if (!pret.actif || pret.montant <= 0) {
      return { index, actif: false, tableau: [], totaux: null };
    }

    let tableau = [];

    switch (pret.type) {
      case TYPES_PRETS.AMORTISSABLE:
        tableau = genererAmortissementClassique(
          pret.montant,
          pret.tauxAnnuel,
          pret.dureeMois,
          pret.tauxAssurance,
          pret.quotiteAssurance,
          pret.assuranceSurCRD
        );
        break;

      case TYPES_PRETS.PTZ:
        tableau = genererAmortissementPTZ(
          pret.montant,
          pret.dureeDiffere,
          pret.dureeRemboursement,
          pret.tauxAssurance,
          pret.quotiteAssurance,
          pret.assuranceSurCRD
        );
        break;

      case TYPES_PRETS.IN_FINE:
        tableau = genererAmortissementInFine(
          pret.montant,
          pret.tauxAnnuel,
          pret.dureeMois,
          pret.tauxAssurance,
          pret.quotiteAssurance,
          pret.assuranceSurCRD
        );
        break;

      case TYPES_PRETS.RELAIS:
        const montantRelais = calculerMontantRelais(
          pret.valeurBien,
          pret.capitalRestantDu,
          pret.pourcentageFinancement
        );
        tableau = genererAmortissementRelais(
          montantRelais > 0 ? montantRelais : 0,
          pret.tauxAnnuel,
          pret.dureeMois,
          pret.tauxAssurance,
          pret.quotiteAssurance,
          pret.assuranceSurCRD
        );
        break;
    }

    const totaux = calculerTotaux(tableau);

    return {
      index,
      actif: true,
      label: pret.label,
      type: pret.type,
      tableau,
      totaux,
      echeanceMoyenne: tableau.length > 0 ? round2(totaux.totalEcheances / tableau.length) : 0
    };
  });
});

// Tableau consolidé (toutes les échéances mois par mois)
export const tableauConsolide = derived(tableauxAmortissement, ($tableaux) => {
  const tableauxActifs = $tableaux.filter(t => t.actif && t.tableau.length > 0);

  if (tableauxActifs.length === 0) return [];

  // Trouver la durée maximale
  const dureeMax = Math.max(...tableauxActifs.map(t => t.tableau.length));

  const consolide = [];

  for (let mois = 1; mois <= dureeMax; mois++) {
    const ligneConsolidee = {
      mois,
      prets: {},
      echeanceTotale: 0,
      interetsTotaux: 0,
      assuranceTotale: 0
    };

    tableauxActifs.forEach(t => {
      const lignePret = t.tableau.find(l => l.mois === mois);
      if (lignePret) {
        ligneConsolidee.prets[t.index] = lignePret;
        ligneConsolidee.echeanceTotale = round2(ligneConsolidee.echeanceTotale + lignePret.echeanceTTC);
        ligneConsolidee.interetsTotaux = round2(ligneConsolidee.interetsTotaux + lignePret.interets);
        ligneConsolidee.assuranceTotale = round2(ligneConsolidee.assuranceTotale + lignePret.assurance);
      }
    });

    consolide.push(ligneConsolidee);
  }

  return consolide;
});

// Totaux globaux
export const totauxGlobaux = derived([tableauxAmortissement, prets], ([$tableaux, $prets]) => {
  const actifs = $tableaux.filter(t => t.actif && t.totaux);

  // Calculer le capital total emprunté depuis les prêts actifs
  const totalCapital = round2($prets
    .filter(p => p.actif && p.montant > 0)
    .reduce((sum, p) => sum + p.montant, 0));

  return {
    totalCapital,
    totalInterets: round2(actifs.reduce((sum, t) => sum + t.totaux.totalInterets, 0)),
    totalAssurance: round2(actifs.reduce((sum, t) => sum + t.totaux.totalAssurance, 0)),
    totalCredit: round2(actifs.reduce((sum, t) => sum + t.totaux.totalInterets + t.totaux.totalAssurance, 0)),
    nbPretsActifs: actifs.length
  };
});
