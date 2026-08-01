import type { SourceReference } from './types';

/**
 * Simulated assistant backend.
 *
 * There is no LLM service wired up yet — this generates a canned, topic-matched
 * reply and reveals it word-by-word to drive the real streaming UI (typing
 * indicator, incremental render, auto-scroll). Swap `streamAssistantReply`'s
 * internals for a real call (e.g. a Supabase Edge Function proxying an LLM
 * over SSE) and nothing in the UI layer needs to change — it already consumes
 * this as an async token stream.
 */

export interface AssistantReply {
  content: string;
  sources: SourceReference[];
}

interface CannedTopic {
  keywords: string[];
  reply: AssistantReply;
}

const TOPICS: CannedTopic[] = [
  {
    keywords: ['wire', 'gauge', 'ampacity', 'circuit', '20a', '15a'],
    reply: {
      content:
        "For a standard 20A residential branch circuit, the minimum conductor size is 12 AWG copper under CSA C22.1. If the run exceeds about 25 metres or shares a conduit with other current-carrying conductors, derating may push you up to 10 AWG — always check the ampacity table for your specific conduit fill and ambient temperature. Aluminum conductors need to be sized one gauge larger for the same ampacity.",
      sources: [
        { id: 'src-1', label: 'CSA C22.1 Table 2', snippet: 'Allowable ampacities for insulated conductors' },
        { id: 'src-2', label: 'CSA C22.1 Rule 4-004', snippet: 'Ampacity derating for conduit fill' },
      ],
    },
  },
  {
    keywords: ['ground', 'grounding', 'bonding', 'section 4', 'part 1'],
    reply: {
      content:
        "CSA C22.1 Part 1, Section 4 sets the general grounding and bonding requirements: every electrical installation needs a grounding conductor sized per Table 16, bonded to a grounding electrode system, with bonding jumpers across any non-conductive fittings in the raceway. The system bonding jumper must be installed at the service equipment, and separately derived systems need their own grounding electrode connection.",
      sources: [
        { id: 'src-3', label: 'CSA C22.1 Section 4', snippet: 'Wiring methods — grounding and bonding' },
        { id: 'src-4', label: 'CSA C22.1 Table 16', snippet: 'Grounding conductor sizing' },
      ],
    },
  },
  {
    keywords: ['conduit', 'buried', 'depth', 'pvc', 'direct-buried', 'trench'],
    reply: {
      content:
        'In Ontario, direct-buried PVC conduit under a residential driveway or area subject to vehicle traffic needs a minimum cover of 450mm (18"), per the Ontario Electrical Safety Code amendment to CSA C22.1 Table 53. Under a lawn or non-trafficked area, 300mm is typically sufficient. Always confirm with your local ESA bulletin, since cover depth can vary for rigid metal conduit or when a concrete cap is used.',
      sources: [
        { id: 'src-5', label: 'OESC Table 53', snippet: 'Minimum cover for buried cable and conduit' },
      ],
    },
  },
  {
    keywords: ['clearance', 'panel', 'workspace', 'dedicated space'],
    reply: {
      content:
        'Electrical panels need a dedicated working space of at least 1.0m deep and as wide as the panel (minimum 750mm), extending from the floor to a height of 2.0m. Nothing else — plumbing, storage, ductwork — is permitted to encroach on that space, and the panel needs at least 900mm of clear headroom for access.',
      sources: [
        { id: 'src-6', label: 'CSA C22.1 Rule 2-308', snippet: 'Access and working space for electrical equipment' },
      ],
    },
  },
  {
    keywords: ['afci', 'gfci', 'arc fault', 'ground fault'],
    reply: {
      content:
        "GFCI protection guards against ground faults — current leaking to ground through a person or object — and is required in wet locations like bathrooms, kitchens, and outdoor receptacles. AFCI protection detects dangerous arcing conditions in the wiring itself (a common cause of electrical fires) and is required for most residential branch circuits feeding bedrooms and living spaces. Dual-function AFCI/GFCI breakers are increasingly required where both hazards are present, such as kitchen counter receptacles.",
      sources: [
        { id: 'src-7', label: 'CSA C22.1 Rule 26-724', snippet: 'AFCI protection requirements' },
        { id: 'src-8', label: 'CSA C22.1 Rule 26-700', snippet: 'GFCI protection requirements' },
      ],
    },
  },
];

const FALLBACK_REPLY: AssistantReply = {
  content:
    "I don't have a grounded answer for that specific question yet — I'm currently running on a small set of demo responses while the real code-search backend is being connected. Try asking about wire sizing, grounding, buried conduit depth, panel clearances, or AFCI/GFCI protection to see a full answer with sources.",
  sources: [],
};

function pickReply(prompt: string): AssistantReply {
  const normalized = prompt.toLowerCase();
  const match = TOPICS.find((topic) => topic.keywords.some((kw) => normalized.includes(kw)));
  return match?.reply ?? FALLBACK_REPLY;
}

export interface StreamHandle {
  cancel: () => void;
}

export function streamAssistantReply(
  prompt: string,
  onToken: (textSoFar: string) => void,
  onDone: (reply: AssistantReply) => void
): StreamHandle {
  const reply = pickReply(prompt);
  const words = reply.content.split(' ');
  let index = 0;
  let cancelled = false;

  const emitNext = () => {
    if (cancelled) return;
    index += 1;
    onToken(words.slice(0, index).join(' '));
    if (index >= words.length) {
      onDone(reply);
      return;
    }
    const delay = 28 + Math.random() * 45;
    timer = setTimeout(emitNext, delay);
  };

  let timer: ReturnType<typeof setTimeout> = setTimeout(emitNext, 260);

  return {
    cancel: () => {
      cancelled = true;
      clearTimeout(timer);
    },
  };
}
