<script>
  import { emprunteur, indicateursEmprunteur } from '../stores/emprunteur.js';
  import { tableauConsolide, prets } from '../stores/prets.js';
  import { calculerTauxEndettement, calculerMontantRelais } from '../utils/calculs.js';

  $: alertes = calculerAlertes($emprunteur, $indicateursEmprunteur, $tableauConsolide, $prets);

  function calculerAlertes(emprunteur, indicateurs, tableau, prets) {
    const result = [];

    if (emprunteur.revenusAnnuels > 0 && !indicateurs.qfOk) {
      result.push({
        type: 'warning',
        icon: 'qf',
        message: `Quotient Familial RAV insuffisant`,
        detail: `${formatMontant(indicateurs.qfRAV)} < ${formatMontant(indicateurs.qfReference)} (référence)`
      });
    }

    if (tableau.length > 0 && indicateurs.revenusMensuels > 0) {
      const premierDepassement = tableau.find(ligne => {
        const taux = calculerTauxEndettement(ligne.echeanceTotale, indicateurs.revenusMensuels);
        return taux > emprunteur.seuilEndettementMax;
      });

      if (premierDepassement) {
        const tauxMax = Math.max(...tableau.map(ligne =>
          calculerTauxEndettement(ligne.echeanceTotale, indicateurs.revenusMensuels)
        ));
        result.push({
          type: 'error',
          icon: 'endettement',
          message: `Endettement dépasse ${emprunteur.seuilEndettementMax}%`,
          detail: `Maximum atteint : ${tauxMax.toFixed(1)}% au mois ${premierDepassement.mois}`
        });
      }
    }

    prets.forEach((pret, index) => {
      if (pret.actif && pret.type === 'relais') {
        const montantAutorise = calculerMontantRelais(
          pret.valeurBien,
          pret.capitalRestantDu,
          pret.pourcentageFinancement
        );
        if (montantAutorise < 0) {
          result.push({
            type: 'error',
            icon: 'relais',
            message: `Prêt relais ${index + 1} : montant négatif`,
            detail: `Capital restant dû trop élevé par rapport à la valeur du bien`
          });
        }
      }
    });

    return result;
  }

  function formatMontant(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }
</script>

{#if alertes.length > 0}
  <div class="alertes-container">
    {#each alertes as alerte}
      <div class="alerte alerte-{alerte.type}">
        <div class="alerte-icon">
          {#if alerte.icon === 'qf'}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          {:else if alerte.icon === 'endettement'}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          {:else}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          {/if}
        </div>
        <div class="alerte-content">
          <span class="alerte-message">{alerte.message}</span>
          <span class="alerte-detail">{alerte.detail}</span>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .alertes-container {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    margin-bottom: 1.25rem;
  }

  .alerte {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    padding: 0.85rem 1.15rem;
    border-radius: 10px;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .alerte-error {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border: 1px solid #fca5a5;
  }

  .alerte-warning {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border: 1px solid #fcd34d;
  }

  .alerte-icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .alerte-error .alerte-icon {
    background: #ef4444;
    color: white;
  }

  .alerte-warning .alerte-icon {
    background: #f59e0b;
    color: white;
  }

  .alerte-content {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding-top: 0.15rem;
  }

  .alerte-message {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .alerte-error .alerte-message {
    color: #b91c1c;
  }

  .alerte-warning .alerte-message {
    color: #92400e;
  }

  .alerte-detail {
    font-size: 0.8rem;
  }

  .alerte-error .alerte-detail {
    color: #dc2626;
  }

  .alerte-warning .alerte-detail {
    color: #b45309;
  }
</style>
