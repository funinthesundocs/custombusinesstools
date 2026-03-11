# Cross-Model Verification Report

**Date:** 2026-03-07
**Scope:** All 9 production source documents verified against raw source materials
**Method:** Claim-by-claim extraction from production docs, traced to original documents in `intelligence/raw/source/`

---

## TIER 1: CRITICAL -- If wrong, the deal dies in the room

---

### 1.1 POSCO Assay: 67.31% Fe lump ore

**Claimed in:** Doc 01 (Opportunity Brief), Doc 09 (Technical Assets)
**Source document:** `intelligence/raw/source/technical/Previous sample test by POSCO.pdf`

**VERDICT: VERIFIED -- EXACT MATCH**

| Parameter | Production Doc Claims | POSCO Certificate Says |
|-----------|----------------------|----------------------|
| Lump Fe | 67.31% | **67.31%** |
| Fine Fe | 64.11% | **64.11%** |
| Lump P | 0.021% | **0.021%** |
| Lump S | 0.013% | **0.013%** |
| Fine P | 0.012% | **0.012%** |
| Fine S | 0.002% | **0.002%** |

No discrepancy. The POSCO figures are accurate.

---

### 1.2 Intertek 2024: 136 samples -- CRITICAL MISREPRESENTATION FOUND

**Claimed in:** Doc 01 ("56.06% Fe across 136 systematically collected samples"), Doc 09 ("56.06% Fe; 136 samples")
**Source document:** `intelligence/raw/source/technical/RRP24-6098 FCF Minerals Corp. Final.pdf`

**VERDICT: MISLEADING -- REQUIRES CORRECTION**

The production documents state "56.06% Fe across 136 samples" which strongly implies 56.06% is the average or representative grade across 136 samples. **It is not.**

**What the Intertek report actually shows:**
- Total samples: **136** -- CORRECT
- **56.06% Fe is the SINGLE HIGHEST SAMPLE** (GMC PIT2-6), not an average
- The 136-sample Fe range is **0.16% to 56.06%**
- Most samples are dramatically lower: the second-highest is 47.42% (PIT2-9), then 25.29% (GMC-1050)
- The majority of the 136 samples appear to be from mixed geological zones, not exclusively iron ore
- **Gold in 136 samples:** Overwhelmingly below detection (<0.005 ppm). Highest: 0.161 ppm (0.161 g/t). This dataset does NOT support high gold grades.
- **Copper in 136 samples:** Max 1,585 ppm (0.16%) -- dramatically lower than other copper assays because these are iron zone samples

**CORRECTION REQUIRED:** Change "56.06% Fe across 136 samples" to something like "up to 56.06% Fe (peak sample) from a 136-sample systematic campaign" or cite the average if calculated. The current phrasing could be challenged in a boardroom and would damage credibility.

**ADDITIONAL FLAG:** The production documents cite gold grades of 4.4 g/t Au (from DALINC) and ~15 g/t Au (from BGRIMM) as representative. The Intertek 136-sample dataset -- the largest systematic sampling campaign -- shows Au overwhelmingly below 0.005 g/t. The high gold grades come exclusively from targeted copper vein samples, NOT from systematic sampling. This distinction must be made clear.

---

### 1.3 MPSA 251(A)-2007-XI: 5,906.67 hectares, location

**Claimed in:** Doc 01, Doc 03, Doc 08, Doc 09
**Source document:** `intelligence/raw/source/legal/BRIEF SUMMARY- DMC.docx`

**VERDICT: PARTIALLY VERIFIED -- LOCATION DISCREPANCY**

| Parameter | Production Docs Say | MPSA Document Says |
|-----------|-------------------|-------------------|
| MPSA Number | 251(A)-2007-XI | **251(A)-2007-XI** -- MATCH |
| Area | 5,906.67 hectares | **5,906.67 hectares** -- MATCH |
| Date Approved | July 28, 2007 | **July 28, 2007** -- MATCH |
| Contractor | Dabawenyo Minerals Corporation | **Dabawenyo Minerals Corporation** -- MATCH |
| Operator | Genluiching Mining Corporation | **Genluiching Mining Corporation** -- MATCH |
| Commodity | Molybdenum, copper, gold | **Molybdenum, Copper, Gold and other associated mineral deposits** -- MATCH |
| **Location** | **Mati City and Lupon** | **Tarragona and Mati City** -- DISCREPANCY |

