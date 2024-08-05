if (!customElements.get('tab-component')) {
  class Tabs extends HTMLElement {
    constructor() {
      super(),
        (this.tabList = this.querySelector('[role="tablist"]')),
        (this.activeTab = this.tabList.querySelector('[aria-selected="true"]')),
        (this.isVerticalTablist = this.tabList.getAttribute('aria-orientation') === 'vertical'),
        (this.tabs = this.querySelectorAll('[role="tab"]')),
        (this.panels = this.querySelectorAll('[role="tabpanel"]')),
        this.activeTab || ((this.activeTab = this.tabs[0]), this.activateTab(this.activeTab)),
        this.addListeners();
    }
    addListeners() {
      this.tabList.addEventListener('click', this.handleClick.bind(this)),
        this.tabList.addEventListener('keydown', this.handleKeydown.bind(this));
    }
    handleClick(evt) {
      !evt.target.matches('[role="tab"]') || evt.target === this.activeTab || this.activateTab(evt.target);
    }
    handleKeydown(evt) {
      switch (evt.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
          evt.preventDefault(), this.isVerticalTablist || this.switchTabOnKeyPress(evt.key);
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          evt.preventDefault(), this.isVerticalTablist && this.switchTabOnKeyPress(evt.key);
          break;
        case 'Home':
          evt.preventDefault(), this.activateTab(this.tabs[0]);
          break;
        case 'End':
          evt.preventDefault(), this.activateTab(this.tabs[this.tabs.length - 1]);
          break;
      }
    }
    switchTabOnKeyPress(key) {
      key === 'ArrowRight' || key === 'ArrowDown'
        ? this.activeTab === this.tabs[this.tabs.length - 1]
          ? this.activateTab(this.tabs[0])
          : this.activateTab(this.activeTab.nextElementSibling)
        : (key === 'ArrowLeft' || key === 'ArrowUp') &&
          (this.activeTab === this.tabs[0]
            ? this.activateTab(this.tabs[this.tabs.length - 1])
            : this.activateTab(this.activeTab.previousElementSibling));
    }
    activateTab(tab) {
      this.deactivateActiveTab(),
        Tabs.setTabState(tab, !0),
        tab.removeAttribute('tabindex'),
        (this.activeTab = tab),
        document.activeElement.matches('.tabnav__tab') && tab.focus();
    }
    deactivateActiveTab() {
      Tabs.setTabState(this.activeTab, !1), this.activeTab.setAttribute('tabindex', '-1'), (this.activeTab = null);
    }
    static setTabState(tab, active) {
      tab.setAttribute('aria-selected', active);
      const panelId = tab.getAttribute('aria-controls');
      document.getElementById(panelId).hidden = !active;
    }
  }
  customElements.define('tab-component', Tabs);
}
