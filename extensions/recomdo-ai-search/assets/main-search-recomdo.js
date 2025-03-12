class MainSearch extends SearchForm {
  constructor() {
    console.log("Main search recomdo");
    super();
    this.initialize();
  }

  async initialize() {
    this.allSearchInputs = document.querySelectorAll('input[type="search"]');
    var selectedCountry = Shopify.country;
    const inputElement = document.getElementById("Search-In-Template");

    await this.getSuggestions(inputElement.value, selectedCountry)
      .then((suggestions) => {
        // You can handle suggestions here
        console.log("SEARCH SUGGESTIONS", JSON.parse(suggestions));

        if (JSON.parse(suggestions).allUniqueOptions) {
          this.setSuggestions(JSON.parse(suggestions));
        }
      })
      .catch((error) => {
        console.error("Error occurred:", error);
      });

    this.setupEventListeners();
  }

  setupEventListeners() {
    let allSearchForms = [];
    this.allSearchInputs.forEach((input) => allSearchForms.push(input.form));
    this.input.addEventListener("focus", this.onInputFocus.bind(this));
    if (allSearchForms.length < 2) return;
    allSearchForms.forEach((form) =>
      form.addEventListener("reset", this.onFormReset.bind(this)),
    );
    this.allSearchInputs.forEach((input) =>
      input.addEventListener("input", this.onInput.bind(this)),
    );
  }

  onFormReset(event) {
    super.onFormReset(event);
    if (super.shouldResetForm()) {
      this.keepInSync("", this.input);
    }
  }

  onInput(event) {
    const target = event.target;
    this.keepInSync(target.value, target);
  }

  onInputFocus() {
    const isSmallScreen = window.innerWidth < 750;
    if (isSmallScreen) {
      this.scrollIntoView({ behavior: "smooth" });
    }
  }

  keepInSync(value, target) {
    this.allSearchInputs.forEach((input) => {
      if (input !== target) {
        input.value = value;
      }
    });
  }

  async setProductsOnlySearch() {
    var searchform = document.getElementsByClassName("search");
    var searchInner = searchform[0].querySelector(".field");
    console.log("searchInner", searchInner);
    var inputProdOnly = document.createElement("input");
    inputProdOnly.setAttribute("type", "hidden");
    inputProdOnly.setAttribute("name", "type");
    inputProdOnly.setAttribute("value", "product");
    searchInner.appendChild(inputProdOnly);
    console.log("searchInner", searchInner);
  }

  async setSuggestions(suggestions) {
    var searchHeader = document.getElementsByClassName(
      "template-search__header",
    );
    var shop = Shopify.shop;
    console.log("searchHeader", searchHeader);
    var suggestion_container = document.createElement("div");
    suggestion_container.setAttribute("class", "recomdo-ai-suggestions");
    var suggestion_dl = document.createElement("dl");
    suggestion_dl.setAttribute("class", "block");
    var suggestion_title = document.createElement("dt");
    suggestion_title.textContent = "Recomdo.AI Suggestions";
    suggestion_dl.appendChild(suggestion_title);
    suggestion_container.appendChild(suggestion_dl);

    suggestions.allUniqueOptions.forEach((ele) => {
      var suggestion_dd = document.createElement("dd");
      var suggestion_anchor = document.createElement("a");
      suggestion_anchor.textContent = ele.text;
      suggestion_anchor.setAttribute(
        "href",
        "https://" + shop + "/search?q=" + ele.text.replaceAll(" ", "+"),
      );
      suggestion_dd.appendChild(suggestion_anchor);
      suggestion_dl.appendChild(suggestion_dd);
    });
    searchHeader[0].appendChild(suggestion_container);
  }

  async getSuggestions(keyword, selectedCountry) {
    return new Promise((resolve, reject) => {
      console.log("keyword", keyword);
      if (keyword.length) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://shopifybackend.ai/searchsuggestions", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
          if (xhr.status === 201 || xhr.status === 200) {
            var response = xhr.response;
            var suggestions = response;
            resolve(suggestions);
          } else {
            console.error("some error occurred");
            reject("Some error occurred");
          }
        };
        xhr.onerror = function () {
          console.error("another error occurred");
          reject("Another error occurred");
        };
        xhr.send(
          JSON.stringify({
            keyword: keyword.replaceAll(" ", ""),
            country: selectedCountry,
          }),
        );
      }
    });
  }
}

customElements.define("main-search", MainSearch);
