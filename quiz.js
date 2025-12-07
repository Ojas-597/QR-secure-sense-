document.getElementById('quizForm').addEventListener('submit', async(e)=>{
 e.preventDefault();
 const answers=[
  document.querySelector('[name=q1]:checked')?.value,
  document.querySelector('[name=q2]:checked')?.value,
  document.querySelector('[name=q3]:checked')?.value
 ];
 const r=await fetch('/api/quiz/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answers})});
 const res=await r.json();
 location='/result.html?score='+res.score;
});