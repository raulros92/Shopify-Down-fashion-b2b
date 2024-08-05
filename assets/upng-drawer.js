class UpangoDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelector('#UpngDrawer-Overlay').addEventListener('click', this.close.bind(this));
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add('animate', 'active');
    });

    this.addEventListener(
      'transitionend',
      () => {
        const containerToTrapFocusOn = this.classList.contains('is-empty')
          ? this.querySelector('.drawer__inner-empty')
          : document.getElementById('UpngDrawer');
        const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );

    document.body.classList.add('overflow-hidden');
  }

  close() {
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
    document.body.classList.remove('overflow-hidden');
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if (cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  renderContents(parsedState) {
    this.querySelector('.drawer__inner').classList.contains('is-empty') &&
      this.querySelector('.drawer__inner').classList.remove('is-empty');
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);
      sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
    });

    setTimeout(() => {
      this.querySelector('#UpngDrawer-Overlay').addEventListener('click', this.close.bind(this));
      this.open();
    });
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'UpngDrawer',
        selector: '#UpngDrawer',
      },
      {
        id: 'cart-icon-bubble',
      },
    ];
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }

  resetBody() {
    const body = this.querySelector('tbody');
    body.innerHTML = '';
  }

  deleteProduct(handle) {
    const body = this.querySelector('tbody');
    const rows = body.children;
    let index = null;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const target = row.getAttribute('product-target');
      if (target && target == handle) {
        index = i;
        break;
      }
    }
    if (index != null) rows[index].remove();
  }

  /**
   *
   * @param {{ image?: string, title: string, vendor?: string, deleteBtn: HTMLAnchorElement, handle: string  }} input
   */
  addProduct(input) {
    console.log(this);
    const body = this.querySelector('tbody');
    const row = document.createElement('tr');
    row.setAttribute('product-target', input.handle);
    console.log(input);
    const inputMap = new Map(Object.entries(input));
    row.className = 'upng-drawer-item';
    const fields = [];
    for (const [key, value] of inputMap) {
      switch (key) {
        case 'image':
          const imgField = document.createElement('td');
          const img = document.createElement('img');
          img.src = value;
          img.alt = input.title;
          img.width = '150';
          img.loading = 'lazy';
          img.className = 'cart-item__image';
          imgField.append(img);
          fields.push(imgField);
          break;
        case 'title':
          const titleField = document.createElement('td');
          if (typeof input.vendor !== 'undefined') {
            const vendorP = document.createElement('p');
            vendorP.className = 'caption-with-letter-spacing light';
            vendorP.innerHTML = input.vendor;
            titleField.append(vendorP);
          }
          const titleA = document.createElement('a');
          titleA.href = '#';
          titleA.className = 'cart-item__name link break';
          titleA.innerHTML = value;
          titleField.append(titleA);
          fields.push(titleField);
          break;
        default:
          break;
      }
    }
    const deleteAct = document.createElement('td');
    deleteAct.className = 'upng-drawer-item__actions';
    deleteAct.append(input.deleteBtn);
    fields.push(deleteAct);
    fields.forEach((field) => row.append(field));
    body.append(row);
  }
}

customElements.define('upango-drawer', UpangoDrawer);
