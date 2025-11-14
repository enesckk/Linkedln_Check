// Core logic module for LinkedIn Analyzer
// Clean-code, modular, type-safe implementation

/**
 * PDF Parser Module
 * LinkedIn PDF Export dosyasını parse eder ve structured data'ya çevirir
 */

import pdfParse from 'pdf-parse'

// Input interface
export interface PdfParseInput {
  file: Buffer
}

// Output interface
export interface PdfParsedData {
  headline?: string
  about?: string
  experiences?: Array<{
    title: string
    company: string
    description: string
    startDate?: string
    endDate?: string
  }>
  education?: Array<{
    school: string
    degree: string
    field: string
    startDate?: string
    endDate?: string
  }>
  skills?: string[]
  certifications?: Array<{
    name: string
    issuer: string
    date: string
  }>
  languages?: Array<{
    language: string
    proficiency: string
  }>
  projects?: Array<{
    name: string
    description: string
    url?: string
  }>
  location?: string
  customUrlClean?: boolean
  rawText?: string
}

/**
 * Main function: Parse PDF file
 * 
 * @param input - PDF buffer input
 * @returns Parsed PDF data structure
 */
export async function parsePDF(input: PdfParseInput): Promise<PdfParsedData> {
  try {
    const { file } = input

    // Validation
    if (!file || !Buffer.isBuffer(file)) {
      throw new Error('Invalid PDF buffer provided')
    }

    // Parse PDF to text
    const pdfData = await pdfParse(file)
    const rawText = pdfData.text

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('PDF contains no text content')
    }

    // Split text into lines and clean
    const lines = cleanLines(rawText.split('\n'))

    // Extract sections
    const headline = extractHeadline(lines)
    const about = extractAbout(lines)
    const experiences = extractExperiences(lines)
    const education = extractEducation(lines)
    const skills = extractSkills(lines)
    const certifications = extractCertifications(lines)
    const languages = extractLanguages(lines)
    const projects = extractProjects(lines)
    const location = extractLocation(lines)

    // Build parsed data
    const parsedData: PdfParsedData = {
      headline,
      about,
      experiences: experiences.length > 0 ? experiences : undefined,
      education: education.length > 0 ? education : undefined,
      skills: skills.length > 0 ? skills : undefined,
      certifications: certifications.length > 0 ? certifications : undefined,
      languages: languages.length > 0 ? languages : undefined,
      projects: projects.length > 0 ? projects : undefined,
      location,
      customUrlClean: undefined, // Will be determined during merge
      rawText,
    }

    return parsedData
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error(
      error instanceof Error
        ? `PDF parsing failed: ${error.message}`
        : 'PDF parsing failed with unknown error'
    )
  }
}

/**
 * Clean lines: remove empty lines and trim whitespace
 */
function cleanLines(lines: string[]): string[] {
  return lines
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

/**
 * Extract section between two headers
 * Returns all lines from startHeader to next section header
 */
function extractSection(
  lines: string[],
  startHeader: RegExp,
  endHeaders: RegExp[] = []
): string[] {
  const sectionLines: string[] = []
  let inSection = false
  let startIndex = -1

  // Find start header
  for (let i = 0; i < lines.length; i++) {
    if (startHeader.test(lines[i])) {
      startIndex = i + 1
      inSection = true
      break
    }
  }

  if (startIndex === -1) {
    return []
  }

  // Collect lines until next section header
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]

    // Check if we hit another section header
    const isEndHeader = endHeaders.some(header => header.test(line))
    if (isEndHeader) {
      break
    }

    sectionLines.push(line)
  }

  return sectionLines
}

/**
 * Extract headline
 * Headline is usually before "About" section, around line 2-3
 * Format: Name → Headline → Location
 */
function extractHeadline(lines: string[]): string | undefined {
  try {
    // Find "About" section index
    const aboutIndex = lines.findIndex(line => /^About$/i.test(line))
    
    if (aboutIndex === -1) {
      // If no "About" section, try to find headline in first few lines
      for (let i = 1; i < Math.min(5, lines.length); i++) {
        const line = lines[i]
        const wordCount = line.split(/\s+/).length
        // Headline is usually 3-15 words
        if (wordCount >= 3 && wordCount <= 15 && !isSectionHeader(line)) {
          return line
        }
      }
      return undefined
    }

    // Look for headline before "About" section
    // Usually it's line 2 or 3 (after name)
    for (let i = Math.max(0, aboutIndex - 5); i < aboutIndex; i++) {
      const line = lines[i]
      const wordCount = line.split(/\s+/).length
      
      // Skip if it's a section header or too short/long
      if (isSectionHeader(line) || wordCount < 3 || wordCount > 15) {
        continue
      }

      // Check if it looks like a headline (not a name, not a location)
      if (!isName(line) && !isLocation(line)) {
        return line
      }
    }

    return undefined
  } catch (error) {
    console.error('Error extracting headline:', error)
    return undefined
  }
}

