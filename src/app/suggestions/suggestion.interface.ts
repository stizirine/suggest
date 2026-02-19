/**
 * Interface pour l'algorithme de suggestion de termes
 * Équivalent TypeScript de l'interface C# IAmTheTest
 */
export interface IAmTheTest {
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
  ): string[];
}
