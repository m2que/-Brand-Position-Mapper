import { GoogleGenAI } from '@google/genai';

type AxisDefinition = {
  axisName: string;
  negativeLabel: string;
  positiveLabel: string;
  displayLabel: string;
  explanation: string;
};

type ReferenceCategory =
  | 'official_brand'
  | 'government'
  | 'industry_databases'
  | 'news_media'
  | 'academic_research'
  | 'marketing_reports';

type Reference = {
  title: string;
  url: string;
  category: ReferenceCategory;
  relevanceNote: string;
};

type BrandMapRequest = {
  brandName: string;
  scope: string;
};

type MapBrand = {
  name: string;
  x: number;
  y: number;
  isTarget: boolean;
};

type MapData = {
  scope: string;
  xAxisLabel: string;
  yAxisLabel: string;
  axisDefinitions: {
    x: AxisDefinition;
    y: AxisDefinition;
  };
  brands: MapBrand[];
  positioningSummary: string;
  competitiveInterpretation: string;
  pointsOfParity: string;
  pointsOfDifference: string;
  references: Reference[];
};

const VALID_CATEGORIES: ReferenceCategory[] = [
  'official_brand',
  'government',
  'industry_databases',
  'news_media',
  'academic_research',
  'marketing_reports'
];

const FIXED_Y_AXIS: AxisDefinition = {
  axisName: 'Price Position',
  negativeLabel: 'Lower Price',
  positiveLabel: 'Higher Price',
  displayLabel: 'Lower Price (-10) to Higher Price (10)',
  explanation: 'This dimension measures perceived price position, showing whether customers are more likely to see the brand as lower-priced and more affordable or as higher-priced and more premium.'
};

const EXTERNAL_REFERENCE_TARGET = 3;
const MAX_VISIBLE_REFERENCES = 5;
const WEAK_SOURCE_PATTERNS = [
  'scribd.com',
  'coursehero.com',
  'studocu.com',
  'cram.com',
  'brainly.',
  'quizlet.',
  'owlers.com',
  'owler.com'
];

const OFFICIAL_SOURCE_HINTS = [
  'about us',
  'official',
  'investor',
  'annual report',
  'press release'
];

const LUXURY_PRESTIGE_BRANDS = ['hermes', 'hermes', 'hermes paris', 'louis vuitton', 'gucci', 'prada', 'chanel', 'dior', 'burberry'];
const ACCESSIBLE_BRANDS = ['michael kors', 'coach', 'kate spade', 'tory burch', 'ralph lauren', 'zara', 'coors'];

const isReferenceCategory = (value: string): value is ReferenceCategory => VALID_CATEGORIES.includes(value as ReferenceCategory);

const clampScore = (value: number) => Math.max(-10, Math.min(10, value));

const normalizeCategory = (category: string): ReferenceCategory => {
  const cleaned = category.toLowerCase().trim();

  if (isReferenceCategory(cleaned)) {
    return cleaned;
  }

  if (cleaned.includes('news') || cleaned.includes('bloomberg') || cleaned.includes('reuters') || cleaned.includes('times')) return 'news_media';
  if (cleaned.includes('gov') || cleaned.includes('census') || cleaned.includes('who') || cleaned.includes('un')) return 'government';
  if (cleaned.includes('academic') || cleaned.includes('scholar') || cleaned.includes('edu') || cleaned.includes('journal')) return 'academic_research';
  if (cleaned.includes('brand') || cleaned.includes('official') || cleaned.includes('company') || cleaned.includes('investor')) return 'official_brand';
  if (cleaned.includes('database') || cleaned.includes('statista') || cleaned.includes('gartner') || cleaned.includes('mckinsey') || cleaned.includes('deloitte')) return 'industry_databases';
  if (cleaned.includes('report') || cleaned.includes('marketing') || cleaned.includes('association') || cleaned.includes('trade')) return 'marketing_reports';

  return 'news_media';
};

const getDisplaySourceLabel = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const sanitizeUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
};

