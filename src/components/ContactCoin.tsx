"use client";
import { useState } from 'react';

export function ContactCoin() {
  const [inserted,setInserted]=useState(false);
  function insert(){setInserted(true);const input=document.querySelector<HTMLInputElement>('#contact input:not([type="hidden"]):not([tabindex="-1"])');input?.focus({preventScroll:true});input?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  return <button className={`contact-coin ${inserted?'is-inserted':''}`} type="button" onClick={insert} aria-label="Insert coin and start a message">
    <span className="coin-scene" aria-hidden="true"><span className="coin-object ambient-motion"><span className="coin-front">CR<span>1 GOOD IDEA</span></span><span className="coin-back">↗</span>{Array.from({length:8},(_,i)=><i key={i} className="coin-rim" style={{transform:`translateZ(${i-4}px)`}}/>)}</span></span>
    <span className="pixel-label">{inserted?'YOU’RE UP ↓':'INSERT COIN ↓'}</span>
  </button>;
}
