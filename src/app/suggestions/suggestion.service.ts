import { Injectable } from '@angular/core';
import { IAmTheTest } from './suggestion.interface';

/**
 * Service implémentant l'algorithme de suggestion de termes
 * La similarité est déterminée par le nombre de lettres à remplacer
 * pour retrouver le terme recherché.
 */
@Injectable({
  providedIn: 'root'
})
export class SuggestionService implements IAmTheTest {
  /**
   * Normalise une chaîne : minuscule et alphanumérique uniquement
   */
  private normalize(term: string): string {
    return term.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Calcule le nombre de différences entre deux chaînes de même longueur
   * @param term Le terme recherché
   * @param candidate Le candidat à comparer
   * @returns Le nombre de caractères différents (0 si identiques)
   */
  getDifferenceScore(term: string, candidate: string): number {
    if (term.length !== candidate.length) {
      throw new Error('Les chaînes doivent avoir la même longueur');
    }

    let differences = 0;
    for (let i = 0; i < term.length; i++) {
      if (term[i] !== candidate[i]) {
        differences++;
      }
    }
    return differences;
  }

  /**
   * Calcule le score de différence minimum pour un candidat plus long que le terme
   * en testant toutes les sous-chaînes possibles
   */
  private getMinDifferenceScore(term: string, candidate: string): number {
    if (candidate.length < term.length) {
      return Infinity; // Candidat trop court
    }

    if (candidate.length === term.length) {
      return this.getDifferenceScore(term, candidate);
    }

    // Tester toutes les sous-chaînes de longueur égale au terme
    let minScore = Infinity;
    for (let i = 0; i <= candidate.length - term.length; i++) {
      const substring = candidate.substring(i, i + term.length);
      const score = this.getDifferenceScore(term, substring);
      minScore = Math.min(minScore, score);
    }
    return minScore;
  }

  /**
   * Retourne des suggestions de termes basées sur la similarité
   * @param term Le terme de recherche
   * @param choices La liste de termes parmi lesquels chercher
   * @param numberOfSuggestions Le nombre de suggestions à retourner
   * @returns Un tableau de suggestions triées par similarité
   */
  getSuggestions(
    term: string,
    choices: string[],
    numberOfSuggestions: number
  ): string[] {
    // Normalisation
    const normalizedTerm = this.normalize(term);
    
    if (!normalizedTerm || numberOfSuggestions <= 0) {
      return [];
    }

    // Normaliser et filtrer les choix valides (longueur >= terme)
    const validCandidates = choices
      .map(choice => ({
        original: choice,
        normalized: this.normalize(choice)
      }))
      .filter(({ normalized }) => normalized.length >= normalizedTerm.length);

    // Calculer les scores pour chaque candidat
    const scoredCandidates = validCandidates.map(({ original, normalized }) => {
      const differenceScore = this.getMinDifferenceScore(normalizedTerm, normalized);
      const lengthDiff = Math.abs(normalized.length - normalizedTerm.length);
      
      return {
        original,
        normalized,
        differenceScore,
        lengthDiff
      };
    });

    // Tri multi-critères :
    // 1. Par nombre de différences (croissant)
    // 2. En cas d'égalité : par différence de longueur (croissant)
    // 3. En cas d'égalité encore : par ordre alphabétique
    scoredCandidates.sort((a, b) => {
      // Critère 1 : différence de score
      if (a.differenceScore !== b.differenceScore) {
        return a.differenceScore - b.differenceScore;
      }
      
      // Critère 2 : différence de longueur
      if (a.lengthDiff !== b.lengthDiff) {
        return a.lengthDiff - b.lengthDiff;
      }
      
      // Critère 3 : ordre alphabétique
      return a.normalized.localeCompare(b.normalized);
    });

    // Retourner les N premiers (termes originaux)
    return scoredCandidates
      .slice(0, numberOfSuggestions)
      .map(candidate => candidate.original);
  }
}
