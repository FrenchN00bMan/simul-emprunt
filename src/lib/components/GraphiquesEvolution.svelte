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

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  $: tableauxActifs = $tableauxAmortissement.filter(t => t.actif && t.tableau.length > 0);

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
    const labels = $tableauConsolide.map(l => l.mois);
    const datasets = tableauxActifs.map((t, i) => ({
      label: t.label,
      data: $tableauConsolide.map(l => l.prets[t.index]?.crd || 0),
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length] + '15',
      fill: true,
      tension: 0.2,
      pointRadius: 0,
      pointHoverRadius: 3,
      borderWidth: 2
    }));

    chartCRD = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false
          },
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 6,
              padding: 12,
              font: { size: 11, family: "'DM Sans', sans-serif" }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1e293b',
            titleFont: { family: "'DM Sans', sans-serif", size: 12 },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
            padding: 10,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${formatMontant(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            title: { display: false },
            grid: { display: false },
            ticks: {
              maxTicksLimit: 10,
              font: { size: 10, family: "'JetBrains Mono', monospace" },
              color: '#9ca3af',
              callback: (value, index) => index % 12 === 0 ? labels[index] : ''
            }
          },
          y: {
            title: { display: false },
            grid: { color: '#f0f1f3' },
            ticks: {
              font: { size: 10, family: "'JetBrains Mono', monospace" },
              color: '#9ca3af',
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
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f615',
            fill: true,
            tension: 0.2,
            pointRadius: 0,
            pointHoverRadius: 3,
            borderWidth: 2
          },
          {
            label: `Seuil (${seuil}%)`,
            data: labels.map(() => seuil),
            borderColor: '#ef4444',
            borderDash: [4, 4],
            borderWidth: 1.5,
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: false },
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 6,
              padding: 12,
              font: { size: 11, family: "'DM Sans', sans-serif" }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1e293b',
            titleFont: { family: "'DM Sans', sans-serif", size: 12 },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
            padding: 10,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`
            }
          }
        },
        scales: {
          x: {
            title: { display: false },
            grid: { display: false },
            ticks: {
              maxTicksLimit: 10,
              font: { size: 10, family: "'JetBrains Mono', monospace" },
              color: '#9ca3af',
              callback: (value, index) => index % 12 === 0 ? labels[index] : ''
            }
          },
          y: {
            title: { display: false },
            grid: { color: '#f0f1f3' },
            min: 0,
            max: Math.max(45, Math.max(...dataEndettement) + 5),
            ticks: {
              font: { size: 10, family: "'JetBrains Mono', monospace" },
              color: '#9ca3af',
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
  <section class="charts-section">
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">Capital restant dû</span>
        </div>
        <div class="chart-body">
          <canvas bind:this={canvasCRD}></canvas>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">Taux d'endettement</span>
        </div>
        <div class="chart-body">
          <canvas bind:this={canvasEndettement}></canvas>
        </div>
      </div>
    </div>
  </section>
{/if}

<style>
  .charts-section {
    margin-bottom: 1.25rem;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .chart-card {
    background: #ffffff;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }

  .chart-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f0f1f3;
    background: #f9fafb;
  }

  .chart-title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #374151;
  }

  .chart-body {
    padding: 0.75rem 1rem 0.5rem;
    height: 220px;
  }

  @media (max-width: 900px) {
    .charts-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
