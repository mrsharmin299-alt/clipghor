"use strict";

/* ক্লিপঘর — ভিডিও এডিটরের মূল কোড */

const $ = (id) => document.getElementById(id);

const video = $("video");
const videoFile = $("videoFile");
const audioFile = $("audioFile");
const audio = $("audio");
const placeholder = $("placeholder");
const overlay = $("overlay");
const status = $("status");

let videoURL = "";
let audioURL = "";
let videoDuration = 0;

function showStatus(message) {
  if (status) status.textContent = message;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";
  const s = Math.max(0, Math.floor(seconds));
  return String(Math.floor(s / 60)).padStart(2, "0") +
    ":" + String(s % 60).padStart(2, "0");
}

function updateDuration() {
  const start = Number($("trimStart")?.value || 0);
  const end = Number($("trimEnd")?.value || videoDuration);

  if ($("durationInfo")) {
    $("durationInfo").textContent =
      `সময়: ${formatTime(video.currentTime || 0)} / ${formatTime(videoDuration)}`;
  }

  if ($("videoClip")) {
    $("videoClip").textContent =
      videoDuration ? `ভিডিও ${formatTime(start)}–${formatTime(end)}` :
      "ভিডিও যোগ করুন";
  }
}

/* ভিডিও নির্বাচন */
$("pickVideo")?.addEventListener("click", () => videoFile?.click());

videoFile?.addEventListener("change", () => {
  const file = videoFile.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("video/")) {
    showStatus("দয়া করে একটি ভিডিও ফাইল নির্বাচন করুন।");
    return;
  }

  if (videoURL) URL.revokeObjectURL(videoURL);
  videoURL = URL.createObjectURL(file);

  video.src = videoURL;
  video.load();

  if (placeholder) placeholder.style.display = "none";
  showStatus("ভিডিও লোড হচ্ছে...");
});

video?.addEventListener("loadedmetadata", () => {
  videoDuration = video.duration || 0;

  if ($("trimStart")) {
    $("trimStart").max = videoDuration;
    $("trimStart").value = 0;
  }

  if ($("trimEnd")) {
    $("trimEnd").max = videoDuration;
    $("trimEnd").value = videoDuration;
  }

  video.currentTime = 0;
  updateDuration();
  showStatus("ভিডিও প্রস্তুত! ▶ চালান চাপুন।");
});

video?.addEventListener("error", () => {
  showStatus("ভিডিও চালানো যায়নি। অন্য একটি ভিডিও দিয়ে চেষ্টা করুন।");
});

/* প্লে, পজ ও শুরু থেকে চালানো */
$("play")?.addEventListener("click", async () => {
  if (!video.src) {
    showStatus("আগে ভিডিও যোগ করুন।");
    return;
  }

  const start = Number($("trimStart")?.value || 0);
  const end = Number($("trimEnd")?.value || videoDuration);

  if (video.currentTime < start || video.currentTime >= end) {
    video.currentTime = start;
  }

  try {
    await video.play();
    showStatus("ভিডিও চলছে।");
  } catch {
    showStatus("ভিডিও চালু হয়নি। আবার চেষ্টা করুন।");
  }
});

$("pause")?.addEventListener("click", () => {
  video.pause();
  audio.pause();
  showStatus("ভিডিও থামানো হয়েছে।");
});

$("restart")?.addEventListener("click", () => {
  if (!video.src) {
    showStatus("আগে ভিডিও যোগ করুন।");
    return;
  }

  video.pause();
  video.currentTime = Number($("trimStart")?.value || 0);
  showStatus("ভিডিও শুরুর অবস্থানে গেছে।");
});

video?.addEventListener("timeupdate", () => {
  const end = Number($("trimEnd")?.value || videoDuration);

  if (videoDuration && video.currentTime >= end) {
    video.pause();
    video.currentTime = end;
  }

  updateDuration();
});

/* অডিও নির্বাচন */
$("pickAudio")?.addEventListener("click", () => audioFile?.click());

audioFile?.addEventListener("change", () => {
  const file = audioFile.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("audio/")) {
    showStatus("দয়া করে একটি অডিও ফাইল নির্বাচন করুন।");
    return;
  }

  if (audioURL) URL.revokeObjectURL(audioURL);
  audioURL = URL.createObjectURL(file);
  audio.src = audioURL;
  audio.load();

  if ($("audioName")) {
    $("audioName").textContent = `অডিও যোগ হয়েছে: ${file.name}`;
  }

  if ($("audioClip")) {
    $("audioClip").textContent = `অডিও: ${file.name}`;
  }

  showStatus("অডিও যোগ হয়েছে।");
});

/* ভিডিও ও অডিও একসঙ্গে চালানো */
video?.addEventListener("play", () => {
  if (audio.src) {
    audio.currentTime = video.currentTime;
    audio.play().catch(() => {});
  }
});