**CORRECTION REQUIRED:** The MPSA Brief Summary document explicitly states the location as "Tarragona and Mati City, Davao Oriental." The production source documents consistently say "Mati City and Lupon." These are different municipalities. **Lupon may be correct for a later filing or survey, or there may be a confusion.** This must be verified against the actual MPSA certificate before the meeting. Citing the wrong municipality to someone who may check the MGB records would be immediately caught.

**Additional note:** Doc 01 lists seven mineral products (iron ore, copper, gold, molybdenum, manganese, limestone, silica) but the MPSA itself only covers "Molybdenum, Copper, Gold and other associated mineral deposits." Iron ore is found on the concession but is not a named MPSA commodity -- the "associated mineral deposits" clause likely covers it, but this nuance should be understood.

---

### 1.4 EM Survey: Porphyry copper-gold system at 80-200m depth

**Claimed in:** Doc 01, Doc 09
**Source documents:** `intelligence/raw/source/technical/Emscan1-4.jpeg` (geophysical report pages)

**VERDICT: VERIFIED WITH NUANCE**

The EM scan report (Emscan1) states:
- VLF profiles imaged conductive anomalies to **100-200 meters depth** -- production docs say "80-200 meters"
- Intermediate to high resistivity anomalies at **approximately 80 meters below surface** (800 to 5,000 ohm-meters)
- Interpreted as "characteristic of epithermal or **porphyry copper-gold system**"
- Figure 10 shows a pipe-like structure interpreted as a diatreme (volcanic pipe)

**The "80-200m" figure in the production docs combines two different measurements:** the shallowest resistivity anomaly (~80m) and the deepest VLF imaging depth (~200m). This is technically defensible but could be stated more precisely. The porphyry interpretation is stated in the original geophysical report.

**IMPORTANT CAVEAT missing from production docs:** The EM survey is INTERPRETED data, not confirmed drilling data. No drill hole has tested below 28 meters. The porphyry interpretation is a hypothesis, not a confirmed finding. The Sillitoe model diagram (Emscan2) is a generic textbook model, not site-specific data.

---

### 1.5 Mercury contamination: 1,245 mg/kg and 1,429 mg/kg

**Claimed in:** Doc 04 (Risk Mitigation), Doc 09 (Technical Assets)
**Source document:** `intelligence/raw/source/technical/Assay3CamScanner-ocr-output.md` (Davao Analytical Laboratories)

**VERDICT: VERIFIED -- EXACT MATCH**

| Sample | Production Docs | Source Document |
|--------|----------------|----------------|
| Copper ore (M-25-456) | 1,245 mg/kg Hg | **1,245 mg/kg** -- MATCH |
| Iron ore (M-25-455) | 1,429 mg/kg Hg | **1,429 mg/kg** -- MATCH |
| Date | February 2025 | **Received Feb 3, 2025; Reported Feb 7, 2025** -- MATCH |

Correctly attributed to Davao Analytical Laboratories. No discrepancy.

---

### 1.6 Anomalous 85.4% Fe reading

**Claimed in:** Doc 04 (Risk Mitigation), Doc 09 (Technical Assets)
**Source document:** `intelligence/raw/source/technical/Assay3CamScanner-ocr-output.md`

**VERDICT: VERIFIED AS REPORTED -- CORRECTLY FLAGGED IN PRODUCTION DOCS**

- Sample M-25-455 (labeled "IRON ORE") shows 85.4% Fe
- This exceeds the theoretical maximum for pure magnetite (72.4% Fe) and pure hematite (69.9% Fe)
- Doc 04 correctly identifies this as anomalous and flags it
- **Most likely explanation:** This is a concentrate/beneficiated sample, or a lab error. The sample was received alongside the 39.5% Cu copper ore sample, suggesting possible sample preparation anomalies.
- **The production docs handle this correctly** by flagging it as requiring explanation rather than citing it as a grade.

---

### 1.7 GMC operator status and DMC relationship

**Claimed in:** Doc 03, Doc 04, Doc 08
**Source documents:** `intelligence/raw/source/legal/BRIEF SUMMARY- DMC.docx`, `intelligence/raw/source/legal/GMC DMPF.docx`

