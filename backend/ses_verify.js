require('dotenv').config();
const { SESClient, VerifyEmailIdentityCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({ region: process.env.AWS_REGION || "us-east-1" });

async function verifyEmails() {
  const correos = [
    "ha.l@lanuevaamerica.edu.co",
    "h.salcedob@lanuevaamerica.edu.co",
    "jm.calvou@lanuevaamerica.edu.co"
  ];

  for (const email of correos) {
    try {
      const command = new VerifyEmailIdentityCommand({ EmailAddress: email });
      await sesClient.send(command);
      console.log(`✅ ¡ÉXITO! Se envió link de verificación AWS a: ${email}`);
    } catch (err) {
      console.error(`❌ Error con ${email}:`, err.message);
    }
  }
}

verifyEmails();