/**
 * Extract About section
 */
function extractAbout(lines: string[]): string | undefined {
  try {
    const aboutLines = extractSection(
      lines,
      /^About$/i,
      [
        /^Experience$/i,
        /^Education$/i,
        /^Skills$/i,
        /^Languages$/i,
        /^Licenses? & Certifications?$/i,
        /^Projects$/i,
      ]
    )

    if (aboutLines.length === 0) {
      return undefined
    }

    // Join lines into paragraphs
    const aboutText = aboutLines.join(' ').trim()
    return aboutText.length > 0 ? aboutText : undefined
  } catch (error) {
    console.error('Error extracting about:', error)
    return undefined
  }
}

/**
 * Extract Experiences
 * Format:
 * - First line: Role
 * - Second line: Company
 * - Third line: Date range
 * - Following lines: Description
 */
function extractExperiences(lines: string[]): Array<{
  title: string
  company: string
  description: string
  startDate?: string
  endDate?: string
}> {
  try {
    const experienceLines = extractSection(
      lines,
      /^Experience$/i,
      [
        /^Education$/i,
        /^Skills$/i,
        /^Languages$/i,
        /^Licenses? & Certifications?$/i,
        /^Projects$/i,
        /^About$/i,
      ]
    )

    if (experienceLines.length === 0) {
      return []
    }

    const experiences: Array<{
      title: string
      company: string
      description: string
      startDate?: string
      endDate?: string
    }> = []

    let i = 0
    while (i < experienceLines.length) {
      // Skip empty lines
      if (!experienceLines[i] || experienceLines[i].trim().length === 0) {
        i++
        continue
      }

      // Check if this looks like a new experience entry
      // Experience entries usually start with a role/title
      const title = experienceLines[i]?.trim()
      if (!title || title.length === 0) {
        i++
        continue
      }

      // Get company (next line)
      const company = i + 1 < experienceLines.length
        ? experienceLines[i + 1]?.trim() || ''
        : ''

      // Get date range (next line)
      const dateLine = i + 2 < experienceLines.length
        ? experienceLines[i + 2]?.trim() || ''
        : ''

      // Parse dates
      const { startDate, endDate } = parseDateRange(dateLine)

      // Collect description (remaining lines until next experience or empty line)
      const descriptionLines: string[] = []
      let j = i + 3
      while (j < experienceLines.length) {
        const line = experienceLines[j]?.trim()
        
        // Stop if we hit what looks like a new experience entry
        // (usually starts with a short line that could be a title)
        if (line && line.length > 0 && line.length < 50 && j > i + 3) {
          // Check if next line might be a company
          if (j + 1 < experienceLines.length && experienceLines[j + 1]?.trim()) {
            break
          }
        }

        if (line && line.length > 0) {
          descriptionLines.push(line)
        } else if (descriptionLines.length > 0) {
          // Empty line after description means end of this experience
          break
        }

        j++
      }

      const description = descriptionLines.join(' ').trim()

      if (title) {
        experiences.push({
          title,
          company: company || 'Unknown',
          description: description || '',
          startDate,
          endDate,
        })
      }

      // Move to next potential experience
      i = j
    }

    return experiences
  } catch (error) {
    console.error('Error extracting experiences:', error)
    return []
  }
}

/**
 * Extract Education
 * Format: School, Degree, Field, Dates
 */
function extractEducation(lines: string[]): Array<{
  school: string
  degree: string
  field: string
  startDate?: string
  endDate?: string
}> {
  try {
    const educationLines = extractSection(
      lines,
      /^Education$/i,
      [
        /^Experience$/i,
        /^Skills$/i,
        /^Languages$/i,
        /^Licenses? & Certifications?$/i,
        /^Projects$/i,
        /^About$/i,
      ]
    )

    if (educationLines.length === 0) {
      return []
    }

    const education: Array<{
      school: string
      degree: string
      field: string
      startDate?: string
      endDate?: string
    }> = []

    let i = 0
    while (i < educationLines.length) {
      const line = educationLines[i]?.trim()
      if (!line || line.length === 0) {
        i++
        continue
      }

      // First line is usually school name
      const school = line

      // Next line might be degree + field
      const degreeLine = i + 1 < educationLines.length
        ? educationLines[i + 1]?.trim() || ''
        : ''

      // Parse degree and field
      let degree = degreeLine
      let field = ''

      // Try to split degree and field (e.g., "Bachelor of Science, Computer Science")
      const degreeMatch = degreeLine.match(/^(.+?)(?:,\s*(.+))?$/)
      if (degreeMatch) {
        degree = degreeMatch[1]?.trim() || degreeLine
        field = degreeMatch[2]?.trim() || ''
      }

      // Date line (optional)
      const dateLine = i + 2 < educationLines.length
        ? educationLines[i + 2]?.trim() || ''
        : ''

      const { startDate, endDate } = parseDateRange(dateLine)

      education.push({
        school,
        degree: degree || 'Unknown',
        field: field || 'Unknown',
        startDate,
        endDate,
      })

      // Move to next entry (skip date line if exists)
      i += dateLine ? 3 : 2
    }

    return education
  } catch (error) {
    console.error('Error extracting education:', error)
    return []
  }
}

