import { describe, it, expect } from 'vitest';
import {
  calculerEcheance,
  calculerMontant,
  calculerDuree,
  calculerTaux,
  calculerAssurance,
  calculerInterets,
  genererAmortissementClassique,
  genererAmortissementPTZ,
  genererAmortissementInFine,
  calculerMontantRelais,
  calculerTauxEndettement,
  calculerQFRAV,
  calculerTotaux,
  round2
} from './calculs.js';

describe('Fonctions utilitaires', () => {
  it('round2 arrondit correctement à 2 décimales', () => {
    expect(round2(123.456)).toBe(123.46);
    expect(round2(123.454)).toBe(123.45);
    expect(round2(100)).toBe(100);
  });
});

describe('Calcul PMT (échéance)', () => {
  it('calcule une échéance standard', () => {
    // Prêt 200 000€, 3.5%, 240 mois (20 ans)
    const echeance = calculerEcheance(200000, 3.5, 240);
    expect(echeance).toBeCloseTo(1159.92, 0); // Valeur attendue ~1159.92€
  });

  it('gère le taux à 0%', () => {
    const echeance = calculerEcheance(120000, 0, 240);
    expect(echeance).toBe(500); // 120000 / 240 = 500
  });

  it('retourne 0 pour montant ou durée invalide', () => {
    expect(calculerEcheance(0, 3.5, 240)).toBe(0);
    expect(calculerEcheance(200000, 3.5, 0)).toBe(0);
  });
});

describe('Calcul inverse du montant', () => {
  it('retrouve le montant à partir de l\'échéance', () => {
    const montant = calculerMontant(1159.92, 3.5, 240);
    expect(montant).toBeCloseTo(200000, -2); // Précision à 100€ près
  });

  it('gère le taux à 0%', () => {
    const montant = calculerMontant(500, 0, 240);
    expect(montant).toBe(120000);
  });
});

describe('Calcul inverse de la durée', () => {
  it('retrouve la durée à partir du montant et de l\'échéance', () => {
    const duree = calculerDuree(200000, 1159.92, 3.5);
    expect(duree).toBe(240);
  });

  it('gère le taux à 0%', () => {
    const duree = calculerDuree(120000, 500, 0);
    expect(duree).toBe(240);
  });

  it('retourne Infinity si l\'échéance ne couvre pas les intérêts', () => {
    const duree = calculerDuree(200000, 100, 3.5);
    expect(duree).toBe(Infinity);
  });
});

describe('Calcul inverse du taux (dichotomie)', () => {
  it('retrouve le taux à partir du montant, durée et échéance', () => {
    const taux = calculerTaux(200000, 1159.92, 240);
    expect(taux).toBeCloseTo(3.5, 1);
  });

  it('détecte un taux à 0%', () => {
    const taux = calculerTaux(120000, 500, 240);
    expect(taux).toBe(0);
  });
});

describe('Calcul assurance', () => {
  it('calcule l\'assurance mensuelle sur capital initial', () => {
    // 200 000€, 0.36%, quotité 100%
    const assurance = calculerAssurance(200000, 0.36, 100);
    expect(assurance).toBe(60); // 200000 * 0.0036 / 12 = 60
  });

  it('gère la quotité partielle', () => {
    const assurance = calculerAssurance(200000, 0.36, 50);
    expect(assurance).toBe(30);
  });
});

describe('Calcul intérêts mensuels', () => {
  it('calcule les intérêts du mois', () => {
    const interets = calculerInterets(200000, 3.5);
    expect(interets).toBeCloseTo(583.33, 1);
  });
});

describe('Tableau amortissement classique', () => {
  it('génère un tableau avec le bon nombre de lignes', () => {
    const tableau = genererAmortissementClassique(200000, 3.5, 240, 0.36, 100, false);
    expect(tableau.length).toBe(240);
  });

  it('le CRD diminue à chaque mois', () => {
    const tableau = genererAmortissementClassique(100000, 3, 120, 0, 0, false);
    for (let i = 1; i < tableau.length; i++) {
      expect(tableau[i].crd).toBeLessThan(tableau[i - 1].crd);
    }
  });

  it('le CRD final est proche de 0', () => {
    const tableau = genererAmortissementClassique(100000, 3, 120, 0, 0, false);
    const derniereLigne = tableau[tableau.length - 1];
    expect(derniereLigne.crd - derniereLigne.amortissement).toBeCloseTo(0, 0);
  });
});

describe('Tableau amortissement PTZ', () => {
  it('génère un tableau avec différé + remboursement', () => {
    const tableau = genererAmortissementPTZ(40000, 60, 180, 0, 0, false);
    expect(tableau.length).toBe(240); // 60 + 180
  });

  it('pas de remboursement pendant le différé', () => {
    const tableau = genererAmortissementPTZ(40000, 60, 180, 0, 0, false);
    for (let i = 0; i < 60; i++) {
      expect(tableau[i].amortissement).toBe(0);
      expect(tableau[i].echeanceHorsAssurance).toBe(0);
    }
  });

  it('remboursement linéaire après le différé', () => {
    const tableau = genererAmortissementPTZ(40000, 60, 180, 0, 0, false);
    const echeanceAttendue = round2(40000 / 180);
    expect(tableau[60].echeanceHorsAssurance).toBeCloseTo(echeanceAttendue, 0);
  });
});

describe('Tableau amortissement In Fine', () => {
  it('le CRD reste constant jusqu\'à la fin', () => {
    const tableau = genererAmortissementInFine(100000, 4, 24, 0, 0, false);
    for (let i = 0; i < tableau.length - 1; i++) {
      expect(tableau[i].crd).toBe(100000);
      expect(tableau[i].amortissement).toBe(0);
    }
  });

  it('remboursement total au dernier mois', () => {
    const tableau = genererAmortissementInFine(100000, 4, 24, 0, 0, false);
    const derniereLigne = tableau[tableau.length - 1];
    expect(derniereLigne.amortissement).toBe(100000);
  });
});

describe('Calcul montant relais', () => {
  it('calcule le montant autorisé', () => {
    // Bien 300 000€, reste 50 000€, 70%
    const montant = calculerMontantRelais(300000, 50000, 70);
    expect(montant).toBe(160000); // 300000 * 0.7 - 50000
  });

  it('peut être négatif si le CRD dépasse la valeur financée', () => {
    const montant = calculerMontantRelais(100000, 80000, 70);
    expect(montant).toBe(-10000); // 70000 - 80000
  });
});

describe('Calcul taux endettement', () => {
  it('calcule le pourcentage d\'endettement', () => {
    const taux = calculerTauxEndettement(1200, 4000);
    expect(taux).toBe(30);
  });
});

describe('Calcul QF RAV', () => {
  it('calcule le quotient familial reste à vivre', () => {
    // Revenus 60 000€/an, charges 500€/mois, 3 personnes
    const qf = calculerQFRAV(60000, 500, 3);
    expect(qf).toBe(18000); // (60000 - 6000) / 3
  });
});

describe('Calcul totaux', () => {
  it('calcule les totaux d\'un tableau', () => {
    const tableau = [
      { interets: 100, assurance: 20, echeanceTTC: 520 },
      { interets: 90, assurance: 20, echeanceTTC: 510 },
      { interets: 80, assurance: 20, echeanceTTC: 500 }
    ];
    const totaux = calculerTotaux(tableau);
    expect(totaux.totalInterets).toBe(270);
    expect(totaux.totalAssurance).toBe(60);
    expect(totaux.totalEcheances).toBe(1530);
  });
});
