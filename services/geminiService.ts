import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Job, AIAnalysis, InterviewQuestions, SourcingResult, OfferResult, BackgroundCheckResult, SalaryEstimationResult } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check if API key is set
export const isApiKeySet = () => !!apiKey;

const MODEL_NAME = 'gemini-2.5-flash';

// Agent 1: JD Writer
export const generateJobDescription = async (
  title: string,
  skills: string[],
  responsibilities: string[],
  salary: string,
  seniority: string
): Promise<{ description: string }> => {
  if (!apiKey) throw new Error("API Key not found");

  const prompt = `
    You are a senior recruiter writing ATS-optimized job descriptions.
    Job Title: ${title}
    Seniority: ${seniority}
    Salary Range: ${salary}
    Required Skills: ${skills.join(', ')}
    Key Responsibilities: ${responsibilities.join(', ')}

    Write a polished 300-word Job Description. Include an intro, formatted responsibilities list, requirements list, and a brief company pitch (use placeholders for company name).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
          },
          required: ["description"],
        },
      },
    });

    const json = JSON.parse(response.text || '{}');
    return json;
  } catch (error) {
    console.error("JD Generation Error:", error);
    throw new Error("Failed to generate job description.");
  }
};

// Agent 2: Resume Screener
export const screenResume = async (
  resumeText: string,
  job: Job
): Promise<AIAnalysis> => {
  if (!apiKey) throw new Error("API Key not found");

  const prompt = `
    You are a technical recruiter screening resumes.
    
    JOB DETAILS:
    Title: ${job.title}
    Skills Required: ${job.skillsRequired.join(', ')}
    Description Snippet: ${job.description.slice(0, 500)}...

    CANDIDATE RESUME TEXT:
    ${resumeText}

    Analyze the candidate.
    Return JSON with:
    - skills_detected (array of strings)
    - experience_years (number, estimate based on resume)
    - fit_score (0-100)
    - recommendation (strong_fit, medium_fit, not_fit)
    - strengths (array of strings)
    - gaps (array of strings)
    - summary (2-sentence profile)
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
            experience_years: { type: Type.NUMBER },
            fit_score: { type: Type.NUMBER },
            recommendation: { type: Type.STRING, enum: ['strong_fit', 'medium_fit', 'not_fit'] },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
          },
          required: ["skills_detected", "fit_score", "recommendation", "summary"],
        },
      },
    });

    const json = JSON.parse(response.text || '{}');
    
    // Map JSON keys to our camelCase interface if needed
    return {
      skillsDetected: json.skills_detected || [],
      experienceYears: json.experience_years || 0,
      fitScore: json.fit_score || 0,
      recommendation: json.recommendation || 'not_fit',
      strengths: json.strengths || [],
      gaps: json.gaps || [],
      summary: json.summary || '',
    };
  } catch (error) {
    console.error("Screening Error:", error);
    throw new Error("Failed to screen resume.");
  }
};

// Agent 3: Interview Generator
export const generateInterviewQuestions = async (
  job: Job,
  analysis: AIAnalysis,
  tone: string = 'Professional & Balanced'
): Promise<InterviewQuestions> => {
  if (!apiKey) throw new Error("API Key not found");

  const prompt = `
    You are an expert interviewer for tech roles.
    
    JOB: ${job.title}
    DESCRIPTION: ${job.description.slice(0, 300)}...
    
    CANDIDATE STRENGTHS: ${analysis.strengths.join(', ')}
    CANDIDATE GAPS: ${analysis.gaps.join(', ')}
    SUMMARY: ${analysis.summary}
    
    INTERVIEWER PERSONA/TONE: ${tone}

    Generate specific interview questions matching the requested tone.
    Return JSON:
    - technical (5 specific questions testing skills and gaps)
    - behavioral (3 questions based on experience)
    - culture (2 questions for culture fit)
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            technical: { type: Type.ARRAY, items: { type: Type.STRING } },
            behavioral: { type: Type.ARRAY, items: { type: Type.STRING } },
            culture: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["technical", "behavioral", "culture"],
        },
      },
    });

    return JSON.parse(response.text || '{}') as InterviewQuestions;
  } catch (error) {
    console.error("Interview Gen Error:", error);
    throw new Error("Failed to generate interview questions.");
  }
};

// Agent 4: Talent Sourcer
export const generateSourcingStrategy = async (
  jobTitle: string,
  skills: string[],
  location: string
): Promise<SourcingResult> => {
  if (!apiKey) throw new Error("API Key not found");

  const prompt = `
    You are an expert talent sourcer. Build a sourcing strategy.
    Role: ${jobTitle}
    Skills: ${skills.join(', ')}
    Location: ${location}

    Return JSON:
    - platforms: List of 5 best platforms to find this talent.
    - boolean_search_strings: Object with keys 'linkedin', 'google', 'github' containing specific boolean strings.
    - ideal_candidate_profile: 5-sentence persona description.
    - outreach_templates: Array of 2 strings (one short, one long).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            platforms: { type: Type.ARRAY, items: { type: Type.STRING } },
            boolean_search_strings: { 
              type: Type.OBJECT,
              properties: {
                linkedin: { type: Type.STRING },
                google: { type: Type.STRING },
                github: { type: Type.STRING }
              }
            },
            ideal_candidate_profile: { type: Type.STRING },
            outreach_templates: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["platforms", "boolean_search_strings", "ideal_candidate_profile", "outreach_templates"],
        },
      },
    });

    return JSON.parse(response.text || '{}') as SourcingResult;
  } catch (error) {
    console.error("Sourcing Error:", error);
    throw new Error("Failed to generate sourcing strategy.");
  }
};

