import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  private buildFallbackReply(messages: Array<{ role: string; content: string }>): string {
    const latestUserMessage =
      [...messages].reverse().find((message) => message.role === 'user')?.content ?? '';

    if (/renewable|solar|wind|energy/i.test(latestUserMessage)) {
      return 'Renewable energy patents are strong candidates for commercialization because they combine clear climate impact with large addressable markets. Look for inventions with defensible IP, pilot results, and a realistic manufacturing path.';
    }

    if (/invest|roi|funding|opportunit/i.test(latestUserMessage)) {
      return 'For investors, prioritize patents with a granted or near-granted status, a clear commercialization roadmap, and a problem that already has paying customers. Strong signals include prototypes, industry partnerships, and a realistic funding ask.';
    }

    if (/manufactur|production|factory/i.test(latestUserMessage)) {
      return 'For manufacturers, focus on patents with simple supply chains, available technical specifications, and a clear licensing path. Production readiness improves when materials are readily available and regulatory requirements are already understood.';
    }

    return 'I can help you evaluate patents, discover opportunities, and think through commercialization strategy. Try asking about a patent category, investment opportunity, or how to assess market readiness.';
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.openai) {
      return this.buildFallbackReply(messages);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || this.buildFallbackReply(messages);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.buildFallbackReply(messages);
    }
  }

  async matchPatentsToInvestor(investorPreferences: any, patents: any[]): Promise<any[]> {
    if (!Array.isArray(patents)) {
      return [];
    }

    const preferredIndustries = (investorPreferences?.industries || []).map((value: string) =>
      value.toLowerCase(),
    );

    if (!preferredIndustries.length) {
      return patents.slice(0, 5);
    }

    return [...patents]
      .map((patent) => {
        const haystack = [patent.category, ...(patent.tags || []), patent.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const score = preferredIndustries.reduce(
          (total: number, industry: string) => total + (haystack.includes(industry) ? 1 : 0),
          0,
        );

        return { ...patent, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore || (b.interested || 0) - (a.interested || 0))
      .slice(0, 5);
  }

  async generatePatentSummary(patentDescription: string): Promise<string> {
    if (!this.openai) {
      return patentDescription.split('.').slice(0, 2).join('.').trim();
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a patent analysis expert. Summarize patents concisely.',
          },
          {
            role: 'user',
            content: `Summarize this patent: ${patentDescription}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 200,
      });

      return response.choices[0]?.message?.content || patentDescription.split('.').slice(0, 2).join('.');
    } catch (error) {
      console.error('OpenAI API error:', error);
      return patentDescription.split('.').slice(0, 2).join('.').trim();
    }
  }
}
