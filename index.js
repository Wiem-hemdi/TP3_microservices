const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { json } = require('body-parser');
const { addResolversToSchema } = require('@graphql-tools/schema');
const taskSchemaPromise = require('./taskSchema');
const taskResolver = require('./taskResolver');

const app = express();

async function setupServer() {
    try {
        const taskSchema = await taskSchemaPromise;
        const schemaWithResolvers = addResolversToSchema({
            schema: taskSchema,
            resolvers: taskResolver,
        });

        const server = new ApolloServer({
            schema: schemaWithResolvers,
        });

        await server.start();
        app.use('/graphql', json(), expressMiddleware(server));

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Serveur GraphQL en cours d'exécution sur http://localhost:${PORT}/graphql`);
        });
    } catch (error) {
        console.error('Erreur lors du démarrage du serveur Apollo:', error);
    }
}

setupServer();