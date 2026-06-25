const fs = require('fs');
const path = require('path');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const placesFile = fs.readFileSync(path.join(__dirname, '..', 'lib', 'places.ts'), 'utf8');
const interventionsFile = fs.readFileSync(path.join(__dirname, '..', 'lib', 'interventions.ts'), 'utf8');
const storeFile = fs.readFileSync(path.join(__dirname, '..', 'store', 'useAppStore.ts'), 'utf8');
const homeFile = fs.readFileSync(path.join(__dirname, '..', 'app', '(tabs)', 'home.tsx'), 'utf8');
const searchFile = fs.readFileSync(path.join(__dirname, '..', 'app', '(onboarding)', 'place-search.tsx'), 'utf8');
const permissionsFile = fs.readFileSync(path.join(__dirname, '..', 'app', '(onboarding)', 'permissions.tsx'), 'utf8');

assert(placesFile.includes('Starbucks'), 'Expected Starbucks example seed in places.ts');
assert(placesFile.includes('searchPlaces'), 'Expected searchPlaces helper');
assert(placesFile.includes('placeToDangerZone'), 'Expected placeToDangerZone helper');
assert(interventionsFile.includes('estimateSpendByCategory'), 'Expected category spend estimator');
assert(interventionsFile.includes('vacation fund'), 'Expected vacation intervention copy');
assert(storeFile.includes('createJSONStorage'), 'Expected persisted Zustand storage');
assert(searchFile.includes("'starbucks'"), 'Expected Starbucks preload in place-search screen');
assert(permissionsFile.includes('walk into'), 'Expected value-driven permission copy');
assert(homeFile.includes('Send test guardrail'), 'Expected test guardrail CTA on home screen');

console.log('PASS: Core Guardrail MVP structure validated.');
console.log('PASS: Starbucks location example detected.');
console.log('PASS: Persisted store and test notification flow detected.');
