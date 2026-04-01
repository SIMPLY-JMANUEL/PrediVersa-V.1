const CentralAIService = require('../../src/utils/centralAIService');

/**
 * 🧪 UNIT TEST: VERSA IA ENGINE
 * Validando el cerebro de PrediVersa.
 */
describe('VERSA IA Service - Unit Tests', () => {
  
  test('🛰️ Capa 0: Diccionario Estático responde coherentemente', async () => {
    const response = await CentralAIService.generarRespuesta({
      mensaje: 'Hola',
      nivelRiesgo: 'BAJO'
    });
    
    expect(response).toContain('parce');
    expect(response).toBeDefined();
  });

  test('🧬 Preprocesamiento limpia el texto correctamente', () => {
    const rawText = "   ¡HOLA   mundo!   ";
    const clean = CentralAIService.preprocess(rawText);
    expect(clean).toBe("¡hola mundo!");
  });

  test('🕵️ Categorización detecta palabras críticas (ALTO RIESGO)', async () => {
    const result = await CentralAIService.categorizeMessage("Me quiero suicidar");
    expect(result.nivel).toBe("ALTO");
    expect(result.detectadas).toContain("suicidar");
  });

});
