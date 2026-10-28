import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ShoppingBasket, ChefHat, Coffee, Copy, Check, RotateCcw, Download, CircleDollarSign, Package, AlertTriangle, Minus, Plus, Settings2 } from 'lucide-react';
import './style.css';

const RECIPES = [
  {id:'margherita',name:'Pizza Margherita',icon:'🍕',group:'food',yield:1,ingredients:{Cheese:2,Tomato:5,Dough:1}},
  {id:'pepperoni',name:'Pizza Pepperoni',icon:'🍕',group:'food',yield:1,ingredients:{Cheese:1,Tomato:5,Meat:5,Dough:1}},
  {id:'spaghetti',name:'Spaghetti',icon:'🍝',group:'food',yield:4,ingredients:{Beef:3,Cheese:4,Tomato:6,Dough:1}},
  {id:'coffee',name:'Coffee',icon:'☕',group:'drink',yield:10,ingredients:{Bean:5,Cup:1,Milk:1}},
  {id:'coke',name:'Coke',icon:'🥤',group:'drink',yield:7,ingredients:{Sugar:1}},
  {id:'lemonade',name:'Lemonade',icon:'🍋',group:'drink',yield:7,ingredients:{Orange:15,Sugar:5,Cup:7}}
];
const INGREDIENTS = ['Cheese','Tomato','Dough','Meat','Beef','Bean','Cup','Milk','Sugar','Orange'];
const INIT_QTY = {margherita:20,pepperoni:57,spaghetti:64,coffee:50,coke:112,lemonade:21};
const defaultPrices = Object.fromEntries(RECIPES.map(r=>[r.id,100]));
const defaultCosts = Object.fromEntries(INGREDIENTS.map(i=>[i,5]));
const money = n => '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const num = v => Math.max(0,Math.floor(Number(v)||0));
const decimal = v => Math.max(0,Number(v)||0);
function stored(key, fallback){try{const s=localStorage.getItem(key);return s?{...fallback,...JSON.parse(s)}:fallback}catch{return fallback}}
function App(){
 const [qty,setQty]=useState(()=>stored('ald_qty',INIT_QTY));
 const [prices,setPrices]=useState(()=>stored('ald_prices',defaultPrices));
 const [costs,setCosts]=useState(()=>stored('ald_costs',defaultCosts));
 const [budget,setBudget]=useState(()=>{try{return Number(localStorage.getItem('ald_budget')??6000)}catch{return 6000}});
 const [mode,setMode]=useState('units');
 const [copied,setCopied]=useState(false);
 const [settings,setSettings]=useState(false);
 useEffect(()=>localStorage.setItem('ald_qty',JSON.stringify(qty)),[qty]);
 useEffect(()=>localStorage.setItem('ald_prices',JSON.stringify(prices)),[prices]);
 useEffect(()=>localStorage.setItem('ald_costs',JSON.stringify(costs)),[costs]);
 useEffect(()=>localStorage.setItem('ald_budget',String(budget)),[budget]);
 const plan=useMemo(()=>{
   const ingredients=Object.fromEntries(INGREDIENTS.map(i=>[i,0]));
   let food=0,drinks=0,revenue=0;
   const rows=RECIPES.map(r=>{
     const input=num(qty[r.id]);
     const crafts=mode==='units'?Math.ceil(input/r.yield):input;
     const actual=crafts*r.yield;
     const cost=Object.entries(r.ingredients).reduce((sum,[i,n])=>sum+n*decimal(costs[i])*crafts,0);
     for(const [i,n] of Object.entries(r.ingredients))ingredients[i]+=n*crafts;
     revenue+=actual*decimal(prices[r.id]);
     if(r.group==='food')food+=actual;else drinks+=actual;
     return {...r,requested:input,crafts,actual,cost,revenue:actual*decimal(prices[r.id])};
   });
   const shopping=INGREDIENTS.map(name=>({name,quantity:ingredients[name],unitCost:decimal(costs[name]),total:ingredients[name]*decimal(costs[name])}));
   const totalCost=shopping.reduce((s,i)=>s+i.total,0);
   return {rows,shopping,totalCost,revenue,profit:revenue-totalCost,food,drinks,count:food+drinks,rawItems:shopping.reduce((s,i)=>s+i.quantity,0)};
 },[qty,prices,costs,mode]);
 const copy=async()=>{
   const body=['AL DENTE — SHOPPING LIST',...plan.shopping.filter(x=>x.quantity).map(x=>`${x.name}: ${x.quantity} × ${money(x.unitCost)} = ${money(x.total)}`),'',`Ingredient cost: ${money(plan.totalCost)}`,`Expected revenue: ${money(plan.revenue)}`,`Gross profit: ${money(plan.profit)}`].join('\n');
   try{await navigator.clipboard.writeText(body);setCopied(true);setTimeout(()=>setCopied(false),1600)}catch{window.prompt('Copy your shopping list:',body)}
 };
 const exportCsv=()=>{
   const lines=[['Ingredient','Quantity','Unit cost','Total cost'],...plan.shopping.filter(x=>x.quantity).map(x=>[x.name,x.quantity,x.unitCost,x.total])];
   const blob=new Blob([lines.map(x=>x.join(',')).join('\n')],{type:'text/csv;charset=utf-8'});
   const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='al-dente-shopping-list.csv';a.click();URL.revokeObjectURL(url);
 };
 const reset=()=>{if(window.confirm('Reset quantities, prices and ingredient costs to defaults?')){setQty(INIT_QTY);setPrices(defaultPrices);setCosts(defaultCosts);setBudget(6000);setMode('units')}};
 return <div className="shell">
   <header className="topbar"><div className="brand"><div className="logo">AD<span>.</span></div><div><strong>AL DENTE</strong><small>RESTAURANT OPERATIONS</small></div></div><div className="top-actions"><button className="quiet" onClick={()=>setSettings(!settings)}><Settings2 size={17}/> Ingredient prices</button><button className="quiet" onClick={reset}><RotateCcw size={16}/> Reset</button></div></header>
   <div className="intro"><div><div className="eyebrow"><span className="dot"/> LIVE PRODUCTION CALCULATOR</div><h1>Plan your next <em>big batch.</em></h1><p>Choose what to make. We'll do the math, including batch rounding, ingredient costs and your expected profit.</p></div><div className="budget"><label htmlFor="budget">SHOPPING BUDGET</label><div><span>$</span><input id="budget" type="number" min="0" step="1" value={budget} onChange={e=>setBudget(decimal(e.target.value))}/></div><small>{plan.totalCost>budget?`${money(plan.totalCost-budget)} over budget`:`${money(budget-plan.totalCost)} remaining`}</small></div></div>
   <div className="metrics"><div className="metric"><span><ShoppingBasket size={17}/> Ingredient cost</span><strong>{money(plan.totalCost)}</strong><small>{plan.rawItems.toLocaleString()} ingredients to buy</small></div><div className="metric"><span><CircleDollarSign size={17}/> Expected revenue</span><strong>{money(plan.revenue)}</strong><small>Assumes every item sells</small></div><div className="metric highlight"><span><CircleDollarSign size={17}/> Gross profit</span><strong className={plan.profit<0?'negative':''}>{money(plan.profit)}</strong><small>{plan.revenue>0?`${(plan.profit/plan.revenue*100).toFixed(1)}% gross margin`:'Set product quantities to begin'}</small></div><div className="metric"><span><Package size={17}/> Finished products</span><strong>{plan.count.toLocaleString()}</strong><small>{plan.food} food · {plan.drinks} drinks</small></div></div>
   {plan.totalCost>budget&&<div className="warning"><AlertTriangle size={18}/> Your ingredient shopping list exceeds the budget by <b>{money(plan.totalCost-budget)}</b>.</div>}
   {settings&&<section className="panel settings"><div className="section-head"><div><h2>Ingredient unit prices</h2><p>Edit individual purchase prices (defaults to $5 each).</p></div></div><div className="cost-grid">{INGREDIENTS.map(i=><label key={i}>{i}<div className="price-input"><span>$</span><input type="number" min="0" step="0.01" value={costs[i]} onChange={e=>setCosts({...costs,[i]:decimal(e.target.value)})}/></div></label>)}</div></section>}
   <main className="main-grid"><section className="panel production"><div className="section-head"><div><h2>Production planner</h2><p>Set quantities and selling prices for your menu.</p></div><div className="toggle"><button className={mode==='units'?'selected':''} onClick={()=>{if(mode!=='units'){setQty(Object.fromEntries(RECIPES.map(r=>[r.id,num(qty[r.id])*r.yield])));setMode('units')}}}>Finished items</button><button className={mode==='crafts'?'selected':''} onClick={()=>{if(mode!=='crafts'){setQty(Object.fromEntries(RECIPES.map(r=>[r.id,Math.ceil(num(qty[r.id])/r.yield)])));setMode('crafts')}}}>Crafts</button></div></div>
   {['food','drink'].map(group=><div key={group} className="recipe-group"><div className="group-title">{group==='food'?<ChefHat size={16}/>:<Coffee size={16}/>} {group==='food'?'FOOD':'DRINKS'} <span>{group==='food'?plan.food:plan.drinks} items</span></div><div className="recipe-head"><span>PRODUCT</span><span>{mode==='units'?'TARGET QUANTITY':'CRAFT BATCHES'}</span><span>SELL PRICE / ITEM</span></div>{plan.rows.filter(r=>r.group===group).map(r=><div className="recipe-row" key={r.id}><div className="item-name"><span className="emoji">{r.icon}</span><div><b>{r.name}</b><small>{r.yield} item{r.yield>1?'s':''} per craft · {r.crafts} craft{r.crafts!==1?'s':''}</small></div></div><div className="stepper"><button aria-label={`Decrease ${r.name}`} onClick={()=>setQty({...qty,[r.id]:Math.max(0,num(qty[r.id])-1)})}><Minus size={14}/></button><input aria-label={`${r.name} quantity`} type="number" min="0" step="1" value={qty[r.id]} onChange={e=>setQty({...qty,[r.id]:num(e.target.value)})}/><button aria-label={`Increase ${r.name}`} onClick={()=>setQty({...qty,[r.id]:num(qty[r.id])+1})}><Plus size={14}/></button></div><div className="price-input"><span>$</span><input aria-label={`${r.name} selling price`} type="number" min="0" step="0.01" value={prices[r.id]} onChange={e=>setPrices({...prices,[r.id]:decimal(e.target.value)})}/></div>{mode==='units'&&r.actual!==r.requested&&<div className="rounded-note">Crafting yields {r.actual} items (rounded up)</div>}</div>)}</div>)}
   </section><aside className="panel shopping"><div className="section-head"><div><h2>Shopping list</h2><p>Everything you need to purchase.</p></div><span className="pill">AUTO-CALCULATED</span></div><div className="table-scroll"><table><thead><tr><th>INGREDIENT</th><th>QTY</th><th>COST</th></tr></thead><tbody>{plan.shopping.map(i=><tr key={i.name} className={!i.quantity?'muted':''}><td>{i.name}</td><td>{i.quantity.toLocaleString()}</td><td>{money(i.total)}</td></tr>)}</tbody><tfoot><tr><td>TOTAL</td><td>{plan.rawItems.toLocaleString()}</td><td>{money(plan.totalCost)}</td></tr></tfoot></table></div><div className="shop-actions"><button className="primary" onClick={copy}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?'Copied!':'Copy shopping list'}</button><button className="secondary" onClick={exportCsv}><Download size={16}/> CSV</button></div><p className="footnote">All calculations update instantly. Shopping quantities are whole ingredients; crafts are rounded up to cover your target.</p></aside></main>
   <footer>AL DENTE · Los Santos <span>Numbers, unlike customers, do not complain.</span></footer>
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
