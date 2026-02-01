<script>
  import ZoneEmprunteur from './lib/components/ZoneEmprunteur.svelte';
  import ZonePrets from './lib/components/ZonePrets.svelte';
  import TableauAmortissement from './lib/components/TableauAmortissement.svelte';
  import AlertesBandeau from './lib/components/AlertesBandeau.svelte';
  import BaremeAssurances from './lib/components/BaremeAssurances.svelte';
  import ExportPDF from './lib/components/ExportPDF.svelte';
  import GestionSimulations from './lib/components/GestionSimulations.svelte';
  import GraphiquesEvolution from './lib/components/GraphiquesEvolution.svelte';
</script>

<div class="min-h-screen bg-surface-50">
  <!-- Header -->
  <header class="sticky top-0 z-50 bg-gradient-to-r from-primary-800 to-primary-600 shadow-xl">
    <div class="max-w-[1800px] mx-auto px-4 py-3 flex justify-between items-center flex-wrap gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 100 100" class="text-white">
            <path d="M25 70 L50 30 L75 70 Z" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>
            <line x1="35" y1="55" x2="65" y2="55" stroke="currentColor" stroke-width="8"/>
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-semibold text-white tracking-tight">Simulateur de Prêt Immobilier</h1>
          <p class="text-xs text-white/60">Plan de financement multi-prêts</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <GestionSimulations />
        <BaremeAssurances />
        <ExportPDF />
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-[1800px] mx-auto p-4 lg:p-6">
    <AlertesBandeau />

    <div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 mb-6">
      <div class="lg:sticky lg:top-24 lg:h-fit">
        <ZoneEmprunteur />
      </div>
      <div>
        <ZonePrets />
      </div>
    </div>

    <GraphiquesEvolution />

    <TableauAmortissement />
  </main>

  <!-- Footer -->
  <footer class="bg-primary-900 text-white/60 text-center py-4 text-sm mt-auto">
    <p>Simulateur de prêt immobilier - Calculs à titre indicatif</p>
  </footer>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }

  :global(input[type="number"]) {
    -moz-appearance: textfield;
  }

  :global(input::-webkit-outer-spin-button),
  :global(input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
