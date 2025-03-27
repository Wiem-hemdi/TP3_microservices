# TP3_microservices
# TP3 : Utilisation de GraphQL avec Node.js et Express

## Objectifs
- Comprendre la configuration et l'utilisation de GraphQL avec Node.js et Express.
- Apprendre à créer un schéma GraphQL et des résolvers pour une API de gestion de tâches.
- Ajouter de nouvelles fonctionnalités à l'API : durée des tâches, modification de description, suppression de tâche.

## Outils Utilisés
- Node.js
- Express
- Apollo Server
- GraphQL
- @graphql-tools/schema
- body-parser

## Installation et Configuration

### 1. Installer Node.js
Téléchargez et installez Node.js depuis : [https://nodejs.org/en/download](https://nodejs.org/en/download)
Sur Ubuntu, utilisez la commande :
```sh
sudo snap install node --classic
```

### 2. Initialisation du projet
```sh
mkdir tp-graphql
cd tp-graphql
npm init -y
```

### 3. Installer les dépendances
```sh
npm install express @apollo/server body-parser @graphql-tools/schema graphql
```

## Implémentation

### 4. Définition du Schéma GraphQL
Créez un fichier `taskSchema.gql` avec le contenu suivant :
```graphql
type Task {
  id: ID!
  title: String!
  description: String!
  completed: Boolean!
  duration: Int
}

type Query {
  task(id: ID!): Task
  tasks: [Task]
}

type Mutation {
  addTask(title: String!, description: String!, completed: Boolean!, duration: Int): Task
  completeTask(id: ID!): Task
  changeDescription(id: ID!, description: String!): Task
  deleteTask(id: ID!): Boolean
}
```

### 5. Charger le schéma dans `taskSchema.js`
Créez un fichier `taskSchema.js` :
```js
const fs = require('fs');
const path = require('path');
const { buildSchema } = require('graphql');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

async function getTaskSchema() {
  const schemaPath = path.join(__dirname, 'taskSchema.gql');
  try {
    const schemaString = await readFileAsync(schemaPath, { encoding: 'utf8' });
    return buildSchema(schemaString);
  } catch (error) {
    console.error("Error reading the schema file:", error);
    throw error;
  }
}

module.exports = getTaskSchema();
```

### 6. Création du Résolveur `taskResolver.js`
Créez un fichier `taskResolver.js` :
```js
let tasks = [
  { id: '1', title: 'Frontend Dev', description: 'React project', completed: false, duration: 5 },
  { id: '2', title: 'Backend Dev', description: 'Node.js API', completed: false, duration: 8 },
  { id: '3', title: 'Testing', description: 'Write test cases', completed: false, duration: 3 }
];

const taskResolver = {
  Query: {
    task: (_, { id }) => tasks.find(task => task.id === id),
    tasks: () => tasks,
  },
  Mutation: {
    addTask: (_, { title, description, completed, duration }) => {
      const task = { id: String(tasks.length + 1), title, description, completed, duration };
      tasks.push(task);
      return task;
    },
    completeTask: (_, { id }) => {
      const task = tasks.find(task => task.id === id);
      if (task) task.completed = true;
      return task;
    },
    changeDescription: (_, { id, description }) => {
      const task = tasks.find(task => task.id === id);
      if (task) task.description = description;
      return task;
    },
    deleteTask: (_, { id }) => {
      const initialLength = tasks.length;
      tasks = tasks.filter(task => task.id !== id);
      return tasks.length < initialLength;
    },
  },
};

module.exports = taskResolver;
```

### 7. Configuration d'Express et Apollo Server
Créez un fichier `index.js` :
```js
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
    const schemaWithResolvers = addResolversToSchema({ schema: taskSchema, resolvers: taskResolver });
    
    const server = new ApolloServer({ schema: schemaWithResolvers });
    await server.start();
    
    app.use('/graphql', json(), expressMiddleware(server));
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start Apollo Server:', error);
  }
}

setupServer();
```

### 8. Démarrer le serveur
```sh
node index.js
```

### 9. Accéder à l'interface GraphQL
Ouvrez votre navigateur et accédez à :
[http://localhost:5000/graphql](http://localhost:5000/graphql)

## Requêtes GraphQL

### Récupérer toutes les tâches
```graphql
query {
  tasks {
    id
    title
    description
    completed
    duration
  }
}
```

### Ajouter une nouvelle tâche
```graphql
mutation {
  addTask(title: "Nouvelle Tâche", description: "Détails de la tâche", completed: false, duration: 4) {
    id
    title
    description
  }
}
```

### Marquer une tâche comme terminée
```graphql
mutation {
  completeTask(id: "1") {
    id
    completed
  }
}
```

### Modifier la description d'une tâche
```graphql
mutation {
  changeDescription(id: "1", description: "Nouvelle description") {
    id
    description
  }
}
```

### Supprimer une tâche
```graphql
mutation {
  deleteTask(id: "1")
}
```

---

**wiem hemdi** 