const dedupeReferences = <T extends { url: string }>(references: T[]): T[] => {
  const seen = new Set<string>();

  return references.filter((ref) => {
    const key = ref.url.replace(/\/$/, '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const isFilteredArtifact = (url: string, title: string) => {
  const lowerUrl = url.toLowerCase();
  const lowerTitle = title.toLowerCase();

  return lowerUrl.includes('google.com/search')
    || lowerUrl.includes('google.com/travel')
    || lowerTitle.includes('current time')
    || lowerTitle.includes('weather')
    || lowerTitle.includes('google maps')
    || WEAK_SOURCE_PATTERNS.some((pattern) => lowerUrl.includes(pattern));
};

const inferCategoryFromSource = (title: string, url: string, category: string): ReferenceCategory => {
  const combined = `${title} ${url} ${category}`.toLowerCase();

  if (combined.includes('.gov') || combined.includes('census') || combined.includes('who') || combined.includes('un ')) return 'government';
  if (combined.includes('.edu') || combined.includes('journal') || combined.includes('study') || combined.includes('research') || combined.includes('springer') || combined.includes('jstor')) return 'academic_research';
  if (combined.includes('reuters') || combined.includes('bloomberg') || combined.includes('guardian') || combined.includes('forbes') || combined.includes('nyt') || combined.includes('ft.com')) return 'news_media';
  if (combined.includes('statista') || combined.includes('mckinsey') || combined.includes('gartner') || combined.includes('deloitte') || combined.includes('fortune business insights') || combined.includes('imarc')) return 'industry_databases';
  if (combined.includes('trade') || combined.includes('association') || combined.includes('marketing')) return 'marketing_reports';
  if (OFFICIAL_SOURCE_HINTS.some((hint) => combined.includes(hint))) return 'official_brand';

  return normalizeCategory(category || combined);
};

const scoreReferenceStrength = (reference: Reference) => {
  const lowerUrl = reference.url.toLowerCase();
  const lowerTitle = reference.title.toLowerCase();
  let score = 0;

  if (reference.category === 'government') score += 6;
  if (reference.category === 'academic_research') score += 5;
  if (reference.category === 'industry_databases') score += 5;
  if (reference.category === 'news_media') score += 4;
  if (reference.category === 'marketing_reports') score += 3;
  if (reference.category === 'official_brand') score += 1;

  if (lowerUrl.includes('.gov') || lowerUrl.includes('.edu')) score += 3;
  if (lowerUrl.includes('reuters.com') || lowerUrl.includes('bloomberg.com') || lowerUrl.includes('ft.com') || lowerUrl.includes('nytimes.com')) score += 2;
  if (lowerUrl.includes('statista.com') || lowerUrl.includes('mckinsey.com') || lowerUrl.includes('gartner.com') || lowerUrl.includes('deloitte.com')) score += 2;
  if (lowerTitle.includes('market') || lowerTitle.includes('industry') || lowerTitle.includes('consumer')) score += 1;
  if (WEAK_SOURCE_PATTERNS.some((pattern) => lowerUrl.includes(pattern))) score -= 10;

  return score;
};

const buildReferenceNote = (category: ReferenceCategory, brandName: string, scope: string, _title: string, url: string) => {
  const sourceLabel = getDisplaySourceLabel(url);

  if (category === 'academic_research') {
    return `${sourceLabel} offers research evidence that helps explain how ${brandName} is perceived or compared in the ${scope.toLowerCase()} market.`;
  }

  if (category === 'news_media') {
    return `${sourceLabel} gives an independent market view on ${brandName}, its competitors, or the category dynamics shaping this ${scope.toLowerCase()} map.`;
  }

  if (category === 'industry_databases') {
    return `${sourceLabel} provides category or market context that supports where ${brandName} sits on the map in the ${scope.toLowerCase()} view.`;
  }

  if (category === 'marketing_reports') {
    return `${sourceLabel} adds segment or competitor-set context that helps justify the positioning read for ${brandName} in the ${scope.toLowerCase()} market.`;
  }

  if (category === 'government') {
    return `${sourceLabel} provides public data that helps anchor the market context behind the ${brandName} positioning analysis.`;
  }

  return `${sourceLabel} provides background context on how ${brandName} presents itself, which can help interpret the map even if stronger external sources are preferred.`;
};

const stripScoreSuffix = (label: string) => label.replace(/\s*\((-?10)\)\s*$/g, '').trim();

const formatAxisDisplayLabel = (_axisName: string, negativeLabel: string, positiveLabel: string) => {
  const cleanNegativeLabel = stripScoreSuffix(negativeLabel);
  const cleanPositiveLabel = stripScoreSuffix(positiveLabel);
  return `${cleanNegativeLabel} (-10) to ${cleanPositiveLabel} (10)`;
};

const parseAxisDefinition = (label: string, fallbackName: string): AxisDefinition => {
  const match = label.trim().match(/^(.*?)\s*\(-?10\s*:\s*([^)]*?)\)\s*to\s*(.*?)\s*\(10\s*:\s*([^)]*?)\)$/i);

  if (match) {
    const leftConcept = match[1].trim();
    const negativeLabel = match[2].trim();
    const rightConcept = match[3].trim();
    const positiveLabel = match[4].trim();
    const axisName = leftConcept === rightConcept ? leftConcept : `${leftConcept} to ${rightConcept}`;

    return {
      axisName,
      negativeLabel,
      positiveLabel,
      displayLabel: formatAxisDisplayLabel(axisName, negativeLabel, positiveLabel),
      explanation: ''
    };
  }

  const parts = label.split(' to ').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 2) {
    return {
      axisName: `${parts[0]} to ${parts[1]}`,
      negativeLabel: parts[0],
      positiveLabel: parts[1],
      displayLabel: formatAxisDisplayLabel(fallbackName, parts[0], parts[1]),
      explanation: ''
    };
  }

  return {
    axisName: fallbackName,
    negativeLabel: 'Lower end',
    positiveLabel: 'Higher end',
    displayLabel: formatAxisDisplayLabel(fallbackName, 'Lower end', 'Higher end'),
    explanation: ''
  };
};

