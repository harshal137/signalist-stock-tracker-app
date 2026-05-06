
import { inngest } from "@/lib/inngest/client";
import {NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import {sendWelcomeEmail} from "@/lib/nodemailer";


export const sendSignUpEmail = inngest.createFunction(
  {
    id: 'sign-up-email',
    triggers: [{ event: 'app/user.created' }]
  },
  async ({ event, step }) => {
    const userProfile = `
- Country: ${event.data.country}
- Investment goals: ${event.data.investmentGoals}
- Risk tolerance: ${event.data.riskTolerance}
- Preferred industry: ${event.data.preferredIndustry}
    `;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      '{{userProfile}}',
      userProfile
    );

    const response = await step.ai.infer('generate-welcome-intro', {
      model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
      body: {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      }
    });

    await step.run('send-welcome-email', async () => {
      const introText =
        response?.candidates?.[0]?.content?.parts?.find(p => 'text' in p)?.text ||
        'Thanks for joining Signalist. You now have the tools to track markets and make smarter moves.';

      const { email, name } = event.data;

      return await sendWelcomeEmail({ email, name, intro: introText });
    });

    return {
         success: true ,
        message: 'Welcome email sent successfully'

    };
  }
);