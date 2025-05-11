# Cognato AI: AI Interviewer Platform

This repository contains the codebase for our AI Interviewer platform, built for realistic, end-to-end, autonomous technical interviews. This was built and submitted as part of **Soonami's Venturethon**.

Website: https://cognatoai.com

---

## Architecture Overview

### Backend (Dockerized)

* **susanoo/** - The main backend service responsible for storing, managing, and running interviews. It includes three sub-apps:

  * **izanagi/** - Auth service (sign-in, sign-up, token management)
  * **rasengan/** - Interview engine and all AI logic
  * **susanoo/** - API layer and data persistence

* **suijin/** - Handles collection and processing of video/audio chunks from interviews

* **oneiros/** - Responsible for Automatic Speech Recognition (ASR) and Text-to-Speech (TTS)

> Note: Environment variables with appropriate API keys (e.g., OpenAI, ASR, TTS, etc.) must be added locally for successful deployment.

### Frontend

* **landing/** - The landing page of the product (Next.js app) `PORT 3000`
* **app/** - The main application for companies to schedule and manage interviews `PORT 3001`
* **interview/** - The meeting platform where interviews are conducted `PORT 3002`

---

## Setup Instructions

### Backend

1. Create a `.env` file for each backend service (`susanoo`, `suijin`, and `oneiros`) with required API keys.
2. Run the backend using Docker Compose:

   ```bash
   docker-compose up --build
   ```
3. Some initial data seeding is required in the database — reach out to the team for support.

### Frontend

1. Navigate to each frontend app folder (`landing`, `app`, `interview`).
2. Run each app individually using:

   ```bash
   npm install
   npm run dev
   ```

   The apps will run on the following ports by default:

   * Landing: `http://localhost:3000`
   * App: `http://localhost:3001`
   * Interview: `http://localhost:3002`

---

### License & Disclaimer

This is a proprietary submission made for the Venturethon program hosted by Soonami.All rights reserved. No part of this repository — including design, workflows, and code — may be copied, reused, or reproduced without explicit permission.

--

### Questions or Setup Help?

Ping us if:

You need help configuring environment variables

You want guidance on seeding the database

You’re reviewing this as part of the Venturethon and want a walkthrough!
