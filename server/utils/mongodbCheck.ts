import mongoose from "mongoose";

export const validateMongoDBConnection = async (uri: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Create a temporary connection to test
    const testConnection = mongoose.createConnection();
    
    await testConnection.openUri(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    await testConnection.close();
    
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
};

export const getMongoDBConnectionInfo = () => {
  return {
    atlasUri: "mongodb+srv://cinexnema:M9ok5w9sT73fdUG6@cinexnema.84oqzta.mongodb.net/cinexnema?retryWrites=true&w=majority",
    localUri: "mongodb://localhost:27017/xnema-local",
    troubleshooting: {
      atlas: [
        "Verifique se as credenciais estão corretas",
        "Confirme se o IP está autorizado no MongoDB Atlas",
        "Verifique se o cluster está ativo",
        "Confirme se o banco de dados 'cinexnema' existe"
      ],
      local: [
        "Instale o MongoDB localmente",
        "Execute: mongod --dbpath /data/db",
        "Ou use Docker: docker run -d -p 27017:27017 mongo"
      ]
    }
  };
};
