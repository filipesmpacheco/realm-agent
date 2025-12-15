const admin = require("firebase-admin");
const path = require("path");

// Caminho para o service account (pode vir de variável de ambiente)
const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, "..", "firebase-service-account.json");

let serviceAccount;

try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error(
    "❌ Erro ao carregar firebase-service-account.json:",
    error.message
  );
  console.error(
    "Por favor, coloque o arquivo firebase-service-account.json na raiz do projeto."
  );
  process.exit(1);
}

// Inicializar Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("✅ Firebase Admin SDK inicializado com sucesso");

module.exports = admin;
