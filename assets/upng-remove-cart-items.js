class RemoveCartItemsButton extends HTMLElement {
  constructor() {
    super();

    document.getElementById('ModalAccept-RemoveCartItemsModal').addEventListener('click', (event) => {
      event.preventDefault();
      console.log('remove items');
      const body = JSON.stringify({
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname,
      });

      fetch(window.Shopify.routes.root + 'cart/clear.js', {
        ...fetchConfig(),
        ...{ body },
      })
        .then((response) => response.json())
        .then((data) => {
          data = JSON.stringify(data);
          const parsedState = JSON.parse(data);

          //   console.log('OK ' + data);
          const items = document.querySelectorAll('.cart-item');
          const cartItems = this.closest('cart-items');
          if (cartItems) cartItems.classList.toggle('is-empty', parsedState.item_count === 0);
          const cartDrawerWrapper = document.querySelector('cart-drawer');
          const cartFooter = document.getElementById('main-cart-footer');
          if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
          if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

          this.getSectionsToRender().forEach((section) => {
            const elementToReplace =
              document.getElementById(section.id).querySelector(section.selector) ||
              document.getElementById(section.id);
            elementToReplace.innerHTML = this.getSectionInnerHTML(
              parsedState.sections[section.section],
              section.selector
            );
            // console.log(this.getSectionInnerHTML(parsedState.sections[section.section], section.selector));
          });

          let message = '';
          if (items.length === parsedState.items.length) {
            message = window.cartStrings.error;
          }
          this.updateLiveRegions(message);

          if (parsedState.item_count === 0 && cartDrawerWrapper) {
            trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'));
          } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
            trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'));
          }

          publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsedState });

          document.getElementById('RemoveCartItemsModal').hide();
        })
        .catch((error) => {
          console.error('Error:', error);
          console.log('NO OK');
        });
    });
  }
  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section',
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      },
    ];
  }
  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }
  updateLiveRegions(message) {
    const cartStatus =
      document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }
}

customElements.define('cart-remove-all-items-button', RemoveCartItemsButton);