**VERDICT: VERIFIED**

| Parameter | Production Docs | Source Documents |
|-----------|----------------|-----------------|
| Original Operating Contract | February 23, 2017 | BRIEF SUMMARY confirms "Mines Development and Operating Contract executed by both parties on **February 23, 2017**" -- MATCH |
| MGB CO Approval | May 2, 2022 | BRIEF SUMMARY: "**May 02, 2022**, Mines and Geosciences Bureau Central Office (MGB CO) approved Genluiching Mining Corporation (GMC) as the authorized Operator" -- MATCH |
| Revenue split | 20% of net income to DMC | Cannot verify from BRIEF SUMMARY (only mentions the operating contract exists); the Compromise Agreement document would be needed |
| P200,000/month sustenance | Claimed in Doc 04 | Cannot verify from available documents -- likely in the Compromise Agreement |
| Criminal case NPS Docket No. INV-215-03844 | Claimed in Doc 04 | Cannot verify from available documents |
| February 2022 Compromise Agreement | Claimed in Doc 04, Doc 08 | Cannot verify from available documents -- the Compromise Agreement itself is not in the raw files |

**FLAG:** The Compromise Agreement (February 2022) and its specific terms (20% revenue split, P200K/month, P5M release, 2 Nissan Terra vehicles) are cited in production docs but **the actual Compromise Agreement document is not present in `intelligence/raw/source/`**. These terms are cited as fact but cannot be independently verified from the files available.

---

### 1.8 Aboitiz Construction THPAL relationship since 2012

**Claimed in:** Doc 01, Doc 02, Doc 06
**Source documents:** Aboitiz Construction Company Profile v2025.pdf (page 24), multiple Perplexity research reports

**VERDICT: VERIFIED**

- PDF page 24 confirms: "10 Million Manhours -- Maintenance and Shutdown Works, Taganito HPAL Project, **September 2012 - July 2023**"
- PDF page 24 also shows: "4.1 Million Manhours -- Taganito HPAL Project, JGC Corporation, **October 2011 - December 2012**" (original construction)
- Multiple research reports corroborate with citations from Philippine Resources, Nickel Asia annual reports, and LinkedIn posts
- January 2026 LinkedIn post by Sebastian Aboitiz: "We originally built the plant"

Production docs claim "13 consecutive years" (2012-2025). The construction started **October 2011** (not September 2012), and the maintenance phase started September 2012. The "since 2012" claim is correct for continuous presence; the "13 years" claim is approximately correct (2012-2025 = 13 years of maintenance).

---

### 1.9 NAC-DMCI MOU March 2025

**Claimed in:** Doc 02 (Strategic Alignment), competitive landscape context
**Source:** Perplexity research report (Competitive Landscape), citing Philippine Mining Club and Philippine Resources

**VERDICT: SOURCED FROM PERPLEXITY -- CANNOT INDEPENDENTLY VERIFY**

- Date cited: **March 4, 2025**
- Purpose: Explore building a new nickel processing plant
- Source is Perplexity Deep Research with citations from Philippine Mining Club and Philippine Resources
- No primary document available in raw files
- **Risk level: LOW** -- this is a publicly reported industry event, not a GMC claim

---

### 1.10 IMS revenue P650M 2024 and P1B 2026 target

**Claimed in:** Doc 02, Doc 06, Doc 07
**Source:** Perplexity research reports, sourced from Stevie Awards submission PDF

**VERDICT: SOURCED -- NOTE PROVENANCE**

- Source: Stevie Awards gold entry submission (filed ~October 2025)
- ACI self-reported figure in an awards submission, not audited financials
- The Stevie Awards submission is a legitimate business document but represents self-reported data
- **No independent verification available**

---

## TIER 2: SIGNIFICANT -- If wrong, credibility damaged

---

### 2.1 Aboitiz Construction 500% increase in awarded contracts since 2023

**Source:** Stevie Awards submission (via Perplexity research reports)
**VERDICT:** Self-reported in awards submission. Not independently verified. Note source if cited.

---

### 2.2 45.53% net sales revenue increase 2024

**Source:** ACI Operational Profile report, sourced from EMIS company profile data
**VERDICT:** Sourced from EMIS (a financial data provider). Reasonably reliable but not from ACI's own audited reports. Note source.

