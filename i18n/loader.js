// Minimal i18n loader. Usage:
// i18n.load().then(() => { i18n.t('key') })
(function(window){
  const i18n = {
    data: null,
    lang: null,
    async load(){
      const preferred = localStorage.getItem('mateoritos_lang') || (navigator.language && navigator.language.startsWith('en') ? 'en' : 'es');
      this.lang = preferred;
      const res = await fetch(`i18n/${this.lang}.json`);
      this.data = await res.json();
      window.dispatchEvent(new CustomEvent('i18n:loaded', { detail: { lang: this.lang }}));
      return this.data;
    },
    t(key){
      if (!this.data) return key;
      const parts = key.split('.');
      let cur = this.data;
      for (let p of parts){ if (cur[p] === undefined) return key; cur = cur[p]; }
      return cur;
    },
    setLang(lang){
      localStorage.setItem('mateoritos_lang', lang);
      return this.load();
    }
  };
  window.i18n = i18n;
})(window);
