import { PolicySection, OrganizationInfo, PolicyVariable } from '../types/privacy';
import { UNFILLED_PREFIX, UNFILLED_SUFFIX } from './policy-sections';

/**
 * Escapes special RegExp characters in a string so it can be safely interpolated into a RegExp.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Scan rendered policy text for unfilled placeholder tokens.
 *
 * Detects two token forms:
 * - `«TODO: fieldName»` — sentinel emitted by {@link assemblePolicy} when
 *   a required org-info field is missing from the context.
 * - `{{fieldName}}` — mustache token that escaped substitution (either
 *   because the variable wasn't declared or its value was empty).
 *
 * Returns a deduplicated list of the field names found. An empty array
 * means the rendered text is fully populated.
 *
 * Two recommended uses:
 *
 * 1. **CI guard** — assert your canonical org-info fixture renders without
 *    leaving any tokens behind:
 *    ```ts
 *    const html = exportHTML(policy);
 *    expect(findUnfilledTokens(html)).toEqual([]);
 *    ```
 *
 * 2. **Runtime guard** — surface a clear error to compliance officers
 *    before they publish a policy with `{{orgName}}` visible to visitors:
 *    ```ts
 *    const missing = findUnfilledTokens(getPolicyText().fullText);
 *    if (missing.length) throw new Error(`Policy is missing: ${missing.join(', ')}`);
 *    ```
 *
 * @param rendered - The substituted policy text (from `exportHTML`,
 *                   `exportMarkdown`, or `usePrivacyPolicy().getPolicyText().fullText`).
 * @returns Deduplicated array of unfilled field names; `[]` if fully filled.
 */
export function findUnfilledTokens(rendered: string): string[] {
  const found = new Set<string>();

  // Markers from policy-sections.ts: «TODO: fieldName»
  const markerRe = new RegExp(
    `${escapeRegExp(UNFILLED_PREFIX)}([^${escapeRegExp(UNFILLED_SUFFIX)}]+)${escapeRegExp(UNFILLED_SUFFIX)}`,
    'g',
  );
  let match;
  while ((match = markerRe.exec(rendered)) !== null) {
    found.add(match[1].trim());
  }

  // Mustache tokens that survived substitution: {{fieldName}}
  const mustacheRe = /\{\{\s*([^}\s]+)\s*\}\}/g;
  while ((match = mustacheRe.exec(rendered)) !== null) {
    found.add(match[1].trim());
  }

  return Array.from(found);
}

/**
 * Generates policy text by replacing variables in a template with organization-specific values
 * @param sectionsOrTemplate The policy sections or template string to generate text for
 * @param organizationInfoOrVariables The organization information or variable map to use for replacement
 * @returns The generated policy text or an object with the generated text and metadata
 */
export function generatePolicyText(
  sectionsOrTemplate: PolicySection[] | string,
  organizationInfoOrVariables: OrganizationInfo | Record<string, string>
): string | {
  fullText: string;
  sectionTexts: Record<string, string>;
  missingVariables: string[];
} {
  // Check if we're using the new API (template string and variable map)
  if (typeof sectionsOrTemplate === 'string') {
    const template = sectionsOrTemplate;
    const variableMap = organizationInfoOrVariables as Record<string, string>;
    
    // Replace variables in the template
    let result = template;
    const variableRegex = /\{\{([^}]+)\}\}/g;
    let match;
    
    // Find and replace all variables in the content
    while ((match = variableRegex.exec(template)) !== null) {
      const variable = match[1].trim();
      const replacement = variableMap[variable] || '';
      
      // Replace the variable in the content
      result = result.replace(
        new RegExp(`\\{\\{\\s*${escapeRegExp(variable)}\\s*\\}\\}`, 'g'),
        replacement
      );
    }

    return result;
  } 
  // Otherwise use the original API (sections array and organization info)
  else {
    const sections = sectionsOrTemplate;
    const organizationInfo = organizationInfoOrVariables as OrganizationInfo;
    const sectionTexts: Record<string, string> = {};
    const missingVariables: string[] = [];
    
    // Process each section
    sections
      .filter(section => section.included)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach(section => {
        // Use template if available, otherwise fall back to custom/default content
        let content = section.template || section.customContent || section.defaultContent || '';
        
        // Replace variables in the content
        const variableRegex = /\{\{([^}]+)\}\}/g;
        let match;
        
        // Find all variables in the content
        const contentVariables: string[] = [];
        while ((match = variableRegex.exec(content)) !== null) {
          contentVariables.push(match[1].trim());
        }
        
        // Replace each variable with its value
        contentVariables.forEach(variable => {
          let replacement = '';
          
          // Check if the variable exists in organizationInfo
          if (variable in organizationInfo) {
            replacement = organizationInfo[variable as keyof OrganizationInfo] as string || '';
          }
          
          // If replacement is empty, add to missing variables
          if (!replacement) {
            missingVariables.push(variable);
          }
          
          // Replace the variable in the content
          content = content.replace(
            new RegExp(`\\{\\{\\s*${escapeRegExp(variable)}\\s*\\}\\}`, 'g'), 
            replacement
          );
        });
        
        // Store the processed section text
        sectionTexts[section.id] = content;
      });
    
    // Combine all sections into full text
    const fullText = Object.values(sectionTexts).join('\n\n');
    
    return {
      fullText,
      sectionTexts,
      missingVariables: Array.from(new Set(missingVariables)) // Remove duplicates
    };
  }
}
