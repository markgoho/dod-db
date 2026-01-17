/**
 * Document type for retrieved transcript chunks.
 */
export interface Document {
  text: string;
  metadata?: Record<string, unknown>;
}

/**
 * Retrieve relevant transcript chunks for a query.
 * TODO: Implement vector search when vector DB solution is finalized.
 */
export async function retrieveFromFirestore(
  _query: string,
): Promise<Document[]> {
  // Vector DB solution is TBD - returning empty array for now
  console.warn(
    "retrieveFromFirestore: Vector search not yet implemented. Returning empty results.",
  );
  return [];
}
