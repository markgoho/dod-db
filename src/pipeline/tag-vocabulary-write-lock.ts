let tagVocabularyWriteQueue = Promise.resolve();

export async function withTagVocabularyWriteLock<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const run = tagVocabularyWriteQueue.then(operation);
  tagVocabularyWriteQueue = run.then(
    () => {},
    () => {},
  );
  return run;
}