video?.addEventListener("pause", () => audio.pause());

video?.addEventListener("seeking", () => {
  if (audio.src) {
    try {
      audio.currentTime = video.currentTime;
    } catch {}
  }
});

/* বাংলা লেখা */
$("pickText")?.addEventListener("click", () => {
  $("textInput")?.focus();
  showStatus("বাংলা লেখা লিখুন।");
});

function updateText() {
  if (!overlay) return;

  const text = $("textInput")?.value || "";
  overlay.textContent = text;
  overlay.style.display = text ? "block" : "none";

  const size = Number($("textSize")?.value || 25);
  overlay.style.fontSize = `${size}px`;

  const position = $("textPosition")?.value || "bottom";
  overlay.style.top =
    position === "top" ? "8%" :
    position === "middle" ? "45%" : "auto";

  overlay.style.bottom = position === "bottom" ? "8%" : "auto";
}

$("textInput")?.addEventListener("input", updateText);
$("textSize")?.addEventListener("input", updateText);
$("textPosition")?.addEventListener("change", updateText);

/* কাটার শুরুর ও শেষের সময় */
$("trimStart")?.addEventListener("change", () => {
  const start = Number($("trimStart").value || 0);
  const end = Number($("trimEnd")?.value || videoDuration);

  if (start >= end) {
    $("trimStart").value = Math.max(0, end - 0.1);
  }

  video.currentTime = Number($("trimStart").value);
  updateDuration();
});

$("trimEnd")?.addEventListener("change", () => {
  const start = Number($("trimStart")?.value || 0);
  const end = Number($("trimEnd").value || videoDuration);

  if (end <= start) {
    $("trimEnd").value = Math.min(videoDuration, start + 0.1);
  }

  updateDuration();
});

$("setStart")?.addEventListener("click", () => {
  if (!video.src) return showStatus("আগে ভিডিও যোগ করুন।");

  $("trimStart").value = video.currentTime;
  updateDuration();
  showStatus("কাটার শুরুর সময় সেট হয়েছে।");
});

/* নতুন প্রজেক্ট */
function newProject() {
  video.pause();
  audio.pause();

  video.removeAttribute("src");
  video.load();
  audio.removeAttribute("src");
  audio.load();

  if (videoURL) URL.revokeObjectURL(videoURL);
  if (audioURL) URL.revokeObjectURL(audioURL);

  videoURL = "";
  audioURL = "";
  videoDuration = 0;

  if (videoFile) videoFile.value = "";
  if (audioFile) audioFile.value = "";
  if ($("textInput")) $("textInput").value = "";
  if ($("audioName")) $("audioName").textContent = "এখনো কোনো অডিও যোগ করা হয়নি";
  if (placeholder) placeholder.style.display = "";
  if (overlay) overlay.style.display = "none";

  updateDuration();
  showStatus("নতুন প্রজেক্ট তৈরি হয়েছে।");
}

/* প্রজেক্টের সেটিংস সংরক্ষণ */
function saveDraft() {
  const draft = {
    trimStart: $("trimStart")?.value || "0",
    trimEnd: $("trimEnd")?.value || "",
    text: $("textInput")?.value || "",
    textSize: $("textSize")?.value || "25",
    textPosition: $("textPosition")?.value || "bottom"
  };

  try {
    localStorage.setItem("clipghor-draft", JSON.stringify(draft));
    showStatus("প্রজেক্টের সেটিংস সংরক্ষণ হয়েছে।");
  } catch {
    showStatus("সেটিংস সংরক্ষণ করা যায়নি।");
  }
}

function loadDraft() {
  try {
    const raw = localStorage.getItem("clipghor-draft");
    if (!raw) return showStatus("কোনো সংরক্ষিত সেটিংস পাওয়া যায়নি।");

    const draft = JSON.parse(raw);

    if ($("trimStart")) $("trimStart").value = draft.trimStart ?? "0";
    if ($("trimEnd") && draft.trimEnd !== "") {
      $("trimEnd").value = draft.trimEnd;
    }
    if ($("textInput")) $("textInput").value = draft.text ?? "";
    if ($("textSize")) $("textSize").value = draft.textSize ?? "25";
    if ($("textPosition")) {
      $("textPosition").value = draft.textPosition ?? "bottom";
    }

    updateText();
    updateDuration();
    showStatus("সংরক্ষিত সেটিংস লোড হয়েছে।");
  } catch {
    showStatus("সেটিংস লোড করা যায়নি।");
  }
}

$("saveDraft")?.addEventListener("click", saveDraft);
$("loadDraft")?.addEventListener("click", loadDraft);

/* ফাইলের নাম ও সময় দেখানো */
updateText();
updateDuration();
showStatus("ক্লিপঘর প্রস্তুত। ভিডিও যোগ করুন।");
