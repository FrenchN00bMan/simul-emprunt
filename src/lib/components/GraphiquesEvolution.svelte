<script>
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  import { tableauConsolide, tableauxAmortissement } from '../stores/prets.js';
  import { emprunteur, indicateursEmprunteur } from '../stores/emprunteur.js';
  import { calculerTauxEndettement } from '../utils/calculs.js';

  let chartCRD = null;
  let chartEndettement = null;
  let canvasCRD;
  let canvasEndettement;

  // Couleurs pour les prêts
  const colors = [
    '#3182ce', // Bleu
    '#48bb78', // Vert
    '#ed8936', // Orange
    '#9f7aea', // Violet
    '#f56565'  // Rouge
  ];

  // Tableau actifs pour les graphiques
  $: tableauxActifs = $tableauxAmortissement.filter(t => t.actif && t.tableau.length > 0);

  // Mise à jour des graphiques quand les données changent
  $: if (canvasCRD && canvasEndettement && $tableauConsolide.length > 0) {
    updateCharts();
  }

  onMount(() => {
    if ($tableauConsolide.length > 0) {
      initCharts();
    }
  });

  onDestroy(() => {
    if (chartCRD) chartCRD.destroy();
    if (chartEndettement) chartEndettement.destroy();
  });

  function initCharts() {
    createCRDChart();
    createEndettementChart();
  }

  function updateCharts() {
    if (chartCRD) chartCRD.destroy();
    if (chartEndettement) chartEndettement.destroy();
    initCharts();
  }

  function createCRDChart() {
    if (!canvasCRD) return;

    const ctx = canvasCRD.getContext('2d');

    // Préparer les données
    const labels = $tableauConsolide.map(l => l.mois);
    const datasets = tableauxActifs.map((t, i) => ({
      label: t.label,
      data: $tableauConsolide.map(l => l.prets[t.index]?.crd || 0),
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length] + '20',
      fill: true,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 4
    }));

    chartCRD = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Capital Restant Dû par prêt',
            font: { size: 14, weight: 'bold' },
            color: '#1a365d'
          },
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, boxWidth: 8 }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${formatMontant(context.raw)}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Mois' },
            ticks: {
              maxTicksLimit: 12,
              callback: (value, index) => {
                // Afficher tous les 12 mois
                return index % 12 === 0 ? labels[index] : '';
              }
            }
          },
          y: {
            title: { display: true, text: 'Capital (€)' },
            ticks: {
              callback: (value) => formatMontantCourt(value)
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  function createEndettementChart() {
    if (!canvasEndettement) return;

    const ctx = canvasEndettement.getContext('2d');

    // Préparer les données
    const labels = $tableauConsolide.map(l => l.mois);
    const dataEndettement = $tableauConsolide.map(l =>
      calculerTauxEndettement(l.echeanceTotale, $indicateursEmprunteur.revenusMensuels)
    );
    const seuil = $emprunteur.seuilEndettementMax;

    chartEndettement = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Taux d\'endettement',
            data: dataEndettement,
            borderColor: '#3182ce',
            backgroundColor: '#3182ce20',
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4
          },
          {
            label: `Seuil max (${seuil}%)`,
            data: labels.map(() => seuil),
            borderColor: '#f56565',
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Évolution du taux d\'endettement',
            font: { size: 14, weight: 'bold' },
            color: '#1a365d'
          },
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, boxWidth: 8 }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Mois' },
            ticks: {
              maxTicksLimit: 12,
              callback: (value, index) => {
                return index % 12 === 0 ? labels[index] : '';
              }
            }
          },
          y: {
            title: { display: true, text: 'Taux (%)' },
            min: 0,
            max: Math.max(45, Math.max(...dataEndettement) + 5),
            ticks: {
              callback: (value) => value + '%'
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  function formatMontant(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatMontantCourt(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M€';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'k€';
    return value + '€';
  }
</script>

{#if $tableauConsolide.length > 0}
  <section class="graphiques">
    <h2>Graphiques d'évolution</h2>
    <div class="charts-container">
      <div class="chart-wrapper">
        <canvas bind:this={canvasCRD}></canvas>
      </div>
      <div class="chart-wrapper">
        <canvas bind:this={canvasEndettement}></canvas>
      </div>
    </div>
  </section>
{/if}

<style>
  .graphiques {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  h2 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: #1a365d;
    border-bottom: 2px solid #1a365d;
    padding-bottom: 0.5rem;
  }

  .charts-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .chart-wrapper {
    background: white;
    border-radius: 6px;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    height: 300px;
  }

  @media (max-width: 900px) {
    .charts-container {
      grid-template-columns: 1fr;
    }
  }
</style>