const buildAxisExplanation = (axis: AxisDefinition) => {
  const combined = `${axis.axisName} ${axis.negativeLabel} ${axis.positiveLabel}`.toLowerCase();

  if (combined.includes('price')) {
    return FIXED_Y_AXIS.explanation;
  }
  if (combined.includes('traditional') || combined.includes('heritage') || combined.includes('modern') || combined.includes('innovative')) {
    return 'This dimension measures whether the brand is seen as more rooted in legacy and familiar category cues, or more contemporary and innovation-led.';
  }
  if (combined.includes('accessible') || combined.includes('mainstream') || combined.includes('exclusive') || combined.includes('craft')) {
    return 'This dimension measures whether the brand is perceived as broad and easy to buy, or more selective, elevated, and associated with higher-end quality.';
  }
  if (combined.includes('classic') || combined.includes('timeless') || combined.includes('trend') || combined.includes('fashion-forward')) {
    return 'This dimension measures whether the brand is perceived as more classic and enduring, or more current and trend-led.';
  }

  return `This dimension shows whether customers are more likely to associate the brand with ${axis.negativeLabel.toLowerCase()} or with ${axis.positiveLabel.toLowerCase()}.`;
};

const buildCanonicalXAxis = (label: string): AxisDefinition => {
  const parsed = parseAxisDefinition(label, 'Customer Perception');
  return {
    ...parsed,
    explanation: buildAxisExplanation(parsed)
  };
};

const averageCoordinate = (brands: MapBrand[], names: string[], axis: 'x' | 'y') => {
  const matches = brands.filter((brand) => names.includes(brand.name.toLowerCase()));
  if (matches.length === 0) return null;
  return matches.reduce((sum, brand) => sum + brand[axis], 0) / matches.length;
};