---

### 2.3 PCAB Quadruple A: only 72 contractors nationwide

**Source:** ACI Operational Profile (Perplexity research)
**VERDICT:** Cited in research report. Consistent with PCAB being the highest classification. The "72" figure is plausible but should be noted as from research, not PCAB's own published data. The PDF confirms Quadruple A status but does not cite the "72" number.

---

### 2.4 RA 12253 signed September 2025

**Claimed in:** Doc 01, Doc 03
**Source:** Regulatory landscape research report, citing BusinessWorld

**VERDICT: SOURCED -- September 4, 2025**

The specific date (September 4, 2025) comes from BusinessWorld reporting. Production Doc 01 says "September 2025" (month only). Doc 03 says "September 4, 2025" (specific date). Both are consistent. Cannot independently verify beyond the news citations but multiple news sources confirm.

---

### 2.5 EO 130 April 2021

**Claimed in:** Doc 01
**Source:** Regulatory research report, citing Cruz Marcelo law firm analysis

**VERDICT: SOURCED -- April 14, 2021**

Specific date from legal analysis by Cruz Marcelo. Widely reported. Low risk of error.

---

### 2.6 THPAL $1.7B total investment

**Claimed in:** Doc 02, Doc 06
**Source:** Claver Connection research report, citing Philippine Resources magazine and Nickel Asia 2012 annual report

**VERDICT:** Sourced from multiple credible publications. Not in ACI's own PDF. Widely cited figure in Philippine mining media. Low risk of error.

---

### 2.7 THPAL 30,000 MT Ni annual capacity

**Claimed in:** Doc 06 context
**Source:** Claver Connection report, citing Philippine Resources, MGB Quick Facts, Nickel Asia annual report

**VERDICT:** Multi-sourced. Claver Connection also notes actual production exceeded design: 36,000 tonnes achieved. Low risk of error.

---

### 2.8 Silangan $1B first production March 2026

**Claimed in:** Doc 01
**Source:** Competitive Landscape report, citing Philippine Resources and Philex Mining disclosures

**VERDICT: SOURCED -- but check if "first metal production" actually occurred**

The March 2026 target was cited in Perplexity research. Since we are now in March 2026, this claim should be updated to reflect whether production actually commenced or was delayed. The claim "achieved first metal production in March 2026" (Doc 01) is stated as fact but may be premature if production was delayed.

**FLAG:** Verify current status before the meeting.

---

### 2.9 Tampakan $5.9B seeking partner

**Claimed in:** Doc 01 context
**Source:** Competitive Landscape report, citing Bloomberg and Yahoo Finance

**VERDICT:** Multi-sourced from credible business media. "Seeking strategic technology partner as of October 2025." Low risk of error for the historical claim; current status may have changed.

---

### 2.10 25 million vs 27 million safe man-hours discrepancy

**VERDICT: BOTH CORRECT -- DIFFERENT DATES**

| Source | Figure | Date |
|--------|--------|------|
| ACI Company Profile PDF (page 24) | **25 Million Manhours** | As of December 31, 2024 |
| Stevie Awards submission | **27 million** | Filed ~October 2025 |

The 2M increase over ~10 months is consistent with ongoing operations. **Production docs should specify which figure they're using and its date.** Currently Doc 02 cites "27 million" and Doc 06/07 cite "25M+" -- this inconsistency within our own documents could raise questions.

**CORRECTION RECOMMENDED:** Standardize to one figure with its date, or explain the growth trajectory.

---

### 2.11 P380B Great Transformation capex figure

**Source:** Great Transformation research report, citing Forbes 2023 article
**VERDICT:** Widely cited in business media. Consistent across multiple Perplexity reports. Low risk of error.

---

### 2.12 AboitizPower 9,200 MW target by 2030

**Source:** Great Transformation research report, citing AboitizPower press release
**VERDICT:** Sourced from company's own press release. Low risk of error.

---

## TIER 3: MINOR -- If wrong, embarrassing but recoverable

---

### 3.1 Sebastian Aboitiz age approximately 28-31

**Source:** Sebastian Profile research report

**VERDICT: APPROXIMATELY CORRECT**

