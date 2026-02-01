// Barème des assurances emprunteur (selon CDC)
export const baremeAssurances = [
  { categorie: 'Prêts en euros', profil: 'Immo Casden < 35 ans', taux: 0.188, surCRD: false },
  { categorie: 'Prêts en euros', profil: 'Dérog immo jeunes < 35 ans', taux: 0.23, surCRD: false },
  { categorie: 'Prêts en euros', profil: 'Immo Casden > 35 ans', taux: 0.261, surCRD: false },
  { categorie: 'Prêts en euros', profil: 'Immo jeunes < 30 ans', taux: 0.282, surCRD: false },
  { categorie: 'Prêts en euros', profil: 'De 30 à 50 ans', taux: 0.3842, surCRD: false },
  { categorie: 'Prêts en euros', profil: 'De 50 à 65 ans', taux: 0.45, surCRD: false },
  { categorie: 'Prêts en euros', profil: '> 65 ans DC seul', taux: 1.74, surCRD: false },
  { categorie: 'Prêts en euros', profil: 'Dérog 35-65 ans', taux: 0.564, surCRD: false },
  { categorie: 'Prêts CHF', profil: 'Immo jeune < 30 ans', taux: 0.40, surCRD: true },
  { categorie: 'Prêts CHF', profil: 'Base 30-65 ans', taux: 0.60, surCRD: true },
  { categorie: 'Prêts CHF', profil: 'Dérog immo jeune < 35 ans', taux: 0.36, surCRD: true },
  { categorie: 'Prêts CHF', profil: 'Dérog 35-65 ans', taux: 0.54, surCRD: true },
  { categorie: 'Autres', profil: 'Saisie libre', taux: 0.24, surCRD: false }
];
