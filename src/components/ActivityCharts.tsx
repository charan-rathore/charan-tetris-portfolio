type Day = { date: string; count: number };

export function ActivityCharts({ days }: { days: Day[] }) {
  const weekday = ['SUN','MON','TUE','WED','THU','FRI','SAT'].map((name,i)=>({name,total:days.filter(d=>new Date(d.date+'T12:00:00Z').getUTCDay()===i).reduce((s,d)=>s+d.count,0)}));
  const totals=days.map((d,i)=>({...d,total:days.slice(0,i+1).reduce((sum,day)=>sum+day.count,0)}));
  const running=totals.at(-1)?.total ?? 0;
  const peak=Math.max(1,running),maxWeekday=Math.max(1,...weekday.map(d=>d.total));
  return <div className="activity-extras">
    <figure className="activity-momentum"><figcaption><span className="pixel-label accent-cyan">MOMENTUM · THE CLIMB</span><p>Cumulative contributions across this 30-day window.</p></figcaption>
      <svg viewBox="0 0 500 150" role="img" aria-label={`${running} contributions accumulated over ${days.length} days`}>
        {[25,55,85,115].map(y=><path key={y} d={`M12 ${y}H488`} stroke="#25344a" strokeDasharray="4 7"/>)}
        <path d={totals.map((d,i)=>`${i===0?'M':'H'}${12+i*476/Math.max(1,totals.length-1)}${i===0?' ': 'V'}${125-d.total/peak*104}`).join(' ')} fill="none" stroke="#b968ff" strokeWidth="2"/>
        {totals.map((d,i)=><rect key={d.date} x={8+i*476/Math.max(1,totals.length-1)} y={121-d.total/peak*104} width="8" height="8" fill="#00e0ff"><title>{`${d.date}: ${d.total} accumulated contributions`}</title></rect>)}
      </svg><div className="activity-axis"><span>{days[0]?.date}</span><b>{running} PLACED</b><span>{days.at(-1)?.date}</span></div>
    </figure>
    <figure className="activity-cadence"><figcaption><span className="pixel-label accent-yellow">BUILD RHYTHM · WEEKDAYS</span><p>Where contributions land, grouped by UTC weekday.</p></figcaption>
      <div className="weekday-board">{weekday.map(day=><div key={day.name} title={`${day.name}: ${day.total} contributions`}><b>{day.total}</b><div className="weekday-stack" aria-hidden="true">{Array.from({length:6},(_,i)=><i key={i} className={i<Math.ceil(day.total/maxWeekday*6)?'is-on':''}/>)}</div><span>{day.name}</span></div>)}</div>
    </figure>
  </div>;
}
