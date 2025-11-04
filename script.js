// 📄 File: script.js
// ------------------------------------------------------
// Script หลักสำหรับควบคุมสไลด์
// ------------------------------------------------------

// ⚙️ การตั้งค่า
const SLIDE_DURATION = 5000; // เวลาเปลี่ยนสไลด์ (มิลลิวินาที)

let currentSlide = 0;
let isAutoPlay = true;
let autoPlayInterval;
let displayCandidates = [];

// อ่าน URL parameter
const urlParams = new URLSearchParams(window.location.search);
const lineParam = urlParams.get("line");

// กรองผู้สมัครตามสายที่เลือก
function initializeCandidates() {
  let filteredCandidates = candidates;
  if (lineParam === "1") {
    filteredCandidates = candidates.filter((c) => c.line === "สายวิชาการ");
  } else if (lineParam === "2") {
    filteredCandidates = candidates.filter((c) => c.line === "สายสนับสนุน");
  }
  return filteredCandidates;
}

// สร้าง HTML สำหรับรูปภาพ
function createImageElement(candidate) {
  return `
        <img src="${candidate.image}" 
             alt="${candidate.name}" 
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="candidate-placeholder" style="display: none;">
            ${candidate.fallbackIcon}
        </div>
    `;
}

// สร้าง HTML สำหรับ Type Banner
function getTypeBanner(line) {
  if (line === "สายวิชาการ") {
    return `
            <div class="candidate-type-banner line-academic">
                <div class="type-title">สายวิชาการ</div>
                <div class="type-subtitle">เลือกได้ <span class="highlight">4</span> หมายเลข</div>
            </div>
        `;
  } else {
    return `
            <div class="candidate-type-banner line-support">
                <div class="type-title">สายสนับสนุน</div>
                <div class="type-subtitle">เลือกได้ <span class="highlight">3</span> คน</div>
            </div>
        `;
  }
}

// สร้างสไลด์
function generateSlides() {
  const slider = document.getElementById("heroSlider");
  displayCandidates = initializeCandidates();

  displayCandidates.forEach((candidate, index) => {
    // ใช้สีตามสายของผู้สมัคร
    let colors;
    if (candidate.line === "สายวิชาการ") {
      // สีเหลือง
      colors = { from: "255, 235, 59", to: "255, 193, 7" };
    } else if (candidate.line === "สายสนับสนุน") {
      // สีชมพู
      colors = { from: "255, 182, 193", to: "255, 105, 180" };
    } else {
      // สีเริ่มต้น (กรณีที่ไม่ตรงเงื่อนไข)
      const colorIndex = candidate.number - 1;
      colors = candidateColors[colorIndex] || candidateColors[0];
    } // สร้าง slide
    const slide = document.createElement("div");
    slide.className = `hero-slide ${index === 0 ? "active" : ""}`;
    slide.style.cssText = `
            --gradient-from-rgb: ${colors.from}; 
            --gradient-to-rgb: ${colors.to}; 
            background-image: url('${candidate.image}');
        `;

    // คำนวณหน้า PDF
    let pdfPage;
    if (candidate.line === "สายวิชาการ") {
      pdfPage = 13 + (candidate.number - 1);
    } else if (candidate.line === "สายสนับสนุน") {
      pdfPage = 22 + (candidate.number - 1);
    } else {
      pdfPage = 13;
    }

    slide.innerHTML = `
            <div class="candidate-info">
                <!-- Left: Photo Section -->
                <div class="candidate-left">
                    ${getTypeBanner(candidate.line)}
                    
                    <div class="candidate-photo">
                        ${createImageElement(candidate)}
                    </div>
                    
                    <div class="candidate-number-badge">
                        <div class="number">${candidate.number}</div>
                        <div class="label">หมายเลข</div>
                    </div>
                </div>
                
                <!-- Right: Info Section -->
                <div class="candidate-right">
                    <!-- Header -->
                    <div class="info-header">
                        <div class="name">${candidate.name}</div>
                        <div class="affiliation">${candidate.affiliation}</div>
                    </div>
                    
                    <!-- Info Cards -->
                    <div class="info-cards">
                        <!-- วุฒิการศึกษา -->
                        <div class="info-card education">
                            <div class="card-header">
                                <div class="card-icon">
                                    <i class="fas fa-graduation-cap"></i>
                                </div>
                                <div class="card-title">วุฒิการศึกษา</div>
                            </div>
                            <div class="card-content">
                                ${candidate.education
                                  .map((edu) => `• ${edu}`)
                                  .join("<br>")}
                            </div>
                        </div>
                        
                        <!-- ประสบการณ์ -->
                        <div class="info-card experience">
                            <div class="card-header">
                                <div class="card-icon">
                                    <i class="fas fa-briefcase"></i>
                                </div>
                                <div class="card-title">ประสบการณ์</div>
                            </div>
                            <div class="card-content">
                                ${candidate.experience
                                  .slice(0, 3)
                                  .map((exp) => `• ${exp}`)
                                  .join("<br>")}
                            </div>
                        </div>
                        
                        <!-- แนวคิด -->
                        <div class="info-card concept">
                            <div class="card-header">
                                <div class="card-icon">
                                    <i class="fas fa-lightbulb"></i>
                                </div>
                                <div class="card-title">แนวคิดในการทำงาน</div>
                            </div>
                            <div class="card-content">
                                ${
                                  Array.isArray(candidate.concept)
                                    ? candidate.concept
                                        .map((c) => `• ${c}`)
                                        .join("<br>")
                                    : candidate.concept
                                }
                            </div>
                        </div>
                    </div>
                    
                    <!-- PDF Link -->
                    <div style="text-align: center; margin-top: 1rem;">
                        <a href="https://apps4.coop.ku.ac.th/candidate/electNews68.pdf#page=${pdfPage}" 
                           target="_blank" 
                           style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; border-radius: 15px; font-size: 1.1rem; font-weight: 600; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); transition: all 0.3s ease;">
                            <i class="fas fa-file-pdf"></i>
                            ดูรายละเอียดเพิ่มเติม
                        </a>
                    </div>
                </div>
            </div>
        `;

    slider.appendChild(slide);
  });

  updateIndicator();
}

