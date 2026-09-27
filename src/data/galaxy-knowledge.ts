import { galaxyNodes } from "./galaxy";

/** Curated, sourced semantic edges; these are editorial links, not claims of shared code. */
export const knowledgeEdges = [
  { from:"intellirag",to:"evals",relation:"checks answers with",why:"The IntelliRAG repository includes an evaluation directory and RAGAS checks.",weight:1 },
  { from:"intellirag",to:"memorable",relation:"shares the question of traceable sources with",why:"Both projects keep a source close to the generated output.",weight:1.3 },
  { from:"evals",to:"research",relation:"shares a measurement-first approach with",why:"The zeolite study compares approaches against the same extraction task.",weight:1.1 },
  { from:"memorable",to:"research",relation:"connects source fidelity to",why:"Document memory and scientific extraction both depend on preserving source context.",weight:1.4 },
  { from:"thermosense",to:"miq",relation:"connects observed signals to decisions, as does",why:"ThermoSense measures forecast bias; MiQ is market analytics. This is a theme, not shared software.",weight:1.4 },
  { from:"thermosense",to:"drone-wildlife-detection",relation:"shares field observations with",why:"Rooftop sensors and drone footage are different sources of real-world measurements.",weight:1.3 },
  { from:"miq",to:"flipkart",relation:"continues an analytics thread from",why:"Both are analytics roles described in the portfolio résumé.",weight:1.1 },
  { from:"magpie",to:"vllm",relation:"sits upstream of model serving such as",why:"A gateway routes model requests; vLLM serves inference. This is a systems relationship, not a code dependency.",weight:1.1 },
  { from:"magpie",to:"llama",relation:"contrasts hosted routing with local inference in",why:"A model gateway and local inference solve different parts of getting model output.",weight:1.2 },
  { from:"vllm",to:"llama",relation:"shares an inference focus with",why:"Both are inference projects, with different serving and local-runtime constraints.",weight:1 },
  { from:"magpie",to:"copilotkit",relation:"connects model routing to agent interfaces such as",why:"The gateway and agent UI address adjacent layers; this does not imply an integration.",weight:1.5 },
  { from:"copilotkit",to:"openmuse",relation:"shares an agent-interface theme with",why:"The portfolio links public forks in agent UI and agent-tool ecosystems.",weight:1.2 },
  { from:"systris",to:"intellirag",relation:"lets visitors discover",why:"The portfolio links to IntelliRAG and its source.",weight:1.8 },
  { from:"systris",to:"memorable",relation:"lets visitors discover",why:"The portfolio links to memoRABLE and its source.",weight:1.8 },
  { from:"systris",to:"thermosense",relation:"lets visitors discover",why:"The portfolio links to ThermoSense and its source.",weight:1.8 },
  { from:"systris",to:"magpie",relation:"lets visitors discover",why:"The portfolio connects open-source work to its source.",weight:1.8 },
  { from:"systris",to:"miq",relation:"sets professional context for",why:"The portfolio résumé links MiQ to the body of work.",weight:1.8 },
  { from:"systris",to:"project-management-tool",relation:"lets visitors discover",why:"The portfolio links to the shared board project.",weight:1.8 },
  { from:"systris",to:"agentic-finance-advisor",relation:"lets visitors discover",why:"The portfolio links to the finance advisor project.",weight:1.8 },
  { from:"project-management-tool",to:"bolt-dataset",relation:"contrasts collaborative software with data generation in",why:"These are two different build projects, not a code relationship.",weight:1.8 },
] as const;

export const knowledgeDetails: Record<string, { idea: string; method: string }> = Object.fromEntries(galaxyNodes.map(n=>[n.id,{idea:n.story,method:n.evidence}]));
export const knowledgeGraph = {
  title:"Charan Rathore's work galaxy",
  note:"Curated semantic links. Connections explain an idea or a theme, not a dependency or collaboration. Public forks alone do not prove upstream contributions.",
  nodes:galaxyNodes.map(n=>({id:n.id,label:n.label,idea:n.story,method:n.evidence,source:n.href})),
  edges:knowledgeEdges.map(e=>({from:e.from,to:e.to,relation:e.relation,why:e.why}))
};

/** Dijkstra over the curated graph. Light only the nearest meaningful routes. */
export function traceFrom(start:string) {
  const distances=new Map<string,number>([[start,0]]), previous=new Map<string,string>(),visited=new Set<string>();
  while(visited.size<galaxyNodes.length) {
    const next=[...distances].filter(([id])=>!visited.has(id)).sort((a,b)=>a[1]-b[1])[0];
    if(!next)break;
    const [id,dist]=next;visited.add(id);
    for(const e of knowledgeEdges) {
      const neighbor=e.from===id?e.to:e.to===id?e.from:null;
      if(!neighbor||visited.has(neighbor))continue;
      const candidate=dist+e.weight;
      if(candidate<(distances.get(neighbor)??Infinity)){distances.set(neighbor,candidate);previous.set(neighbor,id);}
    }
  }
  const targets=[...distances].filter(([id])=>id!==start).sort((a,b)=>a[1]-b[1]).slice(0,5);
  const routes=new Map<string,number>([[start,0]]);
  for(const [target] of targets){let id=target;while(id!==start&&previous.has(id)){routes.set(id,distances.get(id)!);id=previous.get(id)!;}}
  const segments=new Map<string,number>();
  for(const [id,dist] of routes){const parent=previous.get(id);if(parent)segments.set([id,parent].sort().join("|"),dist);}
  return {routes,segments,targets:targets.map(([id])=>id)};
}
