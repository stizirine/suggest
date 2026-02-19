import { SuggestionService } from './suggestion.service';

describe('SuggestionService', () => {
  let service: SuggestionService;

  beforeEach(() => {
    service = new SuggestionService();
  });

  describe('getDifferenceScore', () => {
    it('devrait retourner 0 pour des chaînes identiques', () => {
      const inputs = [
        { term: 'gros', candidate: 'gros' },
        { term: 'test', candidate: 'test' },
        { term: '', candidate: '' }
      ];
      
      inputs.forEach(({ term, candidate }) => {
        const output = service.getDifferenceScore(term, candidate);
        expect(output).toBe(0);
      });
    });

    it('devrait retourner 1 pour une différence', () => {
      const inputs = [
        { term: 'gros', candidate: 'gras' },
        { term: 'test', candidate: 'tast' }
      ];
      
      inputs.forEach(({ term, candidate }) => {
        const output = service.getDifferenceScore(term, candidate);
        expect(output).toBe(1);
      });
    });

    it('devrait retourner le nombre de différences pour plusieurs différences', () => {
      const inputs = [
        { term: 'gros', candidate: 'gras', expected: 1 },
        { term: 'abc', candidate: 'xyz', expected: 3 }
      ];
      
      inputs.forEach(({ term, candidate, expected }) => {
        const output = service.getDifferenceScore(term, candidate);
        expect(output).toBe(expected);
      });
    });

    it('devrait retourner 0 pour des chaînes vides', () => {
      const output = service.getDifferenceScore('', '');
      expect(output).toBe(0);
    });

    it('devrait lever une erreur si les chaînes ont des longueurs différentes', () => {
      const inputs = [
        { term: 'gros', candidate: 'grasse' },
        { term: 'test', candidate: 'teste' }
      ];
      
      inputs.forEach(({ term, candidate }) => {
        expect(() => service.getDifferenceScore(term, candidate)).toThrow();
      });
    });
  });

  describe('getSuggestions - Cas de base (exemple fourni)', () => {
    it('devrait retourner ["gros", "gras"] pour l\'exemple fourni', () => {
      const term = 'gros';
      const choices = ['gros', 'gras', 'graisse', 'agressif', 'go'];
      const numberOfSuggestions = 2;
      const expected = ['gros', 'gras'];
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result).toEqual(expected);
    });

    it('devrait retourner ["gros", "gras"] avec la liste complète de l\'exemple', () => {
      const term = 'gros';
      const choices = ['gros', 'gras', 'graisse', 'agressif', 'go', 'ros', 'gro'];
      const numberOfSuggestions = 2;
      const expected = ['gros', 'gras'];
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result).toEqual(expected);
    });
  });

  describe('getSuggestions - Filtrage', () => {
    it('devrait rejeter les termes trop courts', () => {
      const term = 'gros';
      const choices = ['go', 'ros', 'gro', 'gros', 'gras'];
      const numberOfSuggestions = 3;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result).toEqual(['gros', 'gras']);
      expect(result).not.toContain('go');
      expect(result).not.toContain('ros');
      expect(result).not.toContain('gro');
    });

    it('devrait accepter les termes de même longueur', () => {
      const term = 'test';
      const choices = ['test', 'tast', 'tost'];
      const numberOfSuggestions = 3;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('test');
    });

    it('devrait accepter les termes plus longs', () => {
      const term = 'gros';
      const choices = ['gros', 'gras', 'graisse'];
      const numberOfSuggestions = 3;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('gros');
      expect(result).toContain('gras');
    });
  });

  describe('getSuggestions - Tri multi-critères', () => {
    it('devrait trier par nombre de différences (croissant)', () => {
      const term = 'test';
      const choices = ['test', 'tast', 'tost', 'xyz'];
      const numberOfSuggestions = 4;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result[0]).toBe('test');
      expect(result.slice(1)).toContain('tast');
      expect(result.slice(1)).toContain('tost');
    });

    it('devrait en cas d\'égalité de différences, privilégier les longueurs proches', () => {
      const term = 'gros';
      const choices = ['gros', 'gras', 'agressif'];
      const numberOfSuggestions = 3;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result[0]).toBe('gros');
      expect(result[1]).toBe('gras');
    });

    it('devrait en cas d\'égalité complète, trier alphabétiquement', () => {
      const term = 'test';
      const choices = ['test', 'tast', 'tost'];
      const numberOfSuggestions = 3;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result[0]).toBe('test');
      const indices = result.slice(1);
      if (indices.includes('tast') && indices.includes('tost')) {
        const tastIndex = indices.indexOf('tast');
        const tostIndex = indices.indexOf('tost');
        expect(tastIndex).toBeLessThan(tostIndex);
      }
    });
  });

  describe('getSuggestions - Normalisation', () => {
    it('devrait gérer les majuscules/minuscules', () => {
      const term = 'GROS';
      const choices = ['gros', 'Gras', 'GRAISSE'];
      const numberOfSuggestions = 3;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('gros');
    });

    it('devrait gérer les caractères spéciaux (alphanumérique uniquement)', () => {
      const term = 'gros';
      const choices = ['gros!', 'gras-', 'graisse@'];
      const numberOfSuggestions = 3;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result.length).toBeGreaterThan(0);
    });

    it('devrait normaliser correctement les termes avec accents et caractères spéciaux', () => {
      const term = 'gros';
      const choices = ['gros', 'gras', 'gr@os'];
      const numberOfSuggestions = 3;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result).toContain('gros');
    });
  });

  describe('getSuggestions - Cas limites', () => {
    it('devrait retourner un tableau vide si la liste de choix est vide', () => {
      const term = 'gros';
      const choices: string[] = [];
      const numberOfSuggestions = 2;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result).toEqual([]);
    });

    it('devrait retourner un tableau vide si le terme est vide après normalisation', () => {
      const term = '!!!';
      const choices = ['gros', 'gras'];
      const numberOfSuggestions = 2;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result).toEqual([]);
    });

    it('devrait retourner un tableau vide si numberOfSuggestions est 0', () => {
      const term = 'gros';
      const choices = ['gros', 'gras'];
      const numberOfSuggestions = 0;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result).toEqual([]);
    });

    it('devrait retourner un tableau vide si numberOfSuggestions est négatif', () => {
      const term = 'gros';
      const choices = ['gros', 'gras'];
      const numberOfSuggestions = -1;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result).toEqual([]);
    });

    it('devrait retourner tous les résultats disponibles si numberOfSuggestions est supérieur', () => {
      const term = 'gros';
      const choices = ['gros', 'gras', 'graisse'];
      const numberOfSuggestions = 10;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result.length).toBeLessThanOrEqual(3);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getSuggestions - Sous-chaînes', () => {
    it('devrait trouver la meilleure sous-chaîne pour les termes plus longs', () => {
      const term = 'gros';
      const choices = ['graisse'];
      const numberOfSuggestions = 1;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result).toContain('graisse');
    });

    it('devrait calculer correctement le score minimum pour les sous-chaînes', () => {
      const term = 'gros';
      const choices = ['gros', 'graisse'];
      const numberOfSuggestions = 2;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result[0]).toBe('gros');
      expect(result[1]).toBe('graisse');
    });
  });

  describe('getSuggestions - Cas de tests supplémentaires', () => {
    it('devrait gérer correctement les termes avec chiffres', () => {
      const term = 'test123';
      const choices = ['test123', 'test124', 'test125'];
      const numberOfSuggestions = 3;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result).toContain('test123');
    });

    it('devrait retourner les termes originaux (non normalisés)', () => {
      const term = 'gros';
      const choices = ['GROS', 'Gras', 'graisse'];
      const numberOfSuggestions = 3;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result).toContain('GROS');
      expect(result).toContain('Gras');
    });

    it('devrait gérer les cas où plusieurs termes ont le même score', () => {
      const term = 'abc';
      const choices = ['abc', 'abd', 'abe', 'abf'];
      const numberOfSuggestions = 4;
      
      const result = service.getSuggestions(term, choices, numberOfSuggestions);
      expect(result[0]).toBe('abc');
      expect(result.slice(1)).toEqual(['abd', 'abe', 'abf']);
    });
  });
});