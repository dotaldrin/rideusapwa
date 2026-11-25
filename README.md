# RideUSA PWA

Standalone React + TypeScript customer booking Progressive Web App for https://rideusa.rundelta.ai.

## Start locally

```powershell
cd C:\Users\jpald\source\repos\RideUsa
npm install
Copy-Item .env.example .env.local
npm run dev
```

Local Vite URL: http://localhost:5175

## Build

```powershell
npm run build
```

## Deploy

Push to `main` triggers `.github/workflows/azure-static-web-apps.yml`.
Set the GitHub Actions repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN_RIDEUSA` to the deployment token from Azure Static Web App `rideusa`. In Azure add custom domain `rideusa.rundelta.ai`, then configure its CNAME in Network Solutions according to Azure's domain-validation instructions. Add `https://rideusa.rundelta.ai` to the RunDelta API's allowed CORS origins.

## Customer flow

- **Visitor (not logged in):** search drivers, pick one, enter an email, book a **cash** ride. The API creates or reuses the Customer account for that email, sends the forgot-password email, and returns a ride token used to follow and cancel that one ride.
- **Activation:** the emailed link opens `/reset-password`. Setting a password confirms the email and logs the customer in.
- **Logged in:** the first page is **CASH | CARD** (`/pay`). Cash goes straight to booking. Card uses the saved Stripe card, or opens `/card` to add one.
- **Ride page** (`/ride/:id`): follows the ride through the backend `RideStatus` values by polling every 5 seconds.

Requires the backend cash-ride changes (`api/cash-rides`, `api/customer-onboarding`, `PaymentType` on ride contracts). Until those are deployed, visitor booking and the cash option return 404/400.

## Architecture

- `src/app/Ride` — booking page, ride status page, address and map components
- `src/app/Account` — log in, set password, CASH | CARD, card, account, settings
- `src/components/AppShell.tsx` — mobile shell: top icons and bottom menu
- `src/services` — API calls (`rideApi`, `accountApi`, `paymentApi`), session, per-device storage
- `src/types/contracts.ts` — TypeScript mirrors of `RunDelta.Contracts`
- `src/infrastructure/http` — `apiFetch` transport (cookie session + XSRF header)
- `public` — PWA icons, Azure Static Web Apps routing config

Stripe.js is loaded from `js.stripe.com` at runtime on the card page; no secret keys are stored in the browser.

#RUNDELTA AI RESEARCH
Independent AI Provider, Environment-Based Evaluation and Reinforcement Learning
Technical architecture and research development plan

Prepared By: John Aldrin
Organization: RunDelta.ai
Date: November 25, 2026
Version: 1.0
Document status: Proposed research architecture
Technology foundation: C#, ASP.NET Core, .NET 10 -- Private Repository -- This is only a public forward facing application. 

##Table of Contents
1. Executive Summary
2. Research Objectives
3. Prime Intellect Platform Analysis
4. AI Environment Architecture
5. Understanding Reinforcement Learning
6. Model Selection and Distribution
7. C# Local AI Provider
8. RunDelta AI Research Architecture
9. Proposed .NET Solution Structure
10. Environment Development Framework
11. Verification and Reward Systems
12. Training Infrastructure
13. RunDelta Transportation Research Environments
14. Knowledge Management and Retrieval
15. Database and Persistence Architecture
16. Communication and Streaming Infrastructure
17. Azure AI Foundry Integration
18. Hardware and Deployment Requirements
19. Security and Infrastructure Isolation
20. Model Evaluation and Benchmarking
21. Research Management Dashboard
22. Development Roadmap
23. Definition of Done
24. Technical References
25. Conclusion

#Executive Summary
RunDelta AI Research represents the development of an independent artificial intelligence infrastructure capable of hosting, evaluating, benchmarking, and improving AI models through structured learning environments.

The objective extends beyond integrating commercial artificial intelligence services into an existing transportation platform.

The proposed infrastructure would provide RunDelta with control over:
- AI inference services.
- Locally hosted artificial intelligence models.
- Model selection and registration.
- AI environment development.
- Training and evaluation datasets.
- Verification and reward mechanisms.
- Knowledge management.
- Model performance research.
- Specialized transportation intelligence.
- Integration with external AI providers.
- Reinforcement learning and model fine-tuning.

The existing RunDelta transportation platform provides a valuable foundation for this research because it already contains structured business processes, deterministic calculation engines, defined application contracts, transactional data, and real-world operational workflows.

These existing components can become the basis for controlled AI research environments.

Prime Intellect provides a useful architectural reference through its open-source environment framework, reinforcement learning infrastructure, distributed computing services and model evaluation systems.

RunDelta would adopt similar architectural principles while developing its own implementation around C#, .NET 10, ASP.NET Core, existing RunDelta infrastructure, and specialized machine learning runtimes.

The proposed platform is not intended to train a frontier foundation model from the beginning.

Instead, it would initially utilize existing open-weight models and progressively develop specialized intelligence through evaluation, retrieval, supervised fine-tuning, and reinforcement learning.

