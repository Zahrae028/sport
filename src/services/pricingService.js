function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function calculatePrice({ basePrice, resident, familyRegistrationCount, familyQuotient, hasPassSport }) {
  let price = Number(basePrice);
  const details = [];

  details.push(`Tarif de base : ${price.toFixed(2)} €`);

  if (!resident) {
    price *= 1.35;
    details.push('Majoration non-résident : +35%');
  }

  if (familyRegistrationCount === 1) {
    price *= 0.85;
    details.push('2e inscription du foyer : -15%');
  } else if (familyRegistrationCount >= 2) {
    price *= 0.70;
    details.push('3e inscription ou suivante : -30%');
  }

  const qf = Number(familyQuotient);
  if (qf < 600) {
    price *= 0.60;
    details.push('Quotient familial < 600 : -40%');
  } else if (qf <= 900) {
    price *= 0.80;
    details.push('Quotient familial entre 600 et 900 : -20%');
  }

  if (hasPassSport) {
    price -= 50;
    details.push("Pass'Sport : -50 €");
  }

  price = Math.max(15, round2(price));
  return { finalPrice: price, details };
}

function calculateInstallments(total) {
  const t = round2(total);
  let second = round2(t * 0.30);
  let third = round2(t * 0.30);
  let first = round2(t - second - third);

  return [first, second, third];
}

module.exports = { calculatePrice, calculateInstallments };
