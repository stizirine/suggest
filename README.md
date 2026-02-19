# Algorithme de suggestion de termes

Implémentation d'un algorithme de suggestion de termes en TypeScript/Angular 21 avec Jest qui trouve les termes les plus similaires basés sur le nombre de lettres à remplacer.

## Structure du projet

```
src/
  app/
    suggestions/
      suggestion.interface.ts    # Interface TypeScript équivalente à IAmTheTest
      suggestion.service.ts      # Service contenant l'algorithme principal
      suggestion.service.spec.ts # Tests Jest complets
```

## Installation

```bash
npm install
```

## Exécution des tests

```bash
npm test
```

Pour les tests en mode watch :
```bash
npm run test:watch
```

Pour la couverture de code :
```bash
npm run test:coverage
```

## Utilisation

```typescript
import { SuggestionService } from './src/app/suggestions/suggestion.service';

const service = new SuggestionService();

// Exemple fourni dans les spécifications
const result = service.getSuggestions(
  'gros',
  ['gros', 'gras', 'graisse', 'agressif', 'go'],
  2
);
// Retourne: ['gros', 'gras']
```

## Algorithme

L'algorithme fonctionne en plusieurs étapes :

1. **Normalisation** : Convertit tous les termes en minuscules et ne garde que les caractères alphanumériques
2. **Filtrage** : Garde uniquement les termes dont la longueur est >= longueur du terme recherché
3. **Calcul de similarité** : Pour chaque candidat valide :
   - Si longueur exacte : calcule le nombre de lettres différentes
   - Si longueur > terme : teste toutes les sous-chaînes possibles et prend le score minimum
4. **Tri multi-critères** :
   - Par nombre de différences (croissant)
   - En cas d'égalité : par différence de longueur avec le terme recherché (croissant)
   - En cas d'égalité encore : par ordre alphabétique
5. **Retour** : Retourne les N premiers résultats

## Exemple de l'algorithme

Pour `getSuggestions("gros", ["gros", "gras", "graisse", "agressif", "go"], 2)` :

- `gros` = 0 différence (exact match)
- `gras` = 1 différence (o → a)
- `graisse` = 2 différences (meilleure sous-chaîne "gras" avec 1 diff, mais le mot complet a 2 diff)
- `agressif` = rejeté (trop de différences dans toutes les sous-chaînes)
- `go` = rejeté (trop court)

Résultat : `['gros', 'gras']`

## Cas de tests

Les tests couvrent :
- ✅ Cas de base (exemple fourni)
- ✅ Calcul de différences (`getDifferenceScore`)
- ✅ Filtrage des termes trop courts
- ✅ Tri multi-critères
- ✅ Normalisation (majuscules/minuscules, caractères spéciaux)
- ✅ Cas limites (liste vide, terme vide, etc.)
- ✅ Calcul avec sous-chaînes pour termes plus longs