// แสดงสไลด์
function showSlide(index) {
  const slides = document.querySelectorAll(".hero-slide");
  const totalSlides = slides.length;

  if (index >= totalSlides) currentSlide = 0;
  else if (index < 0) currentSlide = totalSlides - 1;
  else currentSlide = index;

  slides.forEach((slide, i) => {
    if (i === currentSlide) {
      slide.classList.add("active");
    } else {
      slide.classList.remove("active");
    }
  });

  updateIndicator();
}

// อัพเดท indicator
function updateIndicator() {
  const indicator = document.getElementById("slideIndicator");
  indicator.textContent = `${currentSlide + 1} / ${displayCandidates.length}`;
}

// สไลด์ถัดไป
function nextSlide() {
  showSlide(currentSlide + 1);
}

// สไลด์ก่อนหน้า
function prevSlide() {
  showSlide(currentSlide - 1);
}

// เริ่ม autoplay
function startAutoPlay() {
  stopAutoPlay();
  autoPlayInterval = setInterval(nextSlide, SLIDE_DURATION);
}

// หยุด autoplay
function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
  }
}

// สลับ pause/play
function toggleAutoPlay() {
  const pauseBtn = document.getElementById("pauseBtn");
  const icon = pauseBtn.querySelector("i");

  if (isAutoPlay) {
    stopAutoPlay();
    isAutoPlay = false;
    icon.classList.remove("fa-pause");
    icon.classList.add("fa-play");
  } else {
    startAutoPlay();
    isAutoPlay = true;
    icon.classList.remove("fa-play");
    icon.classList.add("fa-pause");
  }
}

// ตรวจสอบว่าเป็น desktop mode หรือไม่
function isDesktopMode() {
  return (
    window.innerWidth >= 1024 &&
    window.matchMedia("(orientation: landscape)").matches
  );
}

// เริ่มต้นเมื่อโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", function () {
  // สร้างสไลด์
  generateSlides();

  // แสดงสไลด์แรก
  showSlide(0);

  // เริ่ม autoplay
  if (isDesktopMode()) {
    startAutoPlay();
  }

  // ปุ่ม Previous
  document.getElementById("prevBtn").addEventListener("click", function () {
    prevSlide();
    if (isAutoPlay && isDesktopMode()) {
      stopAutoPlay();
      startAutoPlay();
    }
  });

  // ปุ่ม Next
  document.getElementById("nextBtn").addEventListener("click", function () {
    nextSlide();
    if (isAutoPlay && isDesktopMode()) {
      stopAutoPlay();
      startAutoPlay();
    }
  });

  // ปุ่ม Pause/Play
  document.getElementById("pauseBtn").addEventListener("click", toggleAutoPlay);

  // Keyboard controls
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      prevSlide();
      if (isAutoPlay && isDesktopMode()) {
        stopAutoPlay();
        startAutoPlay();
      }
    } else if (e.key === "ArrowRight") {
      nextSlide();
      if (isAutoPlay && isDesktopMode()) {
        stopAutoPlay();
        startAutoPlay();
      }
    } else if (e.key === " ") {
      e.preventDefault();
      toggleAutoPlay();
    }
  });

  // Pause on hover (desktop only)
  if (isDesktopMode()) {
    const slider = document.querySelector(".hero-slider");
    slider.addEventListener("mouseenter", function () {
      if (isAutoPlay) stopAutoPlay();
    });
    slider.addEventListener("mouseleave", function () {
      if (isAutoPlay) startAutoPlay();
    });
  }

  // Touch/swipe support
  let startX = 0;
  let startY = 0;

  const slider = document.querySelector(".hero-slider");

  slider.addEventListener("touchstart", function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });

  slider.addEventListener("touchend", function (e) {
    if (!startX || !startY) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = startX - endX;
    const diffY = startY - endY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }

      if (isAutoPlay && isDesktopMode()) {
        stopAutoPlay();
        startAutoPlay();
      }
    }

    startX = 0;
    startY = 0;
  });

  // Handle window resize
  window.addEventListener("resize", function () {
    if (isDesktopMode()) {
      if (!isAutoPlay) {
        startAutoPlay();
        isAutoPlay = true;
        const icon = document.querySelector("#pauseBtn i");
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
      }
    } else {
      stopAutoPlay();
      isAutoPlay = false;
      const icon = document.querySelector("#pauseBtn i");
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    }
  });
});
