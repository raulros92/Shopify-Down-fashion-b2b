class FancyLogin extends HTMLElement {
    constructor() {
      super();
  
      this.fancyLogin = document.getElementById('fancy-login');
      this.fancyLoginOpener = document.getElementById('fancy-login-opener');
      this.header = document.querySelector('sticky-header');
      this.onBodyClick = this.handleBodyClick.bind(this);
  
      this.fancyLogin.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
      this.querySelectorAll('button[type="button"]').forEach((closeButton) =>
        closeButton.addEventListener('click', this.close.bind(this))
      );

      this.fancyLoginOpener.addEventListener('click',this.open.bind(this));
    }
  
    open() {
        console.log('open fancy login!');
        this.fancyLogin.classList.add('animate', 'active');
            console.log('active');
        this.fancyLogin.addEventListener(
            'transitionend',
            () => {
            this.fancyLogin.focus();
            trapFocus(this.fancyLogin);
            },
            { once: true }
        );

        document.body.addEventListener('click', this.onBodyClick);
    }
  
    close() {
      this.fancyLogin.classList.remove('active');
      document.body.removeEventListener('click', this.onBodyClick);
  
      removeTrapFocus(this.activeElement);
    }
      
  
    getSectionInnerHTML(html, selector = '.shopify-section') {
      return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
    }
  
    handleBodyClick(evt) {
      const target = evt.target;
      if (target!=this.fancyLoginOpener && !this.fancyLoginOpener.closest(target) && target !== this.fancyLogin && !target.closest('fancy-login')) {
        const disclosure = target.closest('details-disclosure, header-menu');
        this.activeElement = disclosure ? disclosure.querySelector('summary') : null;
        this.close();
      }
    }
  
    setActiveElement(element) {
      this.activeElement = element;
    }
  }
  
  customElements.define('fancy-login', FancyLogin);