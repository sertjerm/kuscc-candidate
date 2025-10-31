// 📄 File: script.js
// ------------------------------------------------------
// Script หลักสำหรับควบคุมสไลด์ - Layout 6 with Type Title
// ------------------------------------------------------

// ⚙️ การตั้งค่า
const SLIDE_DURATION = 50000; // เวลาเปลี่ยนสไลด์ (มิลลิวินาที)

let currentSlide = 0;
let isAutoPlay = false;
let autoPlayInterval;

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

function getTypeTitle(line) {
  if (line === "สายวิชาการ") {
    return `
      <div class="type-box academic">
        <div class="type-title">สายวิชาการ</div>
        <div class="type-subtitle">
          เลือกได้
          <span class="highlight">4</span>
          หมายเลข
        </div>
      </div>
    `;
  } else {
    return `
      <div class="type-box support">
        <div class="type-title">สายสนับสนุน</div>
        <div class="type-subtitle">
          เลือกได้
          <span class="highlight">3</span>
          คน
        </div>
      </div>
    `;
  }
}

function generateSlides() {
  const slidesContainer = $("#heroSlides");
  const progressBar = $("#progressBar");

  const displayCandidates = initializeCandidates();

  displayCandidates.forEach((candidate, index) => {
    // ใช้สีตามหมายเลขผู้สมัคร (index 0-9 สำหรับหมายเลข 1-10)
    const colorIndex = candidate.number - 1;
    const colors = candidateColors[colorIndex] || candidateColors[0]; // fallback เป็นสีแรก

    // คำนวณหน้า PDF ตามสายและหมายเลข
    let pdfPage;
    if (candidate.line === "สายวิชาการ") {
      pdfPage = 13 + (candidate.number - 1); // เริ่มหน้า 13, ทีละ 1 หน้า
    } else if (candidate.line === "สายสนับสนุน") {
      pdfPage = 22 + (candidate.number - 1); // เริ่มหน้า 22, ทีละ 1 หน้า
    } else {
      pdfPage = 13; // fallback
    }

    // Create slide with Multi-Card layout and Type Title
    const slide = $(`
      <div class="hero-slide ${index === 0 ? "active" : ""}" 
           style="--gradient-from-rgb: ${colors.from}; --gradient-to-rgb: ${
      colors.to
    }; background-image: url('${candidate.image}');">
        
        <div class="candidate-info">
          <!-- Photo Section with Type Banner -->
          <div class="main-photo-card">
            <!-- Type Banner -->
            <div class="candidate-type-banner">
              ${getTypeTitle(candidate.line)}
            </div>
            
            <div class="photo-frame">
              ${createImageElement(candidate)}
            </div>
            <div class="number-circle">
              <div class="number-circle-number">${candidate.number}</div>
              <div class="number-label" >หมายเลข</div>
            </div>
          </div>
          
          <!-- Info Section -->
          <div class="info-section">
            <!-- Header Card -->
            <div class="header-card">
              <h1>${candidate.name}</h1>
              <p>${candidate.affiliation}</p>
            </div>
            
            <!-- Info Cards Grid -->
            <div class="info-cards">
              <!-- Education Card -->
              <div class="info-card education">
                <div class="card-icon">
                  <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="card-info-wrapper">
                  <div class="card-title">วุฒิการศึกษา</div>
                  <div class="card-content">
                    ${candidate.education[0]}
                  </div>
                </div>
              </div>
              
              <!-- Experience Card -->
              <div class="info-card experience">
                <div class="card-icon">
                  <i class="fas fa-briefcase"></i>
                </div>
                <div class="card-info-wrapper">
                  <div class="card-title">ประสบการณ์ที่โดดเด่น</div>
                  <div class="card-content">
                    ${candidate.experience
                      .slice(0, 3)
                      .map((exp) => `• ${exp}`)
                      .join("<br>")}
                  </div>
                </div>
              </div>
              
              <!-- Vision Card -->
              <div class="info-card vision">
                <div class="card-icon">
                  <i class="fas fa-lightbulb"></i>
                </div>
                <div class="card-info-wrapper">
                  <div class="card-title">แนวคิดในการทำงาน</div>
                  <div class="card-content">
                    ${candidate.concept}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Detail Link -->
            <div class="detail-link-wrapper">
              <a href="https://apps4.coop.ku.ac.th/candidate/electNews68.pdf#page=${pdfPage}" 
                 target="_blank" 
                 class="detail-link">
                <i class="fas fa-file-pdf"></i>
                ดูรายละเอียดเพิ่มเติม
              </a>
            </div>
          </div>
        </div>
      </div>
    `);

    slidesContainer.append(slide);

    // Create progress dot
    const dot = $(
      `<div class="progress-dot ${
        index === 0 ? "active" : ""
      }" data-slide="${index}"></div>`
    );
    progressBar.append(dot);
  });
}