// Agent 5: Offer Writer
export const generateOffer = async (
  candidateName: string,
  jobTitle: string,
  salary: string,
  startDate: string,
  benefits: string = "Standard benefits package"
): Promise<OfferResult> => {
  if (!apiKey) throw new Error("API Key not found");

  const prompt = `
    You are an HR compensation specialist. Write a professional offer letter.
    Candidate: ${candidateName}
    Role: ${jobTitle}
    Salary: ${salary}
    Start Date: ${startDate}
    Benefits: ${benefits}

    Return JSON:
    - offer_letter: Full text of the formal offer letter.
    - email_copy: Short email body to accompany the offer.
    - next_steps: Array of 3 strings for next steps.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            offer_letter: { type: Type.STRING },
            email_copy: { type: Type.STRING },
            next_steps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["offer_letter", "email_copy", "next_steps"],
        },
      },
    });

    return JSON.parse(response.text || '{}') as OfferResult;
  } catch (error) {
    console.error("Offer Gen Error:", error);
    throw new Error("Failed to generate offer.");
  }
};

// Agent 6: Background Checker
export const checkBackgroundRisk = async (
  candidateName: string,
  resumeText: string,
  jobTitle: string
): Promise<BackgroundCheckResult> => {
  if (!apiKey) throw new Error("API Key not found");

  const prompt = `
    You are an HR compliance assistant.
    Analyze this resume for potential risk signals (gaps, inconsistencies, vague claims).
    Candidate: ${candidateName}
    Role: ${jobTitle}
    Resume: ${resumeText}

    DO NOT perform real checks. Only analyze provided text for red flags.
    Return JSON:
    - risk_assessment: "low", "medium", or "high"
    - concerns: List of potential concerns found in text.
    - verification_recommendations: List of 3 checks to run (e.g. Education, Employment).
    - summary: 2-sentence neutral summary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            risk_assessment: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
            concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
            verification_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["risk_assessment", "concerns", "summary"],
        },
      },
    });

    return JSON.parse(response.text || '{}') as BackgroundCheckResult;
  } catch (error) {
    console.error("Background Check Error:", error);
    throw new Error("Failed to run background check.");
  }
};

// Agent 7: Salary Estimator
export const estimateSalary = async (
  jobTitle: string,
  location: string,
  seniority: string,
  skills: string[]
): Promise<SalaryEstimationResult> => {
  if (!apiKey) throw new Error("API Key not found");

  const prompt = `
    You are a compensation analyst. Estimate salary range.
    Role: ${jobTitle}
    Location: ${location}
    Seniority: ${seniority}
    Skills: ${skills.join(', ')}

    Return JSON:
    - estimated_range: e.g. "$120k - $140k"
    - market_factors: List of 3 reasons affecting this range.
    - justification: 2-sentence explanation.
    - negotiation_advice: Short guidance for recruiter.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimated_range: { type: Type.STRING },
            market_factors: { type: Type.ARRAY, items: { type: Type.STRING } },
            justification: { type: Type.STRING },
            negotiation_advice: { type: Type.STRING }
          },
          required: ["estimated_range", "justification"],
        },
      },
    });

    return JSON.parse(response.text || '{}') as SalaryEstimationResult;
  } catch (error) {
    console.error("Salary Est Error:", error);
    throw new Error("Failed to estimate salary.");
  }
};