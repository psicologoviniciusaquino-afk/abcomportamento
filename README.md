# ABC Behavior Insights

Create a modern, clean, and highly intuitive Single Page Application (SPA) for Behavioral Analysts and ABA therapists called "ABC Behavior Tracker & Functional Analysis Simulator". The app should look professional, calming, and accessible, using a modern tech stack look (like Tailwind CSS design patterns).

Key Features & Layout:

1. Dashboard / Summary Cards

- Show quick stats: Total Behaviors Logged, Most Frequent Function (e.g., Escape, Attention), and Pending Hypotheses.

2. ABC Data Logger Form (Direct Observation / Assessment)

- A form to log individual behavior instances.

- Inputs:

  - Timestamp (Date/Time)

  - Antecedent (Text area + quick tags like: "Demand placed", "Left alone", "Item denied", "Transition")

  - Behavior/Response (Text area + severity slider 1-5)

  - Consequence (Text area + quick tags like: "Demand removed", "Attention given", "Item provided", "Ignored")

- Saving a log adds it to a "Recent Logs Table" with edit/delete capabilities.

3. Functional Analysis Experimental Simulator

- A section explaining the "Gold Standard" of experimental manipulation.

- Include a simulator where users can "Run a Condition Session" (Attention, Demand/Escape, Tangible, and Control/Play).

- Users can input simulated duration (e.g., 10 minutes) and frequency of the target behavior during that condition.

- Display a dynamic chart (using Chart.js or a clean CSS bar/line chart layout) showing the behavior frequency across different conditions to help visualize which environmental variable maintains the behavior.

4. Educational Resource Sidebar/Tab

- A clean, toggleable section explaining the core concepts based on behavioral research (such as Thaís Yazawa's work in Brazil).

- Clearly distinguish between Functional Assessment (Indirect/Direct observation) vs. Functional Analysis (Experimental manipulation).

- Quick guide on the 4 functions: Escape, Attention, Tangibles, Sensory/Automatic.

Technical & Visual Requirements:

- Use a single HTML file with embedded CSS (Tailwind via CDN) and JavaScript.

- Use Lucide icons (or font-awesome via CDN) for clean visuals.

- Fully responsive layout (Sidebar navigation for desktop, bottom/burger menu for mobile).

- Client-side data persistence using localStorage so data isn't lost on refresh.

- Provide clear visual feedback (toast notifications) when saving logs or running simulations.

- Do not use any external API keys. Keep all logic front-end based.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://abcomportamento.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d0593c18-b186-4969-9174-ab6a2246f410).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
