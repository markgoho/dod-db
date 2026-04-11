import {
  addScriptureBook,
  escapeHtml,
  getEpisode,
  getVideoIdFromUrl,
  type Episode,
} from "../../shared/utilities.js";

const videoId = getVideoIdFromUrl();
let episode: Episode | undefined;

const BOOK_OPTIONS = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
];

async function init(): Promise<void> {
  const container = document.querySelector("#scriptures-container");

  if (!videoId) {
    if (container) {
      container.innerHTML =
        '<div class="empty-state"><div class="empty-state-text">Invalid episode URL</div></div>';
    }
    return;
  }

  populateBookOptions();

  try {
    episode = await getEpisode(videoId);

    if (!episode) {
      if (container) {
        container.innerHTML =
          '<div class="empty-state"><div class="empty-state-text">Episode not found</div></div>';
      }
      return;
    }

    renderHeader();
    updateStats();
    renderScriptures();
    setupEventListeners();
  } catch (error) {
    console.error("Failed to load scriptures:", error);
    if (container) {
      container.innerHTML =
        '<div class="empty-state"><div class="empty-state-text">Failed to load scriptures</div></div>';
    }
  }
}

function populateBookOptions(): void {
  const options = document.querySelector("#book-options");
  if (!options) return;

  options.innerHTML = BOOK_OPTIONS.map(
    book => `<option value="${book}"></option>`,
  ).join("");
}

function renderHeader(): void {
  if (!episode) return;

  const breadcrumbEpisode = document.querySelector(
    "#breadcrumb-episode",
  ) as HTMLAnchorElement;
  if (breadcrumbEpisode) {
    breadcrumbEpisode.href = `/episode/index?id=${videoId}`;
    breadcrumbEpisode.textContent = `Episode ${episode.episodeNumber || "?"}`;
  }

  const pageTitle = document.querySelector("#page-title");
  if (pageTitle) {
    pageTitle.textContent = `Episode ${episode.episodeNumber || "?"}: Scriptures`;
  }

  document.title = `Scriptures - Episode ${episode.episodeNumber || "?"} - DoD Tools`;
}

function updateStats(): void {
  if (!episode) return;

  const scriptures = episode.scriptures || [];
  const totalMentions = scriptures.reduce(
    (sum, scripture) => sum + scripture.mentions,
    0,
  );
  const totalReferences = scriptures.reduce(
    (sum, scripture) => sum + scripture.references.length,
    0,
  );

  const totalBooksElement = document.querySelector("#total-books");
  const totalMentionsElement = document.querySelector("#total-mentions");
  const totalReferencesElement = document.querySelector("#total-references");

  if (totalBooksElement)
    totalBooksElement.textContent = String(scriptures.length);
  if (totalMentionsElement)
    totalMentionsElement.textContent = String(totalMentions);
  if (totalReferencesElement)
    totalReferencesElement.textContent = String(totalReferences);
}

function renderScriptures(): void {
  const container = document.querySelector("#scriptures-container");
  if (!container || !episode) return;

  const scriptures = [...(episode.scriptures || [])].sort(
    (a, b) => b.mentions - a.mentions || a.book.localeCompare(b.book),
  );

  if (scriptures.length === 0) {
    container.innerHTML =
      '<div class="empty-state" style="grid-column: 1 / -1;"><div class="empty-state-text">No scripture books recorded for this episode</div></div>';
    return;
  }

  container.innerHTML = scriptures
    .map(
      scripture => `
        <div class="scripture-card">
          <div class="scripture-card-header">
            <div class="scripture-book">${escapeHtml(scripture.book)}</div>
            <div class="scripture-mentions">${scripture.mentions}</div>
          </div>
          <div class="scripture-meta">${scripture.references.length} references</div>
          <div class="scripture-references">
            ${scripture.references
              .map(
                reference =>
                  `<span class="scripture-reference">${escapeHtml(reference)}</span>`,
              )
              .join("")}
          </div>
        </div>
      `,
    )
    .join("");
}

function setupEventListeners(): void {
  const form = document.querySelector("#add-scripture-form");
  form?.addEventListener("submit", addBook);
}

async function addBook(event: Event): Promise<void> {
  event.preventDefault();

  if (!videoId) return;

  const input = document.querySelector("#book-name") as HTMLInputElement | null;
  const bookName = input?.value.trim();
  if (!bookName) return;

  const added = await addScriptureBook({ videoId, bookName });
  if (!added) return;

  if (input) {
    input.value = "";
  }

  await refreshEpisode();
}

async function refreshEpisode(): Promise<void> {
  if (!videoId) return;

  try {
    episode = await getEpisode(videoId);
    renderHeader();
    updateStats();
    renderScriptures();
  } catch (error) {
    console.error("Refresh error:", error);
  }
}

init();
