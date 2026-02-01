<script>
  import { prets } from '../stores/prets.js';
  import ColonnePret from './ColonnePret.svelte';
</script>

<section class="zone-prets">
  <div class="section-header">
    <div class="header-title">
      <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
      <span>Configuration des prêts</span>
    </div>
  </div>

  <div class="prets-grid">
    {#each $prets as pret, index}
      <ColonnePret {pret} {index} />
    {/each}
  </div>
</section>

<style>
  .zone-prets {
    background: #ffffff;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    margin-bottom: 1.25rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.875rem 1.25rem;
    background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .header-icon {
    width: 18px;
    height: 18px;
  }

  .prets-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1px;
    background: #e5e7eb;
    padding: 1px;
  }

  @media (max-width: 1400px) {
    .prets-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 900px) {
    .prets-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .prets-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
