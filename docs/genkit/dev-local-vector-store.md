# Dev Local Vector Store

The Dev Local Vector Store plugin provides a local, file-based vector store for development and testing purposes. It is not intended for production use.

## Installation

```bash
npm install @genkit-ai/dev-local-vectorstore
```

## Configuration

To use this plugin, specify it when you initialize Genkit:

```ts
import { devLocalVectorstore } from "@genkit-ai/dev-local-vectorstore";
import { googleAI } from "@genkit-ai/google-genai";
import { genkit } from "genkit";

const ai = genkit({
  plugins: [
    // googleAI provides the embedding models
    googleAI(),

    // Configure the local vector store with an embedder
    devLocalVectorstore([
      {
        indexName: "my_vectorstore",
        embedder: googleAI.embedder("gemini-embedding-001"),
      },
    ]),
  ],
});
```

### Configuration Options

- **indexName** (string): A unique name for this vector store instance. This is used as the indexer and retriever reference.
- **embedder** (EmbedderReference): The embedding model to use. Must be a configured embedder in your Genkit project.

## Usage

### Indexing Documents

The Dev Local Vector Store automatically creates indexes. To populate with data, use the indexer reference and `ai.index`:

```ts
import { devLocalIndexerRef } from "@genkit-ai/dev-local-vectorstore";
import { Document } from "genkit/retriever";

// Create the indexer reference
const myIndexer = devLocalIndexerRef("my_vectorstore");

// Create documents from text
const data = ["This is the first document.", "This is the second document.", "This is the third document.", "This is the fourth document."];

const documents = data.map((text) => Document.fromText(text));

// Index the documents
await ai.index({
  indexer: myIndexer,
  documents,
});
```

### Retrieving Documents

Use `ai.retrieve` with the retriever reference:

```ts
import { devLocalRetrieverRef } from "@genkit-ai/dev-local-vectorstore";

// Create the retriever reference
const myRetriever = devLocalRetrieverRef("my_vectorstore");

// Retrieve documents relevant to a query
const docs = await ai.retrieve({
  retriever: myRetriever,
  query: "search query",
  options: { k: 3 }, // Return top 3 results
});

// Process the retrieved documents
docs.forEach((doc) => {
  console.log(doc.content);
});
```
