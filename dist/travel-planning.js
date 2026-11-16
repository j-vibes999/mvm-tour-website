export function moveSavedPlace(refs,ref,toIndex) {
  const next=[...refs],from=next.indexOf(ref);
  if(from<0||!Number.isInteger(toIndex))return next;
  const to=Math.max(0,Math.min(next.length-1,toIndex));
  if(from===to)return next;
  next.splice(from,1);next.splice(to,0,ref);
  return next;
}

export function mapRouteBatches(refs) {
  if(!refs.length)return [];
  const batches=[];
  for(let start=0;start<refs.length;start+=4){
    const batch=refs.slice(start,start+5);
    if(start&&batch.length===1)break;
    batches.push(batch);
  }
  return batches;
}
