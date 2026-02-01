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
        message: `Quotient Familial insuffisant`,
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
          detail: `Maximum : ${tauxMax.toFixed(1)}% au mois ${premierDepassement.mois}`
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
            detail: `CRD trop élevé par rapport à la valeur du bien`
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
  <div class="alerts-strip">
    {#each alertes as alerte}
      <div class="alert alert-{alerte.type}">
        <div class="alert-icon">
          {#if alerte.icon === 'qf'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          {:else if alerte.icon === 'endettement'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          {/if}
        </div>
        <div class="alert-content">
          <span class="alert-message">{alerte.message}</span>
          <span class="alert-detail">{alerte.detail}</span>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .alerts-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
    margin-bottom: 1.25rem;
  }

  .alert {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.625rem 1rem;
    border-radius: 8px;
    flex: 1;
    min-width: 280px;
    animation: fadeIn 0.25s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .alert-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
  }

  .alert-warning {
    background: #fffbeb;
    border: 1px solid #fde68a;
  }

  .alert-icon {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .alert-icon svg {
    width: 16px;
    height: 16px;
  }

  .alert-error .alert-icon {
    background: #ef4444;
    color: white;
  }

  .alert-warning .alert-icon {
    background: #f59e0b;
    color: white;
  }

  .alert-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .alert-message {
    font-weight: 600;
    font-size: 0.8125rem;
  }

  .alert-error .alert-message {
    color: #b91c1c;
  }

  .alert-warning .alert-message {
    color: #92400e;
  }

  .alert-detail {
    font-size: 0.75rem;
    font-family: 'JetBrains Mono', monospace;
  }

  .alert-error .alert-detail {
    color: #dc2626;
  }

  .alert-warning .alert-detail {
    color: #b45309;
  }

  @media (max-width: 640px) {
    .alert {
      min-width: 100%;
    }
  }
</style>
