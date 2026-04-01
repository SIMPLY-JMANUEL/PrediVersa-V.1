const adminClients = new Set();

const notificarAdmins = (evento) => {
  if (adminClients.size === 0) return;
  const data = `data: ${JSON.stringify(evento)}\n\n`;
  adminClients.forEach((client) => {
    try { client.write(data); }
    catch (e) { adminClients.delete(client); }
  });
  console.log(`📡 Alerta SSE enviada a ${adminClients.size} admin(s):`, evento.tipo);
};

module.exports = { adminClients, notificarAdmins };
