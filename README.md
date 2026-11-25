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
#chatgpt-mermaid-_r_10k_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_10k_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_10k_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_10k_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_10k_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_10k_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_10k_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_10k_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_10k_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_10k_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_10k_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_10k_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_10k_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_10k_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_10k_ p{margin:0;}#chatgpt-mermaid-_r_10k_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_10k_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_10k_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_10k_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_10k_ .label text,#chatgpt-mermaid-_r_10k_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_10k_ .node rect,#chatgpt-mermaid-_r_10k_ .node circle,#chatgpt-mermaid-_r_10k_ .node ellipse,#chatgpt-mermaid-_r_10k_ .node polygon,#chatgpt-mermaid-_r_10k_ .node path{fill:rgb(19, 33, 54);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_10k_ .rough-node .label text,#chatgpt-mermaid-_r_10k_ .node .label text,#chatgpt-mermaid-_r_10k_ .image-shape .label,#chatgpt-mermaid-_r_10k_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_10k_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_10k_ .rough-node .label,#chatgpt-mermaid-_r_10k_ .node .label,#chatgpt-mermaid-_r_10k_ .image-shape .label,#chatgpt-mermaid-_r_10k_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_10k_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_10k_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_10k_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_10k_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-_r_10k_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-_r_10k_ .edgeLabel{background-color:rgb(14, 14, 14);text-align:center;}#chatgpt-mermaid-_r_10k_ .edgeLabel p{background-color:rgb(14, 14, 14);}#chatgpt-mermaid-_r_10k_ .edgeLabel rect{opacity:0.5;background-color:rgb(14, 14, 14);fill:rgb(14, 14, 14);}#chatgpt-mermaid-_r_10k_ .labelBkg{background-color:rgba(14, 14, 14, 0.5);}#chatgpt-mermaid-_r_10k_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-_r_10k_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_10k_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_10k_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_10k_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_10k_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_10k_ .icon-shape,#chatgpt-mermaid-_r_10k_ .image-shape{background-color:rgb(14, 14, 14);text-align:center;}#chatgpt-mermaid-_r_10k_ .icon-shape p,#chatgpt-mermaid-_r_10k_ .image-shape p{background-color:rgb(14, 14, 14);padding:2px;}#chatgpt-mermaid-_r_10k_ .icon-shape .label rect,#chatgpt-mermaid-_r_10k_ .image-shape .label rect{opacity:0.5;background-color:rgb(14, 14, 14);fill:rgb(14, 14, 14);}#chatgpt-mermaid-_r_10k_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_10k_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_10k_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_10k_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_10k_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_10k_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_10k_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_10k_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_10k_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_10k_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_10k_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_10k_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_10k_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_10k_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_10k_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_10k_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_10k_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_10k_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_10k_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_10k_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_10k_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_10k_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_10k_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_10k_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-_r_10k_ .node rect,#chatgpt-mermaid-_r_10k_ .node circle,#chatgpt-mermaid-_r_10k_ .node ellipse,#chatgpt-mermaid-_r_10k_ .node polygon,#chatgpt-mermaid-_r_10k_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_10k_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_10k_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-_r_10k_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_10k_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_10k_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Load environmentInitialize task and statePresent observationModel responseValidate responseUpdate environmentEpisode complete?Calculate rewardPersist resultsNoYes

The environment should be independent of the underlying AI model.

The same environment should be executable against a local Phi model, a Qwen model, an Azure AI Foundry model or another compatible AI provider.

