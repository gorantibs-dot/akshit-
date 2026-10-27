# JEE Smart Notes AI

A mobile-friendly JEE study helper. Enter a chapter and generate bilingual short notes, a text mind map, solving tricks, practice questions, worked examples, and PYQ guidance using AI web search.

## Run locally
1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Put your own API key in `.env` and confirm `OPENAI_MODEL` is available to your API account.
4. Run `npm install`, then `npm start`.
5. Open http://localhost:3000

## Deploy to Render
1. Upload this project to a GitHub repository.
2. In Render, create a **Web Service** from that repository.
3. Build command: `npm install`; start command: `npm start`.
4. In Render Environment, add `OPENAI_API_KEY` as a secret and optionally set `OPENAI_MODEL`.
5. Deploy and open the Render URL on your phone.

## Important
- Never put your API key in frontend code or commit `.env`.
- AI-generated material can contain mistakes. Verify formulas and solutions before relying on them.
- The app asks the model to distinguish verified PYQs from PYQ-style practice. It does not claim that every question is an official PYQ unless a source can be identified.
- Web-search access and model/API usage may incur charges according to your OpenAI API account.
- This starter does not yet include user accounts or cloud-synced progress. Browser-local progress can be added in a later version.