/**
 * Extract Skills
 * Usually a simple list, one per line
 */
function extractSkills(lines: string[]): string[] {
  try {
    const skillsLines = extractSection(
      lines,
      /^Skills$/i,
      [
        /^Experience$/i,
        /^Education$/i,
        /^Languages$/i,
        /^Licenses? & Certifications?$/i,
        /^Projects$/i,
        /^About$/i,
      ]
    )

    if (skillsLines.length === 0) {
      return []
    }

    const skills: string[] = []

    for (const line of skillsLines) {
      const trimmed = line.trim()
      if (trimmed.length > 0) {
        // Some PDFs have skills separated by commas
        if (trimmed.includes(',')) {
          const splitSkills = trimmed.split(',').map(s => s.trim()).filter(Boolean)
          skills.push(...splitSkills)
        } else {
          skills.push(trimmed)
        }
      }
    }

    return skills
  } catch (error) {
    console.error('Error extracting skills:', error)
    return []
  }
}

/**
 * Extract Certifications
 * Format: Name, Issuer, Date (optional)
 */
function extractCertifications(lines: string[]): Array<{
  name: string
  issuer: string
  date: string
}> {
  try {
    const certLines = extractSection(
      lines,
      /^Licenses? & Certifications?$/i,
      [
        /^Experience$/i,
        /^Education$/i,
        /^Skills$/i,
        /^Languages$/i,
        /^Projects$/i,
        /^About$/i,
      ]
    )

    if (certLines.length === 0) {
      return []
    }

    const certifications: Array<{
      name: string
      issuer: string
      date: string
    }> = []

    let i = 0
    while (i < certLines.length) {
      const line = certLines[i]?.trim()
      if (!line || line.length === 0) {
        i++
        continue
      }

      // First line is usually certification name
      const name = line

      // Next line might be issuer
      const issuer = i + 1 < certLines.length
        ? certLines[i + 1]?.trim() || ''
        : 'Unknown'

      // Date (optional, might be on same line as issuer or separate)
      let date = ''
      if (i + 2 < certLines.length) {
        const dateLine = certLines[i + 2]?.trim() || ''
        if (isDate(dateLine)) {
          date = dateLine
          i += 3
        } else {
          i += 2
        }
      } else {
        i += 2
      }

      certifications.push({
        name,
        issuer,
        date: date || 'Unknown',
      })
    }

    return certifications
  } catch (error) {
    console.error('Error extracting certifications:', error)
    return []
  }
}

/**
 * Extract Languages
 * Format: "Language — Proficiency" or "Language: Proficiency"
 */
function extractLanguages(lines: string[]): Array<{
  language: string
  proficiency: string
}> {
  try {
    const languageLines = extractSection(
      lines,
      /^Languages?$/i,
      [
        /^Experience$/i,
        /^Education$/i,
        /^Skills$/i,
        /^Licenses? & Certifications?$/i,
        /^Projects$/i,
        /^About$/i,
      ]
    )

    if (languageLines.length === 0) {
      return []
    }

    const languages: Array<{
      language: string
      proficiency: string
    }> = []

    for (const line of languageLines) {
      const trimmed = line.trim()
      if (trimmed.length === 0) continue

      // Parse "Language — Proficiency" or "Language: Proficiency"
      const match = trimmed.match(/^(.+?)\s*[—:]\s*(.+)$/)
      if (match) {
        languages.push({
          language: match[1]?.trim() || '',
          proficiency: match[2]?.trim() || 'Unknown',
        })
      } else {
        // If no separator, assume whole line is language
        languages.push({
          language: trimmed,
          proficiency: 'Unknown',
        })
      }
    }

    return languages
  } catch (error) {
    console.error('Error extracting languages:', error)
    return []
  }
}

/**
 * Extract Projects
 * Format: Name, Description, URL (optional)
 */
