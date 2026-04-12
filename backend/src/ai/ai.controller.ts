import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: { messages: Array<{ role: string; content: string }> }) {
    const response = await this.aiService.chat(body.messages);
    return { response };
  }

  @Post('match-patents')
  async matchPatents(
    @Body() body: { preferences: any; patents: any[] },
  ) {
    const matches = await this.aiService.matchPatentsToInvestor(
      body.preferences,
      body.patents,
    );
    return { matches };
  }

  @Post('summarize-patent')
  async summarizePatent(@Body() body: { description: string }) {
    const summary = await this.aiService.generatePatentSummary(body.description);
    return { summary };
  }
}
