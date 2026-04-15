import { PolicySection, OrganizationInfo, PolicyVariable } from '../types/privacy';

/**
 * Escapes special RegExp characters in a string so it can be safely interpolated into a RegExp.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
