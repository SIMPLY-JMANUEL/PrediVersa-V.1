const alertService = require('../../src/modules/alerts/alerts.service');
const alertRepository = require('../../src/modules/alerts/alerts.repository');
const { invokeMotorVersaLambda } = require('../../src/utils/lambdaService');

// Mocks
jest.mock('../../src/modules/alerts/alerts.repository');
jest.mock('../../src/utils/lambdaService');
jest.mock('../../src/utils/notificaciones', () => ({
  notificarAdmins: jest.fn(),
  adminClients: new Set()
}));

describe('Alerts Service - Unit Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('analyzeAndCreateAlert: Should create a CRITICAL alert when risk is HIGH', async () => {
    const mockInput = {
      studentName: 'Juan Perez',
      studentUsername: 'juanp',
      mensaje: 'Me siento muy mal, quiero hacerme daño',
      tipoViolencia: 'Autoagresión'
    };

    const mockAiResponse = {
      nivel_riesgo: 'alto',
      score: 95,
      es_emergencia: true,
      tipos_violencia: ['Autoagresión'],
      justificacion: 'Riesgo inminente detectado'
    };

    invokeMotorVersaLambda.mockResolvedValue(mockAiResponse);
    alertRepository.create.mockResolvedValue({ id: 1, ...mockInput });

    const result = await alertService.analyzeAndCreateAlert(mockInput);

    expect(invokeMotorVersaLambda).toHaveBeenCalled();
    expect(alertRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      alertType: 'Critica',
      status: 'Urgente',
      studentName: 'Juan Perez'
    }));
    expect(result.score).toBe(95);
  });

  test('analyzeAndCreateAlert: Should create an INFORMATIVE alert when risk is LOW', async () => {
    const mockInput = {
      studentName: 'Maria Gomez',
      studentUsername: 'mariag',
      mensaje: '¿Cómo puedo hacer amigos?',
      tipoViolencia: 'Social'
    };

    const mockAiResponse = {
      nivel_riesgo: 'bajo',
      score: 10,
      es_emergencia: false,
      tipos_violencia: ['General'],
      justificacion: 'Consulta informativa'
    };

    invokeMotorVersaLambda.mockResolvedValue(mockAiResponse);
    alertRepository.create.mockResolvedValue({ id: 2, ...mockInput });

    await alertService.analyzeAndCreateAlert(mockInput);

    expect(alertRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      alertType: 'Informativa',
      status: 'Pendiente'
    }));
  });

  test('createManualAlert: Should assign a ticket number if not provided', async () => {
    const mockAlertData = {
      studentName: 'Test Admin',
      alertType: 'Preventiva',
      description: 'Prueba manual'
    };

    alertRepository.create.mockResolvedValue({ id: 3, ...mockAlertData });

    await alertService.createManualAlert(mockAlertData, 101);

    expect(alertRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      ticketNumber: expect.stringMatching(/^TKT-/),
      createdBy: 101
    }));
  });

});