const flipXAxis = (brands: MapBrand[], axis: AxisDefinition) => ({
  brands: brands.map((brand) => ({ ...brand, x: brand.x * -1 })),
  axis: {
    axisName: axis.axisName,
    negativeLabel: axis.positiveLabel,
    positiveLabel: axis.negativeLabel,
    displayLabel: formatAxisDisplayLabel(axis.axisName, axis.positiveLabel, axis.negativeLabel),
    explanation: buildAxisExplanation({
      ...axis,
      negativeLabel: axis.positiveLabel,
      positiveLabel: axis.negativeLabel,
      displayLabel: formatAxisDisplayLabel(axis.axisName, axis.positiveLabel, axis.negativeLabel)
    })
  }
});

const xAxisNeedsFlip = (brands: MapBrand[], axis: AxisDefinition) => {
  const combined = `${axis.axisName} ${axis.negativeLabel} ${axis.positiveLabel}`.toLowerCase();
  const luxuryAverage = averageCoordinate(brands, LUXURY_PRESTIGE_BRANDS, 'x');
  const accessibleAverage = averageCoordinate(brands, ACCESSIBLE_BRANDS, 'x');

  if (luxuryAverage === null || accessibleAverage === null) {
    return false;
  }

  if (combined.includes('exclusive') || combined.includes('luxury') || combined.includes('prestige') || combined.includes('premium')) {
    return axis.positiveLabel.toLowerCase().includes('exclusive')
      || axis.positiveLabel.toLowerCase().includes('luxury')
      || axis.positiveLabel.toLowerCase().includes('prestige')
      || axis.positiveLabel.toLowerCase().includes('premium')
      ? luxuryAverage < accessibleAverage
      : luxuryAverage > accessibleAverage;
  }

  if (combined.includes('accessible') || combined.includes('mainstream') || combined.includes('mass')) {
    return axis.positiveLabel.toLowerCase().includes('accessible') || axis.positiveLabel.toLowerCase().includes('mainstream')
      ? accessibleAverage < luxuryAverage
      : accessibleAverage > luxuryAverage;
  }

  return false;
};

const isPriceAxis = (label: string) => {
  const lower = label.toLowerCase();
  return lower.includes('price')
    || lower.includes('pricing')
    || lower.includes('affordable')
    || lower.includes('expensive')
    || lower.includes('value')
    || lower.includes('premium')
    || lower.includes('luxury');
};

const enforcePriceYAxis = (brands: MapBrand[], rawXAxisLabel: string, rawYAxisLabel: string) => {
  if (isPriceAxis(rawXAxisLabel) && !isPriceAxis(rawYAxisLabel)) {
    return {
      brands: brands.map((brand) => ({ ...brand, x: clampScore(brand.y), y: clampScore(brand.x) })),
      xAxisLabel: rawYAxisLabel
    };
  }

  return {
    brands: brands.map((brand) => ({ ...brand, x: clampScore(brand.x), y: clampScore(brand.y) })),
    xAxisLabel: rawXAxisLabel
  };
};

const enforceYAxisDirection = (brands: MapBrand[]) => {
  const luxuryAverage = averageCoordinate(brands, LUXURY_PRESTIGE_BRANDS, 'y');
  const accessibleAverage = averageCoordinate(brands, ACCESSIBLE_BRANDS, 'y');

  if (luxuryAverage !== null && accessibleAverage !== null && luxuryAverage < accessibleAverage) {
    return brands.map((brand) => ({ ...brand, y: brand.y * -1 }));
  }

  return brands;
};

const isUsefulInterpretation = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const cleaned = value.trim().toLowerCase();
  return Boolean(cleaned)
    && !cleaned.includes('the map places the target brand')
    && !cleaned.includes('read the relative distance between the target brand')
    && !cleaned.includes('show how it is being seen in relation to competitors');
};

