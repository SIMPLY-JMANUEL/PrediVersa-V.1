const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const centralAI = require('./src/utils/centralAIService');

async function testV4() {
  console.log('--- TEST: RIESGO ---');
  try {
    const risk = await centralAI.analizarRiesgo({
      mensaje: 'Hola Versa, me siento muy solo estos días, ando como paila con todo lo del colegio.',
      historial: []
    });
    console.log(risk);
  } catch (e) {
    console.error('Error in analizarRiesgo:', e);
  }

  console.log('\n--- TEST: GENERAR REPUESTA ---');
  try {
    const res = await centralAI.generarRespuesta({
      mensaje: 'Hola Versa, me siento muy solo estos días, ando como paila con todo lo del colegio.',
      nivelRiesgo: 'MEDIO',
      historial: []
    });
    console.log(res);
  } catch (e) {
    console.error('Error in generarRespuesta:', e);
  }
}

testV4();
