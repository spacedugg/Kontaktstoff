const calculator = document.querySelector<HTMLElement>('[data-calculator]');
if (calculator) {
  const quantity = calculator.querySelector<HTMLSelectElement>('[data-calc-quantity]')!;
  const keys = ['interactions', 'visits', 'actions'];
  const rates = keys.map(key => calculator.querySelector<HTMLInputElement>(`[data-calc-rate="${key}"]`)!);
  const format = new Intl.NumberFormat('de-DE');
  function recalculate() {
    let previous = 100;
    rates.forEach((input, index) => {
      const rate = Math.min(previous, Math.max(0, Number(input.value)));
      input.max = String(previous); input.value = String(rate);
      input.setAttribute('aria-valuetext', `${rate} Prozent der versandten Karten`);
      calculator!.querySelector<HTMLElement>(`[data-rate-label="${keys[index]}"]`)!.textContent = String(rate);
      calculator!.querySelector<HTMLOutputElement>(`[data-calc-result="${keys[index]}"]`)!.value = format.format(Math.round(Number(quantity.value) * rate / 100));
      previous = rate;
    });
  }
  quantity.addEventListener('change', recalculate);
  rates.forEach(input => input.addEventListener('input', recalculate));
  recalculate();
}
