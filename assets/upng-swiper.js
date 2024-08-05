const swiperMain = new Swiper('.swiper_main', {
    loop: true,
    slidesPerView: 1,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    on: {
      slideChange: function (params) {
        let currentSlide = this.slides[this.activeIndex];
        let mainSlider = currentSlide.querySelector('.main-slider');
        if (mainSlider) {
          console.log('hay mainSlider"');
          let menuName = mainSlider.dataset.navId;
          console.log('menuName ',menuName);
          let headerNav = document.querySelector('.swiper-menu');
          //navTitle de slider == title de li del menu (cambio navTitle por navId y title por navId)
          let targetNav = headerNav.querySelector(`.swiper-menu-nav-item[data-nav-id="${menuName}"]`);
          if (targetNav) {
            console.log('hay targetNav');
            headerNav.querySelector(`.swiper-menu-nav-item.active`).classList.remove('active');
            targetNav.classList.add('active');
          }
          setTimeout(function () {
            headerNav.querySelectorAll('.swiper-menu-nav-item').forEach(function (Element) {
              if (Element.classList.contains('active')) {
                sessionStorage.setItem('nav-id', Element.getAttribute('data-nav-id'));
              }
            });
          }, 500);
        }
      },
    },
  });

  const interleaveOffset = 0.95;
  const swiper = new Swiper('.main-slider .swiper-container', {
    direction: 'vertical',
    loop: false,
    speed: 900,
    mousewheelControl: true,
    watchSlidesProgress: true,
    mousewheel: {
      releaseOnEdges: true,
    },
    touchReleaseOnEdges: true,
    autoplay: {
      delay: 6000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: '.main-slider .swiper-button-next',
      prevEl: '.main-slider .swiper-button-prev',
    },
    pagination: {
      el: '.main-slider .swiper-pagination',
      clickable: true,
      type: 'bullets',
      renderBullet: function (index, className) {
        if (index < 9) {
          return '<span class="' + className + '">' + '0' + (index + 1) + '</span>';
        } else {
          return '<span class="' + className + '">' + (index + 1) + '</span>';
        }
      },
    },
    on: {
      progress: function () {
        let swiper = this;

        for (let i = 0; i < swiper.slides.length; i++) {
          let slideProgress = swiper.slides[i].progress;
          let innerOffset = swiper.height * interleaveOffset;
          let innerTranslate = swiper * innerOffset;

          TweenMax.set(swiper.slides[i].querySelector('.main-slider__inner'), {
            y: innerTranslate
          });
        }
      },
      setTransition: function (slider, speed) {
        let swiper = this;
        for (let i = 0; i < swiper.slides.length; i++) {
          swiper.slides[i].style.transition = speed + 'ms';
          swiper.slides[i].querySelector('.main-slider__inner').style.transition = speed + 'ms';
        }
      }
    }
  });

  swiper[0].on('reachEnd', function () {
    setTimeout(function () {
      swiper[0].mousewheel.disable();
    }, 500);
  });

  function wheel(event) {
    var delta = 0;
    if (!event) event = window.event;
    if (event.wheelDelta) {
      delta = event.wheelDelta / 120;
    } else if (event.detail) {
      delta = -event.detail / 3;
    }
    if (delta) {
      if (delta > 0) {
        swiper[0].mousewheel.enable();
      }
    }
  }

//Slide Homepage slider on click Menu
if(document.querySelector('.swiper-menu')){
	document.querySelector('.swiper-menu').querySelectorAll('.swiper-menu-nav-item').forEach(function(ele){
		ele.addEventListener('click',function(Element){
			let navId = Element.currentTarget.getAttribute('data-nav-id');
			let targetSlide = document.querySelector(`.main-slider[data-nav-id="${navId}"]`);
			if(targetSlide){
				Element.preventDefault();			
				if(targetSlide){
					let swiperMain = document.querySelector(".swiper_main");
					swiperMain.swiper.slides.forEach((slide,index) => {
						if(slide.querySelector('.main-slider').dataset.navId == navId){
							swiperMain.swiper.slideTo(index);
						}
					});				
					sessionStorage.setItem("nav-id", navId);
				}				
			}
		})
	});    
}

  window.addEventListener('mousewheel', wheel);
  window.addEventListener('DOMMouseScroll', wheel);