#Research Objectives
##2.1 Primary Objective
Develop an independent AI research and inference platform that can operate locally, integrate with cloud-based services, and develop specialized artificial intelligence capabilities.
##2.2 Technical Objectives
- Establish a standardized C# AI provider architecture.
- Support multiple model formats and inference engines.
- Provide independent local model execution.
- Develop reusable AI research environments.
- Establish repeatable evaluation methodologies.
- Implement deterministic verification mechanisms.
- Create standardized reward and scoring systems.
- Support model comparison and benchmarking.
- Integrate external training infrastructure.
- Establish model checkpoint management.
- Provide real-time monitoring of AI research operations.
##2.3 Business Objectives
- Reduce dependence on individual commercial AI providers.
- Retain control over organizational knowledge.
- Develop transportation-specific AI capabilities.
- Improve operational intelligence.
- Establish reusable artificial intelligence infrastructure.
- Reduce recurring inference costs where local execution is economically practical.
- Create a foundation for future specialized AI products.
##2.4 Research Scope
Although transportation provides the initial research domain, the underlying environment architecture should remain industry-independent.

Future environments could support software engineering, education, mathematics, logistics, document analysis, scientific research, and health and wellness applications.

#Prime Intellect Platform Analysis
##3.1 Platform Overview
Prime Intellect is developing infrastructure for open artificial intelligence research, particularly reinforcement learning and model evaluation.

Its platform combines multiple components that traditionally exist as separate technologies:
- Model inference.
- Environment development.
- Environment distribution.
- Model evaluation.
- Reinforcement learning.
- GPU computing.
- Isolated execution environments.
- Distributed research infrastructure.
The Environments Hub is particularly relevant because it treats learning and evaluation environments as reusable software packages.

Instead of distributing only pretrained models, researchers can distribute the tasks, rules and feedback mechanisms used to evaluate or improve those models.

The linked dashboard is the public-facing catalog for these environments. Its dynamically loaded listings were not available during the page retrieval, so this analysis is based on Prime Intellect's published technical documentation and research materials.

##3.2 Platform Components
Component	Responsibility
Environments Hub	Registration and distribution of environments
Verifiers	Environment interaction and reward calculation
Prime RL	Reinforcement learning training
Prime CLI	Environment installation and execution
Sandboxes	Isolated execution of environment workloads
Inference infrastructure	Generation of model responses
Distributed compute	GPU resource allocation
Evaluation reports	Measurement and comparison of performance


##3.3 Comparison with Traditional Model Repositories
Model repository	Environment repository
Distributes trained models	Distributes learning tasks
Stores model weights	Stores environment definitions
Describes model capabilities	Defines measurable objectives
Enables model deployment	Enables model evaluation and training
Versions model artifacts	Versions learning environments


Both types of repositories are necessary for a comprehensive artificial intelligence research platform.

Hugging Face provides access to model artifacts, while Prime Intellect provides an architecture for the structured experiences used to evaluate and improve models.

##3.4 Open-Source Frameworks
Prime Intellect develops two particularly important frameworks.

Verifiers

An environment framework responsible for:
- Loading tasks.
- Establishing model instructions.
- Managing interactions.
- Defining available tools.
- Recording model responses.
- Calculating rewards.
- Producing evaluation metrics.

##Prime RL

A reinforcement learning framework responsible for:
- Managing model training.
- Coordinating inference workloads.
- Processing model rollouts.
- Calculating training objectives.
- Updating model weights.
- Creating model checkpoints.
- Supporting distributed GPU execution.
References:
- https://github.com/PrimeIntellect-ai/verifiers
- https://github.com/PrimeIntellect-ai/prime-rl
- https://docs.primeintellect.ai/verifiers/environments

#AI Environment Architecture
An AI environment is a controlled software system in which a model is presented with an objective and its performance can be measured.

An environment is composed of several independent responsibilities.
Component	Description
Task	A specific problem to solve
Dataset	Collection of available tasks
Observation	Information presented to the model
Action	Response or tool invocation proposed by the model
State	Current environment conditions
Transition	Change in state resulting from an accepted action
Verifier	Component responsible for determining correctness
Reward	Numerical measurement of performance
Episode	Complete interaction from initial task to termination
Rollout	Recorded sequence of model interactions
Metrics	Measurements collected during execution


##4.1 Single-Turn Environments
A single-turn environment presents one task and evaluates one response.

##Examples include:
- Mathematical calculations.
- Document classification.
- Structured JSON extraction.
- Fare calculation.
- Business-rule interpretation.
- Translation.
4.2 Multi-Turn Environments
A multi-turn environment allows a model to interact repeatedly with a controlled system.

##Examples include:
- Customer-service conversations.
- Simulated ride booking.
- Transportation scheduling.
- Educational exercises.
- Inventory management.
- Simulated operational decisions.
- 
The model receives observations, proposes actions, and receives updated observations until the task is completed or an execution limit is reached.
##4.3 Environment Lifecycle


The environment should be independent of the underlying AI model.

The same environment should be executable against a local Phi model, a Qwen model, an Azure AI Foundry model or another compatible AI provider.

5. Understanding Reinforcement Learning
Reinforcement learning is a machine learning methodology in which a model or agent learns through interaction and feedback.

The major components are:
Component	Responsibility
Agent	Artificial intelligence model
Environment	Controlled interaction system
State	Current operating conditions
Action	Decision proposed by the model
Reward	Measurement of decision quality
Policy	Model behavior governing action selection
Training algorithm	Mechanism that updates model behavior

J(0) = E [\sum_{t=0}^{T}\gamma^t r_t\right]

A simplified objective is to maximize expected cumulative reward:
 
Where:
- \(\theta\) represents model parameters.
- \(r_t\) represents the reward at a particular step.
- \(\gamma\) represents the discount factor.
- \(T\) represents the episode duration.
For language models, reinforcement learning can use rewards derived from generated answers, structured outputs, environment interactions, or task-completion results.
