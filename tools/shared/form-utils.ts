/**
 * Form utilities for DoD Tools
 * Shared form handling logic
 */

// Tag form data structure
export interface TagFormData {
  canonical: string;
  variations: string;
  category: string;
  llmVerify: boolean;
  caseSensitive: boolean;
  description: string;
}

// Get tag form data from DOM
export function getTagFormData({
  canonicalSelector = "#tag-canonical",
  variationsSelector = "#tag-variations",
  categorySelector = "#tag-category",
  llmVerifySelector = "#tag-llm-verify",
  caseSensitiveSelector = "#tag-case-sensitive",
  descriptionSelector = "#tag-description",
}: {
  canonicalSelector?: string;
  variationsSelector?: string;
  categorySelector?: string;
  llmVerifySelector?: string;
  caseSensitiveSelector?: string;
  descriptionSelector?: string;
} = {}): TagFormData {
  const canonical =
    (
      document.querySelector(canonicalSelector) as HTMLInputElement
    )?.value.trim() || "";
  const variations =
    (
      document.querySelector(variationsSelector) as HTMLInputElement
    )?.value.trim() || "";
  const category =
    (document.querySelector(categorySelector) as HTMLSelectElement)?.value ||
    "";
  const llmVerify =
    (document.querySelector(llmVerifySelector) as HTMLInputElement)?.checked ||
    false;
  const caseSensitive =
    (document.querySelector(caseSensitiveSelector) as HTMLInputElement)
      ?.checked || false;
  const description =
    (
      document.querySelector(descriptionSelector) as HTMLTextAreaElement
    )?.value.trim() || "";

  return {
    canonical,
    variations,
    category,
    llmVerify,
    caseSensitive,
    description,
  };
}

// Clear tag form
export function clearTagForm({
  formSelector = "#add-tag-form",
  descriptionGroupSelector = "#description-group",
}: {
  formSelector?: string;
  descriptionGroupSelector?: string;
} = {}): void {
  const formElement = document.querySelector(formSelector) as HTMLFormElement;
  const descriptionGroup = document.querySelector(
    descriptionGroupSelector,
  ) as HTMLElement;

  formElement?.reset();
  if (descriptionGroup) descriptionGroup.style.display = "none";
}

// Parse variations string to array
export function parseVariations(variationsInput: string): string[] {
  return variationsInput
    ? variationsInput
        .split(",")
        .map(v => v.trim())
        .filter(v => v.length > 0)
    : [];
}

// Validate tag form data
export function validateTagForm(data: TagFormData): {
  valid: boolean;
  error?: string;
} {
  if (!data.canonical || !data.category) {
    return { valid: false, error: "Canonical name and category are required" };
  }

  if (data.llmVerify && !data.description) {
    return {
      valid: false,
      error: "Description is required when using LLM verification",
    };
  }

  return { valid: true };
}

// Toggle description field visibility based on LLM verify checkbox
export function toggleDescriptionField({
  checkboxSelector = "#tag-llm-verify",
  descriptionGroupSelector = "#description-group",
  descriptionFieldSelector = "#tag-description",
}: {
  checkboxSelector?: string;
  descriptionGroupSelector?: string;
  descriptionFieldSelector?: string;
} = {}): void {
  const llmVerifyCheckbox = document.querySelector(
    checkboxSelector,
  ) as HTMLInputElement;
  const descriptionGroup = document.querySelector(
    descriptionGroupSelector,
  ) as HTMLElement;
  const descriptionField = document.querySelector(
    descriptionFieldSelector,
  ) as HTMLTextAreaElement;

  if (!descriptionGroup || !llmVerifyCheckbox || !descriptionField) return;

  if (llmVerifyCheckbox.checked) {
    descriptionGroup.style.display = "block";
    descriptionField.required = true;
  } else {
    descriptionGroup.style.display = "none";
    descriptionField.required = false;
    descriptionField.value = "";
  }
}

// Enable/disable form button based on validation
export function updateFormButtonState({
  buttonSelector,
  formData,
}: {
  buttonSelector: string;
  formData: TagFormData;
}): void {
  const button = document.querySelector(buttonSelector) as HTMLButtonElement;
  if (!button) return;

  const validation = validateTagForm(formData);
  button.disabled = !validation.valid;
}
