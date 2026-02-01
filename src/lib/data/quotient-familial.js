// Table du Quotient Familial de référence (intégrée en dur selon CDC)
export const quotientFamilialReference = {
  1: 610,
  2: 460,
  3: 420,
  4: 370,
  5: 340,
  6: 310,
  7: 290,
  8: 250,
  9: 230
};

export function getQFReference(nbPersonnes) {
  return quotientFamilialReference[nbPersonnes] || quotientFamilialReference[9];
}
