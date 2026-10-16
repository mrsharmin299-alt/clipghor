(() => {
const $ = id => document.getElementById(id);
const video = $('video'), audio = $('audio');
let videoUrl = null, audioUrl = null, trimStart = 0, trimEnd = 0;
function say(message){ $('status').textContent = message; }
function fmt(n){return Number.isFinite(n) ? n.toFixed(1)+' সেকেন্ড' : '—';}
function updateText(){
  const t=$('textInput').value;
  $('overlay').textContent=t;
  $('overlay').style.fontSize=$('textSize').value+'px';
  const pos=$('textPosition').value;
  $('overlay').style.top=pos==='top'?'8%':pos==='middle'?'45%':'';
  $('overlay').style.bottom=pos==='bottom'?'12%':'';
  $('textClip').textContent=t.trim() || 'বাংলা টেক্সট এখানে দেখাবে';
}
function updateTimeline(){
  $('videoClip').textContent=video.src ? `ভিডিও • ${fmt(video.duration)} • কাট: ${fmt(trimStart)}–${fmt(trimEnd || video.duration)}` : 'ভিডিও ক্লিপ এখানে দেখাবে';
}
$('pickVideo').onclick=()=>$('videoFile').click();
$('pickAudio').onclick=()=>$('audioFile').click();
$('pickText').onclick=()=>$('textInput').focus();
$('videoFile').addEventListener('change', e=>{
 const file=e.target.files && e.target.files[0]; if(!file)return;
 if(videoUrl)URL.revokeObjectURL(videoUrl);
 videoUrl=URL.createObjectURL(file); video.src=videoUrl; video.load();
 $('placeholder').hidden=true; trimStart=0; trimEnd=0;
 $('durationInfo').textContent=file.name;
 $('videoClip').textContent=file.name; say('ভিডিও যোগ হয়েছে।');
});
video.addEventListener('loadedmetadata',()=>{
 $('durationInfo').textContent=`দৈর্ঘ্য: ${fmt(video.duration)}`;
 $('trimStart').value=0; $('trimEnd').value=Number.isFinite(video.duration)?video.duration.toFixed(1):0;
 trimStart=0;trimEnd=video.duration;updateTimeline();
});
video.addEventListener('timeupdate',()=>{
 if(trimEnd>trimStart && video.currentTime>=trimEnd && !video.paused){video.pause();}
});
$('play').onclick=async()=>{
 if(!video.src){say('আগে একটি ভিডিও যোগ করুন।');return;}
 if(video.currentTime < trimStart || video.currentTime >= trimEnd) video.currentTime=trimStart;
 try{await video.play();say('ভিডিও চলছে।');}catch(e){say('ভিডিও চালানো যায়নি। আবার চেষ্টা করুন।');}
};
$('pause').onclick=()=>video.pause();
$('restart').onclick=()=>{if(video.src){video.currentTime=trimStart;video.pause();}};
$('setStart').onclick=()=>{if(!video.src)return say('আগে ভিডিও যোগ করুন।');$('trimStart').value=video.currentTime;trimStart=video.currentTime;updateTimeline();say('শুরুর সময় সেট হয়েছে।');};
$('setEnd').onclick=()=>{if(!video.src)return say('আগে ভিডিও যোগ করুন।');$('trimEnd').value=video.currentTime;trimEnd=video.currentTime;updateTimeline();say('শেষের সময় সেট হয়েছে।');};
$('previewTrim').onclick=()=>{
 const s=Number($('trimStart').value), e=Number($('trimEnd').value);
 if(!video.src)return say('আগে ভিডিও যোগ করুন।');
 if(!Number.isFinite(s)||!Number.isFinite(e)||s<0||e<=s||e>video.duration)return say('শুরুর ও শেষের সময় ঠিকভাবে দিন।');
 trimStart=s;trimEnd=e;video.currentTime=s;updateTimeline();video.play().then(()=>say('কাটিং প্রিভিউ চলছে।')).catch(()=>say('প্লে চাপুন।'));
};
$('audioFile').addEventListener('change',e=>{
 const file=e.target.files && e.target.files[0];if(!file)return;
 if(audioUrl)URL.revokeObjectURL(audioUrl);
 audioUrl=URL.createObjectURL(file);audio.src=audioUrl;audio.style.display='block';audio.load();
 $('audioName').textContent=file.name;$('audioClip').textContent=file.name;say('অডিও যোগ হয়েছে।');
});
$('textInput').addEventListener('input',updateText);
$('textSize').addEventListener('input',updateText);
$('textPosition').addEventListener('change',updateText);
function getDraft(){return {text:$('textInput').value,textSize:$('textSize').value,textPosition:$('textPosition').value,trimStart:$('trimStart').value,trimEnd:$('trimEnd').value};}
$('saveDraft').onclick=()=>{try{localStorage.setItem('clipghor-draft',JSON.stringify(getDraft()));say('ড্রাফটের সেটিংস সেভ হয়েছে।');}catch(e){say('ড্রাফট সেভ করা যায়নি।');}};
$('loadDraft').onclick=()=>{try{const d=JSON.parse(localStorage.getItem('clipghor-draft')||'null');if(!d)return say('কোনো ড্রাফট পাওয়া যায়নি।');$('textInput').value=d.text||'';$('textSize').value=d.textSize||25;$('textPosition').value=d.textPosition||'bottom';$('trimStart').value=d.trimStart||0;$('trimEnd').value=d.trimEnd||0;trimStart=Number($('trimStart').value);trimEnd=Number($('trimEnd').value);updateText();updateTimeline();say('ড্রাফটের সেটিংস খোলা হয়েছে। ভিডিও ও অডিও আবার নির্বাচন করুন।');}catch(e){say('ড্রাফট পড়া যায়নি।');}};
$('exportNote').onclick=()=>say('MP4 এক্সপোর্ট ইঞ্জিন পরবর্তী ধাপে যুক্ত হবে। এখনো চূড়ান্ত ভিডিও ফাইল তৈরি করা হচ্ছে না।');
$('newProject').onclick=()=>{if(confirm('নতুন প্রজেক্ট শুরু করবেন? বর্তমান প্রিভিউ মুছে যাবে।')){video.pause();video.removeAttribute('src');video.load();audio.pause();audio.removeAttribute('src');audio.load();$('audio').style.display='none';$('placeholder').hidden=false;$('videoFile').value='';$('audioFile').value='';$('textInput').value='';trimStart=0;trimEnd=0;updateText();updateTimeline();say('নতুন প্রজেক্ট শুরু হয়েছে।');}};
updateText();updateTimeline();
})();