- Attended PAREF Springdale School, Cebu City (2008-2012)
- Westminster School, Simsbury, CT (2012-2014)
- Bucknell University (2014-2019), graduated with B.S. Mechanical Engineering
- If he started high school at ~13 (2008), birth year ~1995, making him ~31 in 2026
- If Bucknell 2014-2019 (5 years for dual focus), graduation at ~24, birth year ~1995

**Estimated age: ~30-31.** The "28-31" range in production docs is reasonable but skews slightly young.

**IMPORTANT NOTE FROM PDF:** Sebastian Aboitiz is NOT listed in the ACI Company Profile v2025 (January 2025). He is absent from both the Board of Directors (page 5) and Management (page 6). This is consistent with reports stating he joined in July 2025 as a Management Associate. His title "Business Development Manager" may be current as of 2026 but was not his title as of January 2025.

---

### 3.2 Sebastian's degree: BS Mechanical Engineering from Bucknell University

**Source:** Sebastian Profile (sourced from LinkedIn)
**VERDICT: VERIFIED** against the research report. Bucknell University, B.S. Mechanical Engineering with Business Management dual focus, GPA 3.06.

---

### 3.3 Antonio Penalver's education: IE Business School MBA, Stanford LEAD

**Source:** Antonio Penalver Profile research report

**VERDICT: VERIFIED against research report**
- Master's in Civil Engineering: Universidad Alfonso X El Sabio, Madrid
- MBA: IE Business School (Instituto de Empresa), Madrid
- Stanford LEAD Professional Certificate: Stanford University GSB
- B.S.: Universitat d'Alacant (University of Alicante), Spain

Note: Production Doc 06 says "Master's in Civil Engineering (Spain)" -- this is correct but the university name (Alfonso X El Sabio) is omitted. Not an error.

---

### 3.4 Aboitiz Construction founding 1975 as Gorones Development Corporation

**Claimed in:** Production docs
**Source:** ACI Company Profile PDF (page 4 History timeline)

**VERDICT: MINOR DISCREPANCY IN NAME**

| Production Docs Say | PDF Says |
|--------------------|----------|
| "Gorones Development Corporation" | **"Gorones Inc."** |

