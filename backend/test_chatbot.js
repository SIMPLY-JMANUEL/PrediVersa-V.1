require('dotenv').config();
const jwt = require('jsonwebtoken');

(async () => {
    try {
        const token = jwt.sign(
            { id: 1, email: 'test@student.com', role: 'Estudiante', name: 'Tester' },
            process.env.JWT_SECRET || 'fallback_secret_para_desarrollo_123',
            { expiresIn: '1h' }
        );

        console.log("Token Generado:", token);
        
        console.log("Enviando request a Produccion...");
        const response = await fetch('https://jkwpuacezq.us-east-1.awsapprunner.com/api/chatbot/message', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: "hola me siento muy mal, me pegaron",
                sessionId: "testuser1",
                historial: []
            })
        });

        const data = await response.json();
        console.log("RESPUESTA 1:", JSON.stringify(data, null, 2));

        const response2 = await fetch('https://jkwpuacezq.us-east-1.awsapprunner.com/api/chatbot/message', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: "",
                sessionId: "testuser1",
                historial: []
            })
        });

        const data2 = await response2.json();
        console.log("RESPUESTA VACIA:", JSON.stringify(data2, null, 2));

    } catch (error) {
        console.error("ERROR FATAL:", error);
    }
})();
