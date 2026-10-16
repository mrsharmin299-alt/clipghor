const $=id=>document.getElementById(id);
let currentVideoURL=null;
function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));$(id).classList.add('active');window.scrollTo(0,0)}
function openTool(name){
 if(name==='3D Studio'){showPage('editor');$('status').textContent='3D Studio: ভিডিও বেছে নিয়ে 3D জুম, ঘোরানো বা ভাসমান প্রিভিউ চেষ্টা করুন।';return}
 if(name==='AutoCut'||name==='Retouch'||name==='AI generator'||name==='Photo tools'||name==='Shoot and record'||name==='Auto enhance'||name==='Cover maker'||name==='Auto captions'||name==='Remove background'||name==='Space'||name==='Marketing tools'||name==='AI photo editor'){alert(name+' ফিচারটি পরবর্তী সংস্করণে যোগ করা হবে।');return}
}
$('videoInput').addEventListener('change',()=>{
 const files=Array.from($('videoInput').files||[]);if(!files.length)return;
 $('recent').innerHTML='';
 files.forEach(file=>{
  const item=document.createElement('button');item.className='recent-item';
  const v=document.createElement('video');v.src=URL.createObjectURL(file);v.muted=true;v.playsInline=true;
  const label=document.createElement('span');label.className='recent-label';label.textContent=file.name;
  item.append(v,label);item.onclick=()=>loadVideo(file);$('recent').append(item);
 });
 loadVideo(files[0]);
});
function loadVideo(file){
 const v=$('realVideo');if(currentVideoURL)URL.revokeObjectURL(currentVideoURL);
 currentVideoURL=URL.createObjectURL(file);v.src=currentVideoURL;v.hidden=false;
 document.querySelectorAll('.mock-person,.mock-head,.mock-hair').forEach(e=>e.style.display='none');
 $('clipName').textContent=file.name;$('status').textContent='ভিডিও লোড হয়েছে। প্রিভিউ চালাতে প্লে বাটনে চাপ দিন।';showPage('editor');
}
function playPause(){const v=$('realVideo');if(!v.src){alert('আগে New video চাপ দিয়ে ভিডিও বেছে নিন।');return}if(v.paused)v.play().catch(()=>{});else v.pause()}
function resetEffects(){const p=$('preview');p.style.transform='none';p.style.filter='none';$('realVideo').playbackRate=1;$('status').textContent='ইফেক্ট রিসেট হয়েছে।'}
function apply3D(type){
 const p=$('preview');p.style.transition='transform .35s';
 const transforms={zoom:'perspective(800px) scale(1.07) rotateY(-5deg)',tilt:'perspective(800px) rotateX(7deg) rotateY(-8deg)',float:'perspective(800px) translateY(-5px) rotateY(4deg) rotateX(3deg)'};
 p.style.transform=transforms[type]||'none';
 $('status').textContent='3D '+type+' প্রিভিউ চালু। এটি বর্তমানে প্রিভিউ ইফেক্ট, এক্সপোর্ট করা ভিডিওতে এখনও রেন্ডার হয় না।';
}
function applyFilter(type){$('preview').style.filter=type==='gray'?'grayscale(1)':type==='warm'?'sepia(.25) saturate(1.2)':'none';$('status').textContent='প্রিভিউ ফিল্টার প্রয়োগ হয়েছে। এক্সপোর্ট রেন্ডারিং এখনও যুক্ত নয়।'}
function addCaption(){const t=prompt('ভিডিওর ওপর বাংলা লেখা লিখুন','আমার নতুন ভিডিও');if(t!==null)$('caption').textContent=t}
function setSpeed(rate){const v=$('realVideo');if(!v.src){alert('আগে একটি ভিডিও বেছে নিন।');return}v.playbackRate=rate;$('status').textContent='প্লেব্যাক গতি: '+rate+'x। এটি প্রিভিউ গতির জন্য।'}
$('audioInput').addEventListener('change',()=>{const f=$('audioInput').files[0];if(!f)return;$('audioPlayer').src=URL.createObjectURL(f);$('audioPlayer').hidden=false;$('status').textContent='অডিও ফাইল বেছে নেওয়া হয়েছে; ভিডিওর সঙ্গে মিক্স/এক্সপোর্ট এখনও যুক্ত নয়।'});
function exportNotice(){alert('MP4 এক্সপোর্ট ইঞ্জিন এখনও যুক্ত করা হয়নি। এখন প্রিভিউ ও UI পরীক্ষা করা যায়।')}
function searchTools(){const q=prompt('কোন টুল খুঁজছেন?');if(!q)return;const list=[...document.querySelectorAll('.tool')];const found=list.find(x=>x.innerText.toLowerCase().includes(q.toLowerCase()));if(found)found.scrollIntoView({behavior:'smooth',block:'center'});else alert('টুল পাওয়া যায়নি।')}
function navTab(btn,name){document.querySelectorAll('.nav').forEach(n=>n.classList.remove('active'));btn.classList.add('active');if(name!=='Edit'){alert(name+' স্ক্রিন পরবর্তী ধাপে তৈরি করা হবে।');document.querySelectorAll('.nav').forEach(n=>n.classList.remove('active'));document.querySelector('.nav').classList.add('active')}}
