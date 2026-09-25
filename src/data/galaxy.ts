/** Editorial map: positions and connections are storytelling, not measured relationships. */
export type GalaxyNode = {
  id: string; label: string; kicker: string; story: string; evidence: string;
  href: string; x: number; y: number; color: string; cluster: string;
};
export const galaxyNodes: GalaxyNode[] = [
  {id:'intellirag',label:'IntelliRAG',kicker:'EVIDENCE / RAG',story:'An answer should show the passages behind it, and make failure visible when the evidence is thin.',evidence:'RAG platform with async pipelines, chunking strategies, RAGAS evaluation and workers.',href:'https://github.com/charan-rathore/IntelliRAG',x:24,y:30,color:'#48dffa',cluster:'Trust'},
  {id:'memorable',label:'memoRABLE',kicker:'MEMORY / SOURCE',story:'Keep the original lines near the output so context survives the move from document to publication.',evidence:'Source-linked document memory, local-first with optional AI.',href:'https://github.com/charan-rathore/memoRABLE',x:39,y:21,color:'#b968ff',cluster:'Trust'},
  {id:'thermosense',label:'ThermoSense',kicker:'SIGNAL / GROUND TRUTH',story:'A forecast improves when it meets rooftop measurements, bias checks and an inspectable leaderboard.',evidence:'Hyperlocal temperature forecasting and model/API bias tracking.',href:'https://github.com/charan-rathore/Time-Series-Temperature-Modelling',x:79,y:27,color:'#ffd166',cluster:'Measure'},
  {id:'systris',label:'Systris',kicker:'INTERFACE / SYSTEMS',story:'Make a body of work explorable: follow a question to the decisions and evidence that shaped a project.',evidence:'This Tetris portfolio is built in Next.js and exposes project/source links.',href:'https://github.com/charan-rathore/charan-tetris-portfolio',x:51,y:52,color:'#4ae3fa',cluster:'Build'},
  {id:'evals',label:'Evaluation',kicker:'TEST THE ANSWER',story:'Document tradeoffs and failure cases before calling a system reliable.',evidence:'IntelliRAG includes an eval directory and RAGAS evaluation; the portfolio links a scientific extraction study.',href:'https://github.com/charan-rathore/IntelliRAG/tree/main/eval',x:33,y:48,color:'#b968ff',cluster:'Trust'},
  {id:'research',label:'Research',kicker:'MEASURE THE CLAIM',story:'Compare prompting strategies against the same extraction task rather than trusting a polished demo.',evidence:'Zeolite synthesis event extraction study, arXiv 2512.15312.',href:'https://arxiv.org/abs/2512.15312',x:18,y:68,color:'#b968ff',cluster:'Trust'},
  {id:'magpie',label:'magpie',kicker:'OPEN SOURCE / ROUTING',story:'Work on the edges where model choice, accounts and actual software behavior meet.',evidence:'Public fork of an agent model gateway; inspect contributions through GitHub.',href:'https://github.com/charan-rathore/magpie',x:72,y:53,color:'#ffd166',cluster:'Build'},
  {id:'copilotkit',label:'CopilotKit',kicker:'OPEN SOURCE / UI',story:'Agent interfaces need state that survives updates without hiding what happened.',evidence:'Public CopilotKit fork and contribution history.',href:'https://github.com/charan-rathore/CopilotKit',x:84,y:70,color:'#ffd166',cluster:'Build'},
  {id:'openmuse',label:'openmuse',kicker:'OPEN SOURCE / AGENTS',story:'Explore agent work that continues through tools, browser state and the user interface.',evidence:'Public openmuse fork.',href:'https://github.com/charan-rathore/openmuse',x:69,y:81,color:'#ffd166',cluster:'Build'},
  {id:'vllm',label:'vLLM',kicker:'OPEN SOURCE / INFERENCE',story:'Understand the serving layer behind fast model experiences.',evidence:'Public fork of vLLM.',href:'https://github.com/charan-rathore/vllm',x:57,y:15,color:'#74edaa',cluster:'Infrastructure'},
  {id:'llama',label:'llama.cpp',kicker:'OPEN SOURCE / INFERENCE',story:'Follow the practical constraints of local model inference, not only the model output.',evidence:'Public llama.cpp fork.',href:'https://github.com/charan-rathore/llama.cpp',x:88,y:43,color:'#74edaa',cluster:'Infrastructure'},
  {id:'miq',label:'MiQ',kicker:'ANALYTICS / MENA',story:'Connect signals to a decision in the market context where they matter.',evidence:'Current analyst role in MENA markets, as listed in the portfolio résumé.',href:'https://drive.google.com/file/d/1vjBP8P8sgW30tyGk3gxGDrOI_ZUInl6u/view?usp=drive_link',x:18,y:16,color:'#ff9f7c',cluster:'Work'},
  {id:'flipkart',label:'Flipkart',kicker:'PRODUCT / ANALYTICS',story:'Seller-funnel behavior became pipelines and dashboards for product decisions.',evidence:'Product Analyst Intern role listed in the portfolio résumé.',href:'https://drive.google.com/file/d/1vjBP8P8sgW30tyGk3gxGDrOI_ZUInl6u/view?usp=drive_link',x:17,y:85,color:'#ff9f7c',cluster:'Work'},
];
export const galaxyEdges: [string,string][] = [
  ['systris','intellirag'],['systris','memorable'],['systris','thermosense'],['systris','magpie'],['systris','miq'],
  ['intellirag','evals'],['intellirag','memorable'],['evals','research'],['memorable','research'],
  ['thermosense','miq'],['miq','flipkart'],['magpie','vllm'],['magpie','llama'],['magpie','copilotkit'],
  ['copilotkit','openmuse'],['vllm','llama'],['flipkart','thermosense']
];