The PDF (ACI's own material) says **"Gorones Inc."** in the 1975 timeline entry. The research report says "Gorones Development Corporation." **Defer to ACI's own PDF: use "Gorones Inc."**

**CORRECTION REQUIRED:** Change "Gorones Development Corporation" to "Gorones Inc." wherever it appears.

---

### 3.5 50th anniversary 2025

**Math check:** Founded 1975, anniversary year 2025 = 50 years.
**VERDICT: CORRECT.** 2025 - 1975 = 50.

---

### 3.6 CD Processing Ltd P583M copper ore sorting plant Toledo City

**Source:** Claver Connection research report, citing Philippine Resources and AboitizEyes

**VERDICT: SOURCED**
- CD Processing Ltd. = British company -- confirmed in research
- Location: Carmen Copper Corporation operations, Toledo City, Cebu -- confirmed
- Investment: PHP 583 million -- from Philippine Resources
- Technology: Sandvik magnetic resonance analyzer -- confirmed
- Completed: September 2021 -- from ACI Operational Profile
- BOI pioneer project approval -- confirmed

All details are consistently cited across multiple research reports. Low risk of error.

---

## TIER 4: CLAIMS WITH NO TRACEABLE SOURCE (MOST DANGEROUS)

---

### 4.1 "Senson Geological (Philippines): Elevation mapping, geophysical survey support"

**Cited in:** Doc 01 as one of the labs
**Source verification:** No document in `intelligence/raw/source/technical/` is attributed to "Senson Geological." The geophysical survey (EM scans) does not name the surveying company in the pages available. The Philip Ryder report does not mention Senson. **This name has no traceable source in the raw files.**

**FLAG:** Either provide the source document for Senson Geological's involvement or remove from the lab list.

---

### 4.2 "POSCO — world's 6th-largest steelmaker"

**Cited in:** Doc 01
**Source:** No source document. This is general knowledge but the ranking may be outdated or incorrect. POSCO's ranking fluctuates. As of recent years, POSCO has been ranked 5th or 6th globally by crude steel output.

**FLAG:** Verify current ranking or change to "one of the world's largest steelmakers."

---

### 4.3 "Every EV requires 83 kilograms of copper"

**Cited in:** Doc 01
**Source:** No source attribution in production docs. This is a commonly cited IEA/CRU figure but should have a citation.

---

### 4.4 "Every MW of offshore wind capacity requires 8 tonnes of copper"

**Cited in:** Doc 01
**Source:** No source attribution. Commonly cited industry figure but should have a citation.

---

### 4.5 ACI "Best Employer" for three consecutive years

**Cited in:** Doc 05
**Source:** No specific source in raw files. Not in the ACI PDF. May be from a Stevie or other awards reference but unverified.

---

### 4.6 "Global copper demand projected to double by 2035"

**Cited in:** Doc 01
**Source:** No attribution. Various projections exist (IEA, S&P Global, CRU) with different timelines. Should cite specific source.

---

### 4.7 "World needs 10 million additional tonnes of annual copper production by 2030"

**Cited in:** Doc 01
**Source:** No attribution. This is a commonly cited S&P Global figure but needs a citation.

---

## TIER 5: CRITICAL MOU FINDING

---

### 5.1 The ACI MOU Template

**Source document:** `intelligence/raw/source/legal/MOU.docx`

**THIS IS NOT A MINING MOU. THIS IS A WIND POWER CONSORTIUM TEMPLATE.**

Key findings from the actual MOU document:
- It is a **blank, unexecuted template** -- all counterparty fields are "[____●]"
- No dates filled in: "[___●] day of _______"
- The scope explicitly states: "The Parties intend to jointly identify and pursue **wind power project opportunities** in the Philippines"
- ACI's role is defined as "local contractor responsible for **onshore construction works**"
- The counterparty's role: "Contractor responsible for the design, supply and installation of [___●] project facilities, including supply of major equipment"
- Duration: 1 year from signing, terminable by either party with 30 days notice
- Non-exclusive, non-binding on project pursuit

**Doc 08 correctly identifies this:** "Aboitiz MOU template: blank, unexecuted, concerns wind power projects (not mining), not an active agreement." This is properly handled in the production docs.

**However:** If this MOU template is being used as evidence of a potential ACI partnership framework, it should be clearly noted that it's a wind power template that would need significant modification for a mining context.

---

## SUMMARY OF REQUIRED CORRECTIONS

### Must Fix Before Production (Critical)

1. **Intertek "56.06% Fe across 136 samples"** -- This implies 56.06% is the average or representative grade. It is the PEAK SINGLE SAMPLE. The actual range is 0.16% to 56.06%. Reword to "up to 56.06% Fe (peak sample from 136-sample systematic campaign)" or calculate and cite the actual average.

2. **MPSA Location: "Mati City and Lupon" vs "Tarragona and Mati City"** -- The MPSA Brief Summary says Tarragona, not Lupon. Verify against the actual MPSA certificate and correct.

3. **"Gorones Development Corporation" → "Gorones Inc."** -- ACI's own PDF says "Gorones Inc." Use their name.

### Should Fix Before Production (Significant)

4. **Safe man-hours: Standardize 25M vs 27M** -- Both are correct for their dates. Pick one and cite the date, or explain the growth. Currently inconsistent across Docs 02, 06, and 07.

5. **Workforce: 3,400+ vs 4,000+** -- PDF (Jan 2025) says 3,400+; Stevie (Oct 2025) says 4,000+. Clarify which is current.

6. **Client satisfaction: 3.29/4.00 vs 100%** -- Different metrics from different sources. Don't mix them.

7. **Silangan "achieved first metal production in March 2026"** -- Stated as accomplished fact. Verify this actually happened before citing it.

8. **Gold grade context** -- High gold grades (4.4 g/t, ~15 g/t) come from targeted copper vein samples only. The largest systematic campaign (Intertek 136 samples) shows Au mostly below detection. Production docs should not imply gold grades are representative across the entire concession.

### Nice to Fix (Minor)

9. **Senson Geological** -- No source document. Either source it or remove.
10. **"POSCO 6th-largest steelmaker"** -- Verify current ranking or soften language.
11. **Add citations** for EV copper (83 kg), wind copper (8 tonnes/MW), and demand doubling claims.
12. **Sebastian Aboitiz** -- Note he was not in the January 2025 ACI Company Profile; joined July 2025.

### Items Correctly Handled (No Action Needed)

- POSCO 67.31% Fe -- exact match
- Mercury 1,245/1,429 mg/kg -- exact match
- 85.4% Fe anomaly -- correctly flagged as suspicious
- THPAL relationship since 2012 -- verified
- MOU template -- correctly identified as wind power template, blank
- DMPF financial figures -- match the source document exactly
- RA 12253 September 2025 -- sourced from multiple news outlets
- EO 130 April 2021 -- sourced
- P380B Great Transformation -- sourced
- PCAB Quadruple A -- confirmed by PDF

### Missing Source Documents (Cannot Verify)

- February 2022 Compromise Agreement (GMC-DMC) -- cited in production docs but not in raw files
- Criminal Case NPS Docket No. INV-215-03844 -- cited but no document
- Supplemental Contract March 6, 2017 -- cited but no document
- P200,000/month sustenance allowance terms -- cited but no source document
- 2 Nissan Terra vehicles upon DENR approval -- cited but no source document
- P5,000,000 release to DMC -- cited but no source document

---

## APPENDIX: INTERTEK 136-SAMPLE DATA SUMMARY

For reference, the top 10 Fe results from the actual Intertek report:

| Sample | Fe (%) | Cu (ppm) | Au (ppm) |
|--------|--------|----------|----------|
| GMC PIT2-6 | **56.06** | 1,585 | 0.006 |
| GMC PIT2-9 | 47.42 | 1,204 | 0.024 |
| GMC-1050 | 25.29 | 1,190 | 0.161 |
| GMC PIT2-8 | 15.94 | 743 | 0.008 |
| GMC-1049 | 13.83 | 785 | 0.022 |
| GMC-3019 | 12.37 | 451 | <0.005 |
| GMC PIT2-5 | 10.10 | 251 | <0.005 |
| GMC-2009 | 9.05 | 149 | 0.026 |
| GMC PIT2-B | 8.25 | 155 | 0.035 |
| GMC-3010 | 7.12 | 160 | 0.006 |

The remaining ~126 samples range from **0.16% to ~7% Fe**. The 56.06% figure is an outlier peak, not representative of the 136-sample dataset as a whole.

---

## APPENDIX: DMPF FINANCIAL VERIFICATION

All DMPF figures verified against `intelligence/raw/source/legal/GMC DMPF.docx`:

| Parameter | Production Docs | DMPF Source | Status |
|-----------|----------------|-------------|--------|
| Total project cost | P1,523,754,296 | P1,523,754,296 | MATCH |
| Loan financing | P852.6M (55.95%) | P852,608,000 (55.95%) | MATCH |
| Internal cash | P332.8M (21.84%) | P332,816,000 (21.84%) | MATCH |
| Stockholder equity | P245.0M (16.08%) | P245,018,000 (16.08%) | MATCH |
| Stockholder advances | P93.3M (6.12%) | P93,312,000 (6.12%) | MATCH |
| IRR (Base Case) | 78.26% | 78.26% | MATCH |
| Payback period | 2.44 years | 2.44 years | MATCH |
| NPV | P13.36 billion | P13,357,858,029 | MATCH |
| Mine life | 11 years (2023-2033) | 11 years (2023-2033) | MATCH |
| Unit operating cost | US$31.63/MT | US$31.63/MT | MATCH |
| Break-even selling price | US$37.14/MT | Average of annual BEs = ~37.14 | MATCH |
| Equity split | 60% Filipino / 40% Foreign | 60% Filipino / 40% Foreign | MATCH |
| Employment | 141 positions | 141 positions | MATCH |
| Existing assets (Dec 2020) | P316,207,595 | P316,207,595 | MATCH |
| Exploration costs | P26,758,360 | P26,758,360 | MATCH |
| EPEP | 4% of operating cost | 4.00% | MATCH |
| SDMP | 1.5% of operating cost | 1.50% | MATCH |
| Final mine rehabilitation | P20M over 10 years | P20,000,000 over 10 years | MATCH |
| Loan terms | 7-year, 2-year grace, 6% | 7 years, 2 years grace, 6.00% | MATCH |

All DMPF financial figures are exact matches.

---

*End of Cross-Model Verification Report*