const isUsefulPositioningField = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const cleaned = value.trim().toLowerCase();
  return Boolean(cleaned)
    && !cleaned.includes('closest to')
    && !cleaned.includes('occupy a similar customer-perception space')
    && !cleaned.includes('strongest point of parity')
    && !cleaned.includes('strongest point of difference');
};

const buildInterpretationFallback = (brandName: string, scope: string, xAxis: AxisDefinition, brands: MapBrand[]) => {
  const targetBrand = brands.find((brand) => brand.isTarget);
  const competitors = brands.filter((brand) => !brand.isTarget);

  if (!targetBrand || competitors.length === 0) {
    return {
      positioningSummary: `${brandName} is mapped within the ${scope.toLowerCase()} market using ${xAxis.axisName} and price position as the main customer perception dimensions. The result shows where the brand sits relative to its main competitive set rather than in isolation.`,
      competitiveInterpretation: `${brandName} is compared against nearby competitors so the map can show whether customer perception is clustered with rivals or differentiated into a more distinct space.`
    };
  }

  const nearestCompetitor = competitors
    .map((competitor) => ({ ...competitor, distance: Math.hypot(targetBrand.x - competitor.x, targetBrand.y - competitor.y) }))
    .sort((first, second) => first.distance - second.distance)[0];

  const farthestCompetitor = competitors
    .map((competitor) => ({ ...competitor, distance: Math.hypot(targetBrand.x - competitor.x, targetBrand.y - competitor.y) }))
    .sort((first, second) => second.distance - first.distance)[0];

  const xTilt = targetBrand.x >= 0 ? xAxis.positiveLabel.toLowerCase() : xAxis.negativeLabel.toLowerCase();
  const priceTilt = targetBrand.y >= 0 ? 'higher perceived price' : 'lower perceived price';

  return {
    positioningSummary: `${brandName} sits closer to the ${xTilt} end of the map and is perceived at a ${priceTilt} level in the ${scope.toLowerCase()} market. That combination shows how customers balance the brand's overall market character with its perceived price position.`,
    competitiveInterpretation: `${brandName} sits closest to ${nearestCompetitor.name}, suggesting the strongest perceptual overlap is with that competitor. ${farthestCompetitor ? `${farthestCompetitor.name} is the clearest contrast on the map, showing where customer perception separates most strongly.` : 'The remaining competitors show where the brand is relatively closer versus more clearly separated.'}`
  };
};

const buildPositioningFallback = (brandName: string, xAxis: AxisDefinition, brands: MapBrand[]) => {
  const targetBrand = brands.find((brand) => brand.isTarget);
  const competitors = brands.filter((brand) => !brand.isTarget);

  if (!targetBrand || competitors.length === 0) {
    return {
      pointsOfParity: `${brandName} still needs to meet the core expectations of its category so customers see it as a credible option before differentiation can matter.`,
      pointsOfDifference: `${brandName} should stand apart through the specific associations that most clearly separate it on the map's customer-perception dimension and on perceived price position.`
    };
  }

  const nearestCompetitor = competitors
    .map((competitor) => ({ ...competitor, distance: Math.hypot(targetBrand.x - competitor.x, targetBrand.y - competitor.y) }))
    .sort((first, second) => first.distance - second.distance)[0];

  const priceLanguage = targetBrand.y >= nearestCompetitor.y ? 'a more elevated perceived price point' : 'a more accessible perceived price point';
  const xLanguage = targetBrand.x >= 0 ? xAxis.positiveLabel.toLowerCase() : xAxis.negativeLabel.toLowerCase();

  return {
    pointsOfParity: `${brandName} must still match the category credentials customers expect from alternatives like ${nearestCompetitor.name}, including the core benefits and trust signals needed to be seen as a legitimate option in the set.`,
    pointsOfDifference: `${brandName} stands apart by being associated more strongly with ${xLanguage} while also carrying ${priceLanguage} than ${nearestCompetitor.name}, giving customers a reason to choose it for a distinct market role.`
  };
};

