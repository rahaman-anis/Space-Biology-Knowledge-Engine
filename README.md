# LifeLens: Space Biology Knowledge Engine

An evidence-first knowledge engine for exploring NASA space biology literature.

LifeLens turns a fragmented research corpus into a searchable, structured decision-support tool for scientists, mission planners, and research managers. Instead of manually reviewing hundreds of papers to understand what is known, what remains uncertain, and where studies disagree, users can query the corpus in natural language and inspect evidence, gaps, and contradictions in one place.

**Live demo:** https://www.spacebioengine.study/

## Why this project exists

NASA space biology research spans bone loss, immune function, radiation response, muscle atrophy, and cardiovascular effects across ISS, Shuttle, and analogue missions. Much of this knowledge is publicly available, but it is difficult to synthesise at mission-planning speed.

In practice, this creates a few recurring problems:

- literature review for a single biological question can take weeks
- contradictory findings are easy to miss
- gaps are rarely identified systematically across the full corpus
- evidence from ISS does not transfer cleanly to Lunar or Mars scenarios
- each new analyst often starts from scratch

LifeLens was built to make that evidence easier to query, validate, and act on.

## What LifeLens does

### 1. Section-aware evidence retrieval

LifeLens does not treat every sentence in a paper as equally useful. It classifies content by scientific section structure and uses that to improve retrieval quality.

Users can search in two modes:

- **Passage mode** for specific evidence spans with section tags, confidence scores, and direct PMC links
- **Document mode** for full-paper retrieval ranked by relevance

This makes it easier to distinguish factual findings from background context or author interpretation.

### 2. Automated research gap discovery

LifeLens mines Discussion sections to identify explicit research gaps such as open questions, unresolved findings, and areas requiring further investigation.

Each extracted gap is enriched with:

- topic classification
- organism type
- priority score
- severity level
- mission relevance

This turns the corpus from a static archive into something closer to a prioritised research map.

### 3. Evidence relation graph

The platform extracts structured claims and maps relationships between them to show where studies support or contradict one another.

This helps surface:

- areas of strong consensus
- contested or contradictory topics
- isolated studies that may need replication
- cross-species translation paths

### 4. Mission-centric evidence assessment

Evidence generated in one mission context does not automatically transfer to another. LifeLens includes mission-specific views to help assess the applicability of findings for:

- ISS operations
- Lunar stays
- Mars transit

This is especially useful where duration, gravity, and radiation environments differ in meaningful ways.

### 5. Topic-specific evidence pages

Each biological domain has a dedicated evidence page showing:

- study counts
- linked datasets
- top claims
- support vs contradiction patterns
- organism distribution
- evidence tables with traceable source links

## Data and scale

The current prototype processes a substantial subset of NASA space biology literature and related resources:

- **572** full-text publications processed
- **2,165** section-level evidence spans extracted
- **173** research gaps identified
- **1,092** structured claims extracted
- **28,864** evidence relations mapped
- **245** OSDR dataset links
- **156** GeneLab dataset links
- **87** NASA Task Book cross-references

The system is deployed as a working web application with sub-2-second query latency across the processed corpus.

## Technical approach

### Processing pipeline

1. Ingest full-text XML papers via PMC using provided PMCIDs  
2. Parse document structure including title, abstract, sections, and references  
3. Classify sections using IMRaD-style rules and heuristics  
4. Generate embeddings for semantic retrieval  
5. Extract structured claims from the corpus  
6. Detect support and contradiction relations  
7. Mine Discussion sections for explicit research gaps  
8. Cross-reference publications with OSDR, GeneLab, and Task Book resources  

### Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Database:** Supabase / PostgreSQL with pgvector
- **Visualisation:** D3.js
- **NLP:** spaCy plus custom rule-based processing
- **Deployment:** Vercel

## Trust, validation, and design choices

LifeLens is designed as an evidence-support tool, not a black-box answer engine.

Key design choices include:

- **traceable citations:** every claim links back to source material
- **section-aware retrieval:** Results, Methods, Discussion, and contextual content are treated differently
- **confidence scoring:** evidence is weighted using study count, section quality, recency, and journal tier
- **human validation:** section classification, claim extraction, and gap outputs were manually checked on samples
- **deterministic scientific processing:** generative AI was not used for scientific text extraction, section classification, or claim validation

The goal is not just speed, but speed with inspectability.

## Example use cases

### Mission planners
- review evidence for a biological risk or countermeasure in minutes rather than weeks
- identify where evidence is incomplete for Lunar or Mars scenarios
- avoid overconfidence caused by cherry-picked or contradictory studies

### Research scientists
- generate hypotheses from the gap catalogue
- identify underexplored areas for new experiments
- check whether findings have support across species or mission contexts

### Research managers
- understand where evidence is concentrated
- prioritise funding around mission-critical gaps
- track where more validation or translation work is needed

## My contribution

This project was built by **Team LifeLens** for the NASA Space Apps challenge.

My contribution focused on:

- vector search architecture
- NLP pipeline design
- knowledge graph design

The wider team combined backend, frontend, biology, design, and UX expertise to build a working multidisciplinary prototype.

## Limitations

This is a hackathon prototype designed to demonstrate feasibility, not a finished production platform.

Current limitations include:

- the corpus is limited to the challenge dataset rather than the full NASA archive
- section classification is not perfect on all paper structures
- claim extraction captures explicit statements better than implicit findings
- contradiction detection still requires expert review
- gap extraction identifies explicit Discussion-section gaps more reliably than inferred absences in the literature
- cross-species relevance is surfaced, but not automatically adjudicated

## Next steps

Planned improvements include:

- expanding the corpus
- improving evaluation and validation workflows
- supporting real-time updates as new papers are published
- exposing an API for integration with external tools
- adding experiment design support linked to identified gaps
- improving mission-specific reasoning and transferability analysis

## Repository contents

```text
app/            Next.js routes and pages
components/     UI components
lib/            core logic and utilities
scripts/        data and processing scripts
docs/           project and architecture notes
public/         static assets
types/          shared TypeScript types
