import { galaxyNodes } from "./galaxy";

/** Each project is an independent tree. Editorial summaries come from the existing portfolio project records. */
const projectTree = (project: (typeof galaxyNodes)[number]) => ({
  project: project.id,
  nodes: [
    {id:project.id,label:project.label,kind:"project",detail:project.evidence,source:project.href},
    {id:`${project.id}:idea`,label:"The idea",kind:"idea",detail:project.story,source:project.href},
    {id:`${project.id}:work`,label:"The work",kind:"work",detail:project.evidence,source:project.href},
    {id:`${project.id}:decision`,label:"The choice",kind:"decision",detail:project.story,source:project.href},
    {id:`${project.id}:source`,label:"See the source",kind:"source",detail:`Inspect ${project.label} at the linked source. A public fork alone does not prove upstream contributions.`,source:project.href},
  ],
  edges:[
    {from:project.id,to:`${project.id}:idea`,relation:"starts with",weight:1},
    {from:project.id,to:`${project.id}:work`,relation:"was built or practiced as",weight:1.2},
    {from:`${project.id}:idea`,to:`${project.id}:decision`,relation:"leads to",weight:1},
    {from:`${project.id}:work`,to:`${project.id}:source`,relation:"can be inspected at",weight:1},
  ]
});
export const projectTrees = Object.fromEntries(galaxyNodes.map(n=>[n.id,projectTree(n)]));
export const knowledgeGraph = {
  title:"Charan Rathore's project trees",
  note:"Each tree describes one project independently. Other projects remain background stars. Summaries are curated from the portfolio and linked sources; a public fork alone does not prove upstream contributions.",
  projects:projectTrees
};

/** Dijkstra on one project tree, not across projects. Each branch lights when its shortest distance is reached. */
export function traceFrom(projectId:string){
  const tree=projectTrees[projectId];if(!tree)return {nodes:new Map<string,number>(),edges:new Map<string,number>()};
  const distances=new Map<string,number>([[projectId,0]]),visited=new Set<string>();
  while(visited.size<tree.nodes.length){
    const next=[...distances].filter(([id])=>!visited.has(id)).sort((a,b)=>a[1]-b[1])[0];if(!next)break;
    const [id,dist]=next;visited.add(id);
    for(const edge of tree.edges){if(edge.from!==id||visited.has(edge.to))continue;distances.set(edge.to,Math.min(distances.get(edge.to)??Infinity,dist+edge.weight));}
  }
  return {nodes:distances,edges:new Map(tree.edges.map(e=>[`${e.from}|${e.to}`,distances.get(e.to)??0]))};
}
