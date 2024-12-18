document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');

  // ===== Modal Functionality =====
  const initModalFunctionality = () => {
    // Experience Modal Elements
    const experienceModal = document.getElementById('experienceModal');
    const experienceBtn = document.querySelector('.left-btn');
    const experienceCloseBtn = experienceModal.querySelector('.close-button');
    const downloadBtn = experienceModal.querySelector('.right-btn');

    // Portfolio Modal Elements
    const portfolioModal = document.getElementById('portfolioModal');
    const portfolioBtn = document.querySelector('.hero-right .right-btn'); // Updated selector
    const portfolioCloseBtn = portfolioModal.querySelector('.close-button');

    // Case Study Modal Elements
    const caseStudyModals = {
      locus: document.getElementById('locusModal'),
      amcon: document.getElementById('amconModal'),
      resolved: document.getElementById('resolvedModal'),
      swish: document.getElementById('swishModal')
    };

    // Map case study buttons to their modals
    const caseStudyMap = {
      'Digital Marketing Transformation': 'locus',
      'SEO Visibility Growth': 'amcon',
      'Technical SEO Optimization': 'resolved',
      'Traffic & Keyword Growth': 'swish'
    };

    console.log('Modal elements:', {
      experienceModal,
      experienceBtn,
      experienceCloseBtn,
      downloadBtn,
      portfolioModal,
      portfolioBtn,
      portfolioCloseBtn,
      caseStudyModals
    });

    // Helper Functions
    const hideAllModals = () => {
      [experienceModal, portfolioModal, ...Object.values(caseStudyModals)].forEach(modal => {
        if (modal) modal.style.display = 'none';
      });
      document.body.style.overflow = 'auto';
    };

    const showModal = (modal) => {
      if (modal) {
        hideAllModals();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
      }
    };

    const returnToPortfolio = () => {
      Object.values(caseStudyModals).forEach(modal => {
        if (modal) modal.style.display = 'none';
      });
      portfolioModal.style.display = 'block';
    };

    // Experience Modal Event Listeners
    if (experienceModal && experienceBtn && experienceCloseBtn) {
      experienceBtn.addEventListener('click', () => showModal(experienceModal));

      experienceCloseBtn.addEventListener('click', hideAllModals);

      // Download functionality
      if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
          try {
            const pdfUrl = 'https://austin-santos-resume.tiiny.site';
            window.open(pdfUrl, '_blank');
          } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again later.');
          }
        });
      }
    }

    // Portfolio Modal Event Listeners
    if (portfolioModal && portfolioBtn && portfolioCloseBtn) {
      portfolioBtn.addEventListener('click', () => showModal(portfolioModal));
      portfolioCloseBtn.addEventListener('click', hideAllModals);

      // Initialize Portfolio Case Study Buttons
      const caseStudyBtns = portfolioModal.querySelectorAll('.portfolio-card .btn');
      caseStudyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const cardTitle = btn.closest('.portfolio-card').querySelector('h3').textContent;
          const modalKey = caseStudyMap[cardTitle];
          if (modalKey && caseStudyModals[modalKey]) {
            portfolioModal.style.display = 'none';
            showModal(caseStudyModals[modalKey]);
          }
        });
      });
    }

    // Case Study Modal Event Listeners
    Object.values(caseStudyModals).forEach(modal => {
      if (modal) {
        const closeBtn = modal.querySelector('.close-button');
        if (closeBtn) {
          closeBtn.addEventListener('click', returnToPortfolio);
        }
      }
    });

    // Global Modal Event Listeners
    window.addEventListener('click', (event) => {
      const clickedModal = [experienceModal, portfolioModal, ...Object.values(caseStudyModals)]
        .find(modal => event.target === modal);

      if (clickedModal) {
        if (Object.values(caseStudyModals).includes(clickedModal)) {
          returnToPortfolio();
        } else {
          hideAllModals();
        }
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        const caseStudyOpen = Object.values(caseStudyModals)
          .some(modal => modal?.style.display === 'block');

        if (caseStudyOpen) {
          returnToPortfolio();
        } else {
          hideAllModals();
        }
      }
    });
  };

  // ===== Ship Animation =====
  const initShipAnimation = () => {
    const shipContainer = document.getElementById('ship-container');
    const path = document.getElementById('path');
    const htmlElement = document.documentElement;
    const heroLeft = document.querySelector('.hero-left');

    if (!path || !shipContainer || !heroLeft) return;

    const pathLength = path.getTotalLength();
    let isScrolling = false;

    const setScrollVar = () => {
      const percentOfScreenHeightScrolled = htmlElement.scrollTop / htmlElement.clientHeight;
      const scrollProgress = Math.min(percentOfScreenHeightScrolled * 100, 100);
      htmlElement.style.setProperty('--scroll', scrollProgress);
    };

    const updateShipPosition = () => {
      const scrollValue = parseFloat(getComputedStyle(htmlElement).getPropertyValue('--scroll')) || 0;

      if (scrollValue >= 0 && scrollValue <= 25) {
        shipContainer.classList.add('scrolling');
        const normalizedProgress = scrollValue / 25;
        const pointAtLength = normalizedProgress * pathLength;
        const point = path.getPointAtLength(pointAtLength);

        const svgWidth = path.ownerSVGElement.viewBox.baseVal.width;
        const svgHeight = path.ownerSVGElement.viewBox.baseVal.height;
        const containerWidth = heroLeft.offsetWidth;
        const containerHeight = heroLeft.offsetHeight;
        const scaleX = containerWidth / svgWidth;
        const scaleY = containerHeight / svgHeight;

        const x = point.x * scaleX;
        const y = point.y * scaleY;

        shipContainer.style.transform = `translate(${x}px, ${y}px)`;
        shipContainer.style.visibility = 'visible';
      } else {
        shipContainer.classList.remove('scrolling');
        shipContainer.style.visibility = 'hidden';
      }
    };

    window.addEventListener('scroll', () => {
      setScrollVar();
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          updateShipPosition();
          isScrolling = false;
        });
        isScrolling = true;
      }
    });

    window.addEventListener('resize', () => {
      setScrollVar();
      updateShipPosition();
    });

    setScrollVar();
    updateShipPosition();
  };

  // ===== Flash Effect =====
  const initFlashEffect = () => {
    const flashOverlay = document.getElementById('flash-overlay');
    const jobsSection = document.querySelector('.jobs-section');

    if (!flashOverlay || !jobsSection) return;

    const triggerFlash = () => {
      flashOverlay.style.animation = 'flash 0.6s ease-in-out';
      flashOverlay.style.opacity = '1';
      jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        flashOverlay.style.opacity = '0';
        flashOverlay.style.animation = '';
      }, 600);
    };

    const flashObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          triggerFlash();
        }
      },
      {
        root: null,
        threshold: 0.003236,
      }
    );

    flashObserver.observe(jobsSection);
  };

  // ===== Moon Cards =====
  const initMoonCards = () => {
    const moons = document.querySelectorAll('.moon');
    const cards = document.querySelectorAll('.active-card');
    const defaultCard = document.getElementById('card-1');

    if (!moons.length || !cards.length) return;

    moons.forEach((moon) => {
      moon.addEventListener('click', () => {
        const cardId = moon.getAttribute('data-card');
        cards.forEach(card => card.classList.remove('active'));
        const selectedCard = document.getElementById(`card-${cardId}`);
        if (selectedCard) selectedCard.classList.add('active');
      });
    });

    if (defaultCard) defaultCard.classList.add('active');
  };

  // ===== Scroll Animations =====
  const initScrollAnimations = () => {
    const resultSections = document.querySelectorAll('.result-section');
    const spaceObjects = document.querySelector('.space-objects');
    let scrollTimeout;

    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    resultSections.forEach(section => {
      scrollObserver.observe(section);
    });

    if (spaceObjects) {
      window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
          scrollTimeout = setTimeout(() => {
            const scrolled = window.pageYOffset;
            spaceObjects.style.transform = `translateY(${scrolled * 0.1}px)`;
            scrollTimeout = null;
          }, 10);
        }
      });
    }
  };

  // ===== Toggle Between Google Form and Calendar =====
  const initToggleFunctionality = () => {
    const emailToggle = document.querySelector('.email-toggle');
    const calendarToggle = document.querySelector('.calendar-toggle');
    const contactIframe = document.getElementById('contact-iframe');
    const googleCalendar = document.getElementById('google-calendar');

    if (!emailToggle || !calendarToggle || !contactIframe || !googleCalendar) {
      console.error('One or more elements for toggling functionality are missing.');
      return;
    }

    emailToggle.classList.add('active');
    contactIframe.style.display = 'block';
    googleCalendar.style.display = 'none';

    emailToggle.addEventListener('click', () => {
      contactIframe.style.display = 'block';
      googleCalendar.style.display = 'none';
      emailToggle.classList.add('active');
      calendarToggle.classList.remove('active');
    });

    calendarToggle.addEventListener('click', () => {
      contactIframe.style.display = 'none';
      googleCalendar.style.display = 'block';
      calendarToggle.classList.add('active');
      emailToggle.classList.remove('active');
    });
  };

  // Initialize all functionalities
  initModalFunctionality();
  initShipAnimation();
  initFlashEffect();
  initMoonCards();
  initScrollAnimations();
  initToggleFunctionality();
});