const getMatchedGroundedUrl = (url: string, verifiedSources: Map<string, string>) => {
  if (verifiedSources.has(url)) return url;
  const normalizedUrl = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase();
  return Array.from(verifiedSources.keys()).find((verifiedUrl) =>
    verifiedUrl.includes(normalizedUrl) || normalizedUrl.includes(verifiedUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase())
  ) || null;
};

const curateReferences = (references: Reference[], verifiedSources: Map<string, string>, brandName: string, scope: string) => {
  const cleaned = dedupeReferences(references)
    .filter((reference) => !isFilteredArtifact(reference.url, reference.title))
    .map((reference) => ({
      ...reference,
      category: inferCategoryFromSource(reference.title, reference.url, reference.category),
      relevanceNote: reference.relevanceNote?.trim() || buildReferenceNote(reference.category, brandName, scope, reference.title, reference.url)
    }));

  const external = cleaned
    .filter((reference) => reference.category !== 'official_brand')
    .sort((first, second) => scoreReferenceStrength(second) - scoreReferenceStrength(first));

  if (external.length >= EXTERNAL_REFERENCE_TARGET) {
    return external.slice(0, MAX_VISIBLE_REFERENCES);
  }

  const groundedRecovered = dedupeReferences(
    Array.from(verifiedSources.entries()).map(([url, title]) => {
      const category = inferCategoryFromSource(title || '', url, '');
      return {
        title: title || url,
        url,
        category,
        relevanceNote: buildReferenceNote(category, brandName, scope, title || url, url)
      };
    })
  )
    .filter((reference) => !isFilteredArtifact(reference.url, reference.title))
    .filter((reference) => reference.category !== 'official_brand')
    .sort((first, second) => scoreReferenceStrength(second) - scoreReferenceStrength(first));

  const mergedExternal = dedupeReferences([...external, ...groundedRecovered]);
  if (mergedExternal.length >= EXTERNAL_REFERENCE_TARGET) {
    return mergedExternal.slice(0, MAX_VISIBLE_REFERENCES);
  }

  const officialFallback = cleaned
    .filter((reference) => reference.category === 'official_brand')
    .sort((first, second) => scoreReferenceStrength(second) - scoreReferenceStrength(first));

  return dedupeReferences([...mergedExternal, ...officialFallback]).slice(0, MAX_VISIBLE_REFERENCES);
};

const buildBrandMapPrompt = ({ brandName, scope }: BrandMapRequest): string => `
OBJECTIVE: Return the strongest evidence-based brand positioning map for "${brandName}" in the scope "${scope}".

CRITICAL RULE: QUALITY > SPECIFICITY
It is better to use high-quality market evidence than weak brand-specific evidence.

STEP 1: CONTEXTUAL EXPANSION
If "${brandName}" is a specific brand, identify its broader category or industry first.
Search for the specific brand first.
If the only brand-specific sources are weak or user-generated, discard them and use stronger broader-market sources instead.

STEP 2: SOURCE SELECTION & CATEGORIZATION
You MUST use the Google Search tool.
You MUST populate the references array in the JSON output.
You MUST categorize every source into one of the 6 allowed categories.
Only use URLs explicitly returned by the search tool.
Do not include search pages, system artifacts, broken links, or weak aggregator sites.
Official brand sources may inform the analysis, but they should usually not appear in the final displayed references unless strong external sources are unavailable.
Prefer 3-5 strong external references when grounded results support them.

Allowed categories:
1. official_brand
2. government
3. industry_databases
4. news_media
5. academic_research
6. marketing_reports

STEP 3: MAP LOGIC
The map must compare "${brandName}" against 4-5 meaningful competitors.
Use scores from -10 to 10.
The Y axis is ALWAYS fixed as price position.
Y axis meaning: bottom = lower perceived price, top = higher perceived price.
Do not use price on the X axis.
The X axis must be a plain-language customer-perception dimension that is meaningfully relevant for this category.
Avoid jargon such as premiumization, model language, parser language, or academic-only phrasing.
Axis wording must be simple, readable, and internally consistent with the coordinates.

STEP 4: POSITIONING OUTPUT
You MUST return both pointsOfParity and pointsOfDifference.
Points of parity = shared category expectations or category credentials.
Points of difference = distinctive customer associations.
They must read like positioning statements, not geometric summaries.

STEP 5: OUTPUT FORMAT
Return a single raw JSON object with this shape:
{
  "scope": "${scope}",
  "xAxisLabel": "string",
  "yAxisLabel": "Lower Price (-10) to Higher Price (10)",
  "positioningSummary": "string",
  "competitiveInterpretation": "string",
  "pointsOfParity": "string",
  "pointsOfDifference": "string",
  "brands": [
    {
      "name": "string",
      "x": number,
      "y": number,
      "isTarget": boolean
    }
  ],
  "references": [
    {
      "title": "Page Title from Search Result",
      "url": "Exact URL from Search Result",
      "category": "official_brand" | "government" | "industry_databases" | "news_media" | "academic_research" | "marketing_reports",
      "relevanceNote": "Short note explaining why this source supports the positioning read"
    }
  ]
}

Constraints:
- xAxisLabel must explicitly define both ends using this pattern: "Left End (-10) to Right End (10)".
- yAxisLabel must always be exactly: "Lower Price (-10) to Higher Price (10)".
- Higher on the chart must always mean higher perceived price.
- Every interpretation must be specific to the target brand and the actual map result.
- References must be non-empty when grounded sources exist.
- Prefer 3-5 strong external references. Max 5 total.
- You are forbidden from constructing URLs. Only copy URLs from live search results.
`;

