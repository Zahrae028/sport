function ageAtEndOfYear(birthDate, year = new Date().getFullYear()) {
  const birth = new Date(birthDate);
  return year - birth.getFullYear();
}

function getAgeCategory(birthDate) {
  const age = ageAtEndOfYear(birthDate);
  if (age < 7) return 'Éveil / Baby-Sport';
  if (age <= 8) return 'U9';
  if (age <= 10) return 'U11';
  if (age <= 12) return 'U13';
  if (age <= 14) return 'U15';
  if (age <= 17) return 'U18';
  if (age <= 39) return 'Senior';
  return 'Master';
}

function checkAgeEligibility(birthDate, targetCategory) {
  if (!targetCategory || targetCategory === 'Tous publics') return true;
  return getAgeCategory(birthDate) === targetCategory;
}

function getMedicalStatus(certificateDate, specialRisk = false) {
  if (!certificateDate) return 'medical_non_compliant';

  const cert = new Date(certificateDate);
  const now = new Date();
  const limitYears = specialRisk ? 1 : 3;
  const expiry = new Date(cert);
  expiry.setFullYear(expiry.getFullYear() + limitYears);

  return expiry >= now ? 'compliant' : 'medical_non_compliant';
}

module.exports = {
  ageAtEndOfYear,
  getAgeCategory,
  checkAgeEligibility,
  getMedicalStatus
};