function showSlide(index) {
  $(".hero-slide").removeClass("active");
  $(".progress-dot").removeClass("active");

  // Show current slide
  $(`.hero-slide:eq(${index})`).addClass("active");
  $(`.progress-dot:eq(${index})`).addClass("active");

  currentSlide = index;
}

function nextSlide() {
  const displayCandidates = initializeCandidates();
  const next = (currentSlide + 1) % displayCandidates.length;
  showSlide(next);
}

function prevSlide() {
  const displayCandidates = initializeCandidates();
  const prev =
    (currentSlide - 1 + displayCandidates.length) % displayCandidates.length;
  showSlide(prev);
}

function startAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
  autoPlayInterval = setInterval(nextSlide, SLIDE_DURATION);
}

function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
}

function toggleAutoPlay() {
  if (isAutoPlay) {
    stopAutoPlay();
    isAutoPlay = false;
    $("#autoPlayIcon").removeClass("fa-pause").addClass("fa-play");
    $("#autoPlayText").text("เล่นอัตโนมัติ");
  } else {
    startAutoPlay();
    isAutoPlay = true;
    $("#autoPlayIcon").removeClass("fa-play").addClass("fa-pause");
    $("#autoPlayText").text("หยุดอัตโนมัติ");
  }
}

$(document).ready(function () {
  generateSlides();
  startAutoPlay();

  // Progress dot click
  $(document).on("click", ".progress-dot", function () {
    const slideIndex = parseInt($(this).data("slide"));
    showSlide(slideIndex);
    if (isAutoPlay) {
      stopAutoPlay();
      startAutoPlay();
    }
  });

  // Auto play control
  $("#autoPlayBtn").on("click", toggleAutoPlay);

  // Keyboard controls
  $(document).on("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      prevSlide();
      if (isAutoPlay) {
        stopAutoPlay();
        startAutoPlay();
      }
    } else if (e.key === "ArrowRight") {
      nextSlide();
      if (isAutoPlay) {
        stopAutoPlay();
        startAutoPlay();
      }
    } else if (e.key === " ") {
      e.preventDefault();
      toggleAutoPlay();
    }
  });

  // Pause on hover
  $(".hero-slider")
    .on("mouseenter", function () {
      if (isAutoPlay) stopAutoPlay();
    })
    .on("mouseleave", function () {
      if (isAutoPlay) startAutoPlay();
    });

  // Touch/swipe support for mobile
  let startX = 0;
  let startY = 0;

  $(".hero-slider").on("touchstart", function (e) {
    startX = e.originalEvent.touches[0].clientX;
    startY = e.originalEvent.touches[0].clientY;
  });

  $(".hero-slider").on("touchend", function (e) {
    if (!startX || !startY) return;

    const endX = e.originalEvent.changedTouches[0].clientX;
    const endY = e.originalEvent.changedTouches[0].clientY;

    const diffX = startX - endX;
    const diffY = startY - endY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }

      if (isAutoPlay) {
        stopAutoPlay();
        startAutoPlay();
      }
    }

    startX = 0;
    startY = 0;
  });
});