const parseBrandMapResponse = (jsonText: string, verifiedSources: Map<string, string>): MapData => {
  let cleanedJsonText = jsonText.trim();

  if (cleanedJsonText.startsWith('```json')) {
    cleanedJsonText = cleanedJsonText.substring(7, cleanedJsonText.length - 3).trim();
  } else if (cleanedJsonText.startsWith('```')) {
    cleanedJsonText = cleanedJsonText.substring(3, cleanedJsonText.length - 3).trim();
  }

  const data = JSON.parse(cleanedJsonText) as Partial<MapData> & { references?: unknown };

  const brands = Array.isArray(data.brands)
    ? data.brands.filter((brand): brand is MapBrand =>
        typeof brand?.name === 'string'
        && typeof brand?.x === 'number'
        && typeof brand?.y === 'number'
        && typeof brand?.isTarget === 'boolean'
      )
    : [];

  const targetBrandName = brands.find((brand) => brand.isTarget)?.name || 'the brand';
  const scope = typeof data.scope === 'string' ? data.scope : 'Selected Scope';

  const rawReferences = Array.isArray(data.references)
    ? data.references.map((ref) => {
        const source = ref as { title?: string; url?: string; category?: string; relevanceNote?: string };
        let finalUrl = typeof source.url === 'string' ? source.url.trim() : '';
        let finalTitle = typeof source.title === 'string' ? source.title.trim() : '';
        let isValid = false;

        if (verifiedSources.size > 0) {
          if (verifiedSources.has(finalUrl)) {
            isValid = true;
            if (!finalTitle || finalTitle === finalUrl) {
              finalTitle = verifiedSources.get(finalUrl) || finalTitle;
            }
          } else {
            const bestMatchKey = getMatchedGroundedUrl(finalUrl, verifiedSources);
            if (bestMatchKey) {
              isValid = true;
              finalUrl = bestMatchKey;
              if (!finalTitle || finalTitle === source.url) {
                finalTitle = verifiedSources.get(bestMatchKey) || finalTitle;
              }
            }
          }
        } else {
          const sanitizedUrl = sanitizeUrl(finalUrl);
          if (sanitizedUrl) {
            finalUrl = sanitizedUrl;
            isValid = true;
          }
        }

        if (!isValid || isFilteredArtifact(finalUrl, finalTitle || finalUrl)) return null;

        const category = inferCategoryFromSource(finalTitle || '', finalUrl, source.category || '');

        return {
          title: finalTitle || finalUrl,
          url: finalUrl,
          category,
          relevanceNote: typeof source.relevanceNote === 'string' && source.relevanceNote.trim()
            ? source.relevanceNote.trim()
            : buildReferenceNote(category, targetBrandName, scope, finalTitle || finalUrl, finalUrl)
        };
      }).filter((reference): reference is Reference => reference !== null)
    : [];

  const priceEnforced = enforcePriceYAxis(
    brands,
    typeof data.xAxisLabel === 'string' ? data.xAxisLabel : 'Lower end (-10) to Higher end (10)',
    typeof data.yAxisLabel === 'string' ? data.yAxisLabel : FIXED_Y_AXIS.displayLabel
  );

  let normalizedBrands = enforceYAxisDirection(priceEnforced.brands);
  let xAxis = buildCanonicalXAxis(priceEnforced.xAxisLabel);

  if (xAxisNeedsFlip(normalizedBrands, xAxis)) {
    const flipped = flipXAxis(normalizedBrands, xAxis);
    normalizedBrands = flipped.brands;
    xAxis = flipped.axis;
  }

  const axisDefinitions = {
    x: xAxis,
    y: FIXED_Y_AXIS
  };

  const interpretationFallback = buildInterpretationFallback(targetBrandName, scope, axisDefinitions.x, normalizedBrands);
  const positioningFallback = buildPositioningFallback(targetBrandName, axisDefinitions.x, normalizedBrands);
  const references = curateReferences(rawReferences, verifiedSources, targetBrandName, scope);

  return {
    scope,
    xAxisLabel: axisDefinitions.x.displayLabel,
    yAxisLabel: axisDefinitions.y.displayLabel,
    axisDefinitions,
    brands: normalizedBrands,
    positioningSummary: isUsefulInterpretation(data.positioningSummary) ? data.positioningSummary.trim() : interpretationFallback.positioningSummary,
    competitiveInterpretation: isUsefulInterpretation(data.competitiveInterpretation) ? data.competitiveInterpretation.trim() : interpretationFallback.competitiveInterpretation,
    pointsOfParity: isUsefulPositioningField((data as { pointsOfParity?: unknown }).pointsOfParity)
      ? (data as { pointsOfParity: string }).pointsOfParity.trim()
      : positioningFallback.pointsOfParity,
    pointsOfDifference: isUsefulPositioningField((data as { pointsOfDifference?: unknown }).pointsOfDifference)
      ? (data as { pointsOfDifference: string }).pointsOfDifference.trim()
      : positioningFallback.pointsOfDifference,
    references
  };
};

type VercelRequest = {
  method?: string;
  body?: {
    brandName?: unknown;
    scope?: unknown;
  };
};

type VercelResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { brandName, scope } = req.body ?? {};

  const normalizedBrandName = typeof brandName === 'string' ? brandName.trim() : '';

  if (!normalizedBrandName) {
    return res.status(400).json({ error: 'Brand name is required.' });
  }

  if (normalizedBrandName.length > 300) {
    return res.status(400).json({ error: 'Brand name must be 300 characters or fewer.' });
  }

  if (typeof scope !== 'string' || !scope.trim()) {
    return res.status(400).json({ error: 'Scope is required.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`GEMINI_API_KEY present in handler: ${Boolean(apiKey)}`);

    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: buildBrandMapPrompt({ brandName: normalizedBrandName, scope: scope.trim() }),
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1
      }
    });

    const verifiedSources = new Map<string, string>();
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    groundingChunks.forEach((chunk) => {
      if (chunk.web?.uri) {
        verifiedSources.set(chunk.web.uri, chunk.web.title || '');
      }
    });

    const data = parseBrandMapResponse(response.text, verifiedSources);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Brand map generation failed:', error);
    return res.status(500).json({ error: 'Failed to generate brand position map. Please try again.' });
  }
}
