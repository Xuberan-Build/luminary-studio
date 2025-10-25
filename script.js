/**
 * Luminary Studio Portfolio - Main JavaScript
 * Handles modals, animations, and interactive elements
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Initializing...');

  // ===== Modal Functionality =====
  const initModalFunctionality = () => {
    // Experience Modal Elements
    const experienceModal = document.getElementById('experienceModal');
    const experienceBtn = document.querySelector('.left-btn');
    const experienceCloseBtn = experienceModal?.querySelector('.close-button');
    const downloadBtn = experienceModal?.querySelector('.right-btn');

    // Portfolio Modal Elements
    const portfolioModal = document.getElementById('portfolioModal');
    const portfolioBtn = document.querySelector('.hero-right .right-btn');
    const portfolioCloseBtn = portfolioModal?.querySelector('.close-button');

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

    console.log('Modal elements initialized:', {
      experienceModal: !!experienceModal,
      portfolioModal: !!portfolioModal,
      caseStudyModals: Object.keys(caseStudyModals).filter(key => caseStudyModals[key])
    });

    // Helper Functions
    const hideAllModals = () => {
      const allModals = [experienceModal, portfolioModal, ...Object.values(caseStudyModals)];
      allModals.forEach(modal => {
        if (modal) {
          modal.style.display = 'none';
          modal.setAttribute('aria-hidden', 'true');
        }
      });
      document.body.style.overflow = 'auto';
    };

    const showModal = (modal) => {
      if (modal) {
        hideAllModals();
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focus on close button for accessibility
        const closeBtn = modal.querySelector('.close-button');
        if (closeBtn) {
          setTimeout(() => closeBtn.focus(), 100);
        }
      }
    };

    const returnToPortfolio = () => {
      Object.values(caseStudyModals).forEach(modal => {
        if (modal) {
          modal.style.display = 'none';
          modal.setAttribute('aria-hidden', 'true');
        }
      });
      if (portfolioModal) {
        portfolioModal.style.display = 'block';
        portfolioModal.setAttribute('aria-hidden', 'false');
      }
    };

    // Experience Modal Event Listeners
    if (experienceModal && experienceBtn && experienceCloseBtn) {
      experienceBtn.addEventListener('click', () => {
        showModal(experienceModal);
        console.log('Experience modal opened');
      });

      experienceCloseBtn.addEventListener('click', () => {
        hideAllModals();
        console.log('Experience modal closed');
      });

      // Download functionality
      if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
          try {
            const pdfUrl = 'https://austin-santos-resume.tiiny.site';
            window.open(pdfUrl, '_blank', 'noopener,noreferrer');
            console.log('Resume download initiated');
          } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again later.');
          }
        });
      }
    }

    // Portfolio Modal Event Listeners
    if (portfolioModal && portfolioBtn && portfolioCloseBtn) {
      portfolioBtn.addEventListener('click', () => {
        showModal(portfolioModal);
        console.log('Portfolio modal opened');
      });

      portfolioCloseBtn.addEventListener('click', () => {
        hideAllModals();
        console.log('Portfolio modal closed');
      });

      // Initialize Portfolio Case Study Buttons
      const caseStudyBtns = portfolioModal.querySelectorAll('.portfolio-card .btn');
      caseStudyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const cardTitle = btn.closest('.portfolio-card')?.querySelector('h3')?.textContent;
          const modalKey = caseStudyMap[cardTitle];
          
          if (modalKey && caseStudyModals[modalKey]) {
            portfolioModal.style.display = 'none';
            portfolioModal.setAttribute('aria-hidden', 'true');
            showModal(caseStudyModals[modalKey]);
            console.log(`Case study opened: ${cardTitle}`);
          }
        });
      });
    }

    // Case Study Modal Event Listeners
    Object.entries(caseStudyModals).forEach(([key, modal]) => {
      if (modal) {
        const closeBtn = modal.querySelector('.close-button');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            returnToPortfolio();
            console.log(`Case study closed: ${key}`);
          });
        }
      }
    });

    // Global Modal Event Listeners - Click outside to close
    window.addEventListener('click', (event) => {
      const allModals = [experienceModal, portfolioModal, ...Object.values(caseStudyModals)];
      const clickedModal = allModals.find(modal => event.target === modal);

      if (clickedModal) {
        if (Object.values(caseStudyModals).includes(clickedModal)) {
          returnToPortfolio();
        } else {
          hideAllModals();
        }
      }
    });

    // ESC key to close modals
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

    if (!path || !shipContainer || !heroLeft) {
      console.log('Ship animation elements not found');
      return;
    }

    const pathLength = path.getTotalLength();
    let isScrolling = false;
    let ticking = false;

    const setScrollVar = () => {
      const percentOfScreenHeightScrolled = htmlElement.scrollTop / htmlElement.clientHeight;
      const scrollProgress = Math.min(percentOfScreenHeightScrolled * 100, 100);
      htmlElement.style.setProperty('--scroll', scrollProgress);
    };

    const updateShipPosition = () => {
      const scrollValue = parseFloat(
        getComputedStyle(htmlElement).getPropertyValue('--scroll')
      ) || 0;

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

    // Optimized scroll handler with requestAnimationFrame
    const handleScroll = () => {
      setScrollVar();
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateShipPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Passive event listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    window.addEventListener('resize', () => {
      setScrollVar();
      updateShipPosition();
    });

    // Initial setup
    setScrollVar();
    updateShipPosition();
    console.log('Ship animation initialized');
  };

  // ===== Flash Effect =====
  const initFlashEffect = () => {
    const flashOverlay = document.getElementById('flash-overlay');
    const jobsSection = document.querySelector('.jobs-section');

    if (!flashOverlay || !jobsSection) {
      console.log('Flash effect elements not found');
      return;
    }

    let hasTriggered = false;

    const triggerFlash = () => {
      if (hasTriggered) return;
      
      hasTriggered = true;
      flashOverlay.style.animation = 'flash 0.6s ease-in-out';
      flashOverlay.style.opacity = '1';
      
      jobsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });

      setTimeout(() => {
        flashOverlay.style.opacity = '0';
        flashOverlay.style.animation = '';
      }, 600);
      
      console.log('Flash effect triggered');
    };

    const flashObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          triggerFlash();
        }
      },
      {
        root: null,
        threshold: 0.003236,
      }
    );

    flashObserver.observe(jobsSection);
    console.log('Flash effect initialized');
  };

  // ===== Moon Cards =====
  const initMoonCards = () => {
    const moons = document.querySelectorAll('.moon');
    const cards = document.querySelectorAll('.active-card');
    const defaultCard = document.getElementById('card-1');

    if (!moons.length || !cards.length) {
      console.log('Moon cards elements not found');
      return;
    }

    moons.forEach((moon) => {
      moon.addEventListener('click', () => {
        const cardId = moon.getAttribute('data-card');
        
        // Update ARIA attributes for accessibility
        moons.forEach(m => m.setAttribute('aria-selected', 'false'));
        moon.setAttribute('aria-selected', 'true');
        
        // Hide all cards and show selected
        cards.forEach(card => card.classList.remove('active'));
        const selectedCard = document.getElementById(`card-${cardId}`);
        
        if (selectedCard) {
          selectedCard.classList.add('active');
          console.log(`Moon card ${cardId} activated`);
        }
      });

      // Add keyboard support
      moon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          moon.click();
        }
      });
    });

    // Activate default card
    if (defaultCard) {
      defaultCard.classList.add('active');
      const firstMoon = document.querySelector('.moon[data-card="1"]');
      if (firstMoon) {
        firstMoon.setAttribute('aria-selected', 'true');
      }
    }
    
    console.log('Moon cards initialized');
  };

  // ===== Scroll Animations =====
  const initScrollAnimations = () => {
    const resultSections = document.querySelectorAll('.result-section');
    const spaceObjects = document.querySelector('.space-objects');
    let scrollTimeout;
    let ticking = false;

    if (!resultSections.length) {
      console.log('Result sections not found');
      return;
    }

    const scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            console.log('Result section became visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    resultSections.forEach(section => {
      scrollObserver.observe(section);
    });

    // Parallax effect for space objects
    if (spaceObjects) {
      const handleParallax = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            spaceObjects.style.transform = `translateY(${scrolled * 0.1}px)`;
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', handleParallax, { passive: true });
    }
    
    console.log('Scroll animations initialized');
  };

  // ===== Toggle Between Google Form and Calendar =====
  const initToggleFunctionality = () => {
    const emailToggle = document.querySelector('.email-toggle');
    const calendarToggle = document.querySelector('.calendar-toggle');
    const contactIframe = document.getElementById('contact-iframe');
    const googleCalendar = document.getElementById('google-calendar');

    if (!emailToggle || !calendarToggle || !contactIframe || !googleCalendar) {
      console.log('Contact toggle elements not found');
      return;
    }

    // Set initial state
    emailToggle.classList.add('active');
    emailToggle.setAttribute('aria-selected', 'true');
    calendarToggle.setAttribute('aria-selected', 'false');
    contactIframe.style.display = 'block';
    googleCalendar.style.display = 'none';

    // Email toggle handler
    emailToggle.addEventListener('click', () => {
      contactIframe.style.display = 'block';
      googleCalendar.style.display = 'none';
      
      emailToggle.classList.add('active');
      emailToggle.setAttribute('aria-selected', 'true');
      
      calendarToggle.classList.remove('active');
      calendarToggle.setAttribute('aria-selected', 'false');
      
      console.log('Switched to email form');
    });

    // Calendar toggle handler
    calendarToggle.addEventListener('click', () => {
      contactIframe.style.display = 'none';
      googleCalendar.style.display = 'block';
      
      calendarToggle.classList.add('active');
      calendarToggle.setAttribute('aria-selected', 'true');
      
      emailToggle.classList.remove('active');
      emailToggle.setAttribute('aria-selected', 'false');
      
      console.log('Switched to calendar');
    });

    // Keyboard support
    [emailToggle, calendarToggle].forEach(toggle => {
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.click();
        }
      });
    });
    
    console.log('Contact toggle initialized');
  };

  // ===== Performance Monitoring =====
  const logPerformance = () => {
    if (window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = window.performance.timing;
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
          const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
          
          console.log('Performance Metrics:');
          console.log(`- Page Load Time: ${pageLoadTime}ms`);
          console.log(`- DOM Ready Time: ${domReadyTime}ms`);
        }, 0);
      });
    }
  };

  // ===== Initialize All Functionalities =====
  try {
    initModalFunctionality();
    initShipAnimation();
    initFlashEffect();
    initMoonCards();
    initScrollAnimations();
    initToggleFunctionality();
    logPerformance();
    
    console.log('✅ All functionalities initialized successfully');
  } catch (error) {
    console.error('❌ Error during initialization:', error);
  }
});

// ===== Service Worker Registration (Optional - for PWA) =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment to enable service worker
    // navigator.serviceWorker.register('/sw.js')
    //   .then(reg => console.log('Service Worker registered'))
    //   .catch(err => console.log('Service Worker registration failed'));
  });
}