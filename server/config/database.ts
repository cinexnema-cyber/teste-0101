import mongoose from "mongoose";

// URI de conexão com o usuário e senha do MongoDB Atlas
const atlasUri = "mongodb+srv://cinexnema:sCQZlnKkrM678Fmt@cinexnema.84oqzta.mongodb.net/?retryWrites=true&w=majority&appName=CineXnema";

// Fallback para MongoDB local
const localUri = "mongodb://localhost:27017/xnema-local";

let isConnected = false;
let memoryServer: any = null;

export const connectDB = async () => {
  if (isConnected) {
    console.log("Usando conexão existente do MongoDB");
    return;
  }

  const options = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 3000, // Reduzido para falhar mais rápido
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    retryWrites: true,
    w: 'majority'
  };

  // Primeiro tenta conectar no Atlas
  try {
    console.log("🔄 Tentando conectar ao MongoDB Atlas...");
    console.log("🔗 URI (masked):", atlasUri.replace(/eFbjVaEmvIaAbWGh/, "***"));
    await mongoose.connect(atlasUri, options);
    isConnected = true;
    console.log("✅ Conectado ao MongoDB Atlas (cinexnema) com sucesso!");
    setupConnectionMonitors();
    return;
  } catch (atlasError) {
    console.log("⚠️ Falha no Atlas:", atlasError.message);
    console.log("🔍 Código do erro:", atlasError.code);
    console.log("🔍 Nome do erro:", atlasError.codeName);

    // Se falhar, tenta conectar localmente
    try {
      console.log("🔄 Tentando MongoDB local...");
      await mongoose.connect(localUri, { ...options, retryWrites: false });
      isConnected = true;
      console.log("✅ Conectado ao MongoDB local com sucesso!");
      setupConnectionMonitors();
      return;
    } catch (localError) {
      console.log("⚠️ Falha no local, usando MongoDB em memória...");

      // Como último recurso, usa MongoDB em memória
      try {
        const memoryServerModule = await import('mongodb-memory-server');
        const { MongoMemoryServer } = memoryServerModule;

        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'xnema-memory'
          }
        });

        const memoryUri = memoryServer.getUri();
        await mongoose.connect(memoryUri, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 5000
        });

        isConnected = true;
        console.log("✅ Conectado ao MongoDB em memória para desenvolvimento!");
        console.log("⚠️ ATENÇÃO: Os dados serão perdidos ao reiniciar o servidor!");
        setupConnectionMonitors();
        return;
      } catch (memoryError) {
        console.error("❌ Falha em todas as opções de banco:");
        console.error("- Atlas:", atlasError.message);
        console.error("- Local:", localError.message);
        console.error("- Memory:", memoryError.message);
        isConnected = false;
        // Em vez de falhar, vamos continuar sem banco por enquanto
        console.log("🚨 Continuando sem banco de dados - algumas funcionalidades serão limitadas");
        return;
      }
    }
  }
};

const setupConnectionMonitors = () => {
  // Monitor de conexão
  mongoose.connection.on('disconnected', () => {
    console.log('❌ MongoDB desconectado');
    isConnected = false;
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Erro na conexão MongoDB:', err);
    isConnected = false;
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconectado');
    isConnected = true;
  });
};

export const disconnectDB = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();

    // Se estiver usando MongoDB em memória, para o servidor
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
      console.log("MongoDB em memória parado");
    }

    isConnected = false;
    console.log("MongoDB desconectado com sucesso");
  } catch (error) {
    console.error("Erro ao desconectar MongoDB:", error);
  }
};

// Função para obter status da conexão
export const getConnectionStatus = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
};

export default connectDB;
