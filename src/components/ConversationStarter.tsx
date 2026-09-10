"use client";

export function ConversationStarter({ compact = false }: { compact?: boolean }) {
  const prompts = [
    {piece:"▟",title:"Build something useful",message:"Hi Charan, I have a product idea I'd love to explore with you. The problem is…"},
    {piece:"▙",title:"Talk data & decisions",message:"Hi Charan, I'd like to discuss an analytics challenge. The decision we're trying to make is…"},
    {piece:"▜",title:"Explore an opportunity",message:"Hi Charan, I'd love to connect about an opportunity. A little context about the team and role…"},
  ];
  function choose(message:string) {window.dispatchEvent(new CustomEvent('contact-prompt',{detail:message}));document.getElementById('contact')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  return <aside className={`conversation-starter ${compact?'is-compact':''}`}>
    <span className="pixel-label accent-yellow">YOUR IDEA · NEXT IN QUEUE</span>
    <h3>The next piece could be yours.</h3>
    <p>Pick a starting point. I&apos;ll bring curiosity, context and a builder&apos;s perspective.</p>
    <div>{prompts.map(item=><button key={item.title} onClick={()=>choose(item.message)}><b aria-hidden="true">{item.piece}</b><span>{item.title}</span><i aria-hidden="true">↗</i></button>)}</div>
    {!compact&&<p className="conversation-note">A few lines are enough: the problem, who it affects, and what you have in mind.</p>}
  </aside>;
}
