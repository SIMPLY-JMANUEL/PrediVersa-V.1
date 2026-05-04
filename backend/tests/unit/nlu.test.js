const centralAI = require('../../src/utils/centralAIService');

describe('VERSA NLU Hybrid Pipeline - Unit Tests', () => {
  
  test('Normalization: Should expand "xq" to "porque"', () => {
    const input = "xq me tratas asi?";
    const normalized = centralAI.normalizeInput(input);
    expect(normalized).toContain("porque");
  });

  test('Normalization: Should expand "toy" to "estoy"', () => {
    const input = "toy triste";
    const normalized = centralAI.normalizeInput(input);
    expect(normalized).toContain("estoy");
  });

  test('Normalization: Should remove accents and special characters', () => {
    const input = "¡Hola! ¿Cómo estás? 🚀";
    const normalized = centralAI.normalizeInput(input);
    expect(normalized).toBe("hola como estas");
  });

  test('Intent Classification: Should detect SALUDO correctly', () => {
    const input = "hola versa";
    const normalized = centralAI.normalizeInput(input);
    const result = centralAI.classifyIntent(normalized);
    expect(result.intent).toBe('SALUDO');
    expect(result.confidence).toBe(1.0);
  });

  test('Intent Classification: Should detect AYUDA correctly', () => {
    const input = "necesito ayuda por favor";
    const normalized = centralAI.normalizeInput(input);
    const result = centralAI.classifyIntent(normalized);
    expect(result.intent).toBe('AYUDA');
  });

  test('Intent Classification: Should return UNKNOWN for random text', () => {
    const input = "me gusta el helado de fresa";
    const normalized = centralAI.normalizeInput(input);
    const result = centralAI.classifyIntent(normalized);
    expect(result.intent).toBe('UNKNOWN');
    expect(result.confidence).toBe(0.0);
  });

});