function extractProjects(lines: string[]): Array<{
  name: string
  description: string
  url?: string
}> {
  try {
    const projectLines = extractSection(
      lines,
      /^Projects?$/i,
      [
        /^Experience$/i,
        /^Education$/i,
        /^Skills$/i,
        /^Languages$/i,
        /^Licenses? & Certifications?$/i,
        /^About$/i,
      ]
    )

    if (projectLines.length === 0) {
      return []
    }

    const projects: Array<{
      name: string
      description: string
      url?: string
    }> = []

    let i = 0
    while (i < projectLines.length) {
      const line = projectLines[i]?.trim()
      if (!line || line.length === 0) {
        i++
        continue
      }

      // First line is project name
      const name = line

      // Next line might be description or URL
      const nextLine = i + 1 < projectLines.length
        ? projectLines[i + 1]?.trim() || ''
        : ''

      // Check if next line is a URL
      let description = ''
      let url: string | undefined = undefined

      if (isUrl(nextLine)) {
        url = nextLine
        // Description might be on line after URL
        description = i + 2 < projectLines.length
          ? projectLines[i + 2]?.trim() || ''
          : ''
        i += 3
      } else {
        description = nextLine
        i += 2
      }

      projects.push({
        name,
        description: description || '',
        url,
      })
    }

    return projects
  } catch (error) {
    console.error('Error extracting projects:', error)
    return []
  }
}

/**
 * Extract Location
 * Usually appears near the top, after name and headline
 */
function extractLocation(lines: string[]): string | undefined {
  try {
    // Look for location in first 10 lines (usually after name/headline)
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i]?.trim()
      if (!line || line.length === 0) continue

      // Location usually contains city, country, or common location keywords
      if (isLocation(line)) {
        return line
      }
    }

    return undefined
  } catch (error) {
    console.error('Error extracting location:', error)
    return undefined
  }
}

/**
 * Parse date range
 * Formats: "Jan 2020 - Present", "2020 - 2023", "Jan 2020 - Dec 2022"
 */
function parseDateRange(dateStr: string): {
  startDate?: string
  endDate?: string
} {
  if (!dateStr || dateStr.trim().length === 0) {
    return {}
  }

  const normalized = dateStr.trim()

  // Check for "Present" or "Current"
  const isPresent = /present|current|now/i.test(normalized)

  // Try to match date range patterns
  const rangeMatch = normalized.match(/(.+?)\s*[-–—]\s*(.+)/i)
  if (rangeMatch) {
    return {
      startDate: rangeMatch[1]?.trim(),
      endDate: isPresent ? 'Present' : rangeMatch[2]?.trim(),
    }
  }

  // Single date (might be start or end)
  if (isDate(normalized)) {
    return {
      startDate: normalized,
    }
  }

  return {}
}

/**
 * Check if line is a section header
 */
function isSectionHeader(line: string): boolean {
  const sectionHeaders = [
    /^About$/i,
    /^Experience$/i,
    /^Education$/i,
    /^Skills$/i,
    /^Languages$/i,
    /^Licenses? & Certifications?$/i,
    /^Projects?$/i,
  ]

  return sectionHeaders.some(header => header.test(line))
}

/**
 * Check if line looks like a name
 */
function isName(line: string): boolean {
  // Names are usually 2-3 words, capitalized
  const words = line.split(/\s+/)
  if (words.length < 2 || words.length > 4) {
    return false
  }

  // Check if all words start with capital letter
  return words.every(word => /^[A-Z]/.test(word))
}

/**
 * Check if line looks like a location
 */
function isLocation(line: string): boolean {
  // Location keywords
  const locationKeywords = [
    /city/i,
    /country/i,
    /region/i,
    /area/i,
    /location/i,
    /address/i,
  ]

  // Common location patterns
  const locationPatterns = [
    /^[A-Z][a-z]+,\s*[A-Z][a-z]+$/, // "City, Country"
    /^[A-Z][a-z]+\s+[A-Z][a-z]+$/, // "City Country"
  ]

  return (
    locationKeywords.some(keyword => keyword.test(line)) ||
    locationPatterns.some(pattern => pattern.test(line))
  )
}

/**
 * Check if string is a date
 */
function isDate(str: string): boolean {
  // Common date patterns
  const datePatterns = [
    /^\d{4}$/, // "2020"
    /^[A-Z][a-z]+\s+\d{4}$/, // "January 2020"
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // "01/01/2020"
    /^\d{4}-\d{2}-\d{2}$/, // "2020-01-01"
  ]

  return datePatterns.some(pattern => pattern.test(str)) ||
    /present|current|now/i.test(str)
}

/**
 * Check if string is a URL
 */
function isUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return /^https?:\/\//i.test(str)
  }
}

// Alias for backward compatibility with API routes
export const parsePdf = parsePDF
