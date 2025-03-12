class PredictiveSearch extends SearchForm {
  constructor() {
    super();
    this.cachedResults = {};
    this.predictiveSearchResults = this.querySelector(
      "[data-predictive-search]",
    );
    this.setAutoFillInput();
    this.allPredictiveSearchInstances =
      document.querySelectorAll("predictive-search");
    this.isOpen = false;
    this.abortController = new AbortController();
    this.searchTerm = "";

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.input.form.addEventListener("submit", this.onFormSubmit.bind(this));

    this.input.addEventListener("focus", this.onFocus.bind(this));
    this.addEventListener("focusout", this.onFocusOut.bind(this));
    this.addEventListener("keyup", this.onKeyup.bind(this));
    this.addEventListener("keydown", this.onKeydown.bind(this));
  }

  getQuery() {
    return this.input.value.trim();
  }

  async onChange(event) {
    console.log("Shopify", Shopify);
    var selectedCountry = Shopify.country;
    this.autoFill(event, selectedCountry);
    // this.autoComplete();
    super.onChange();
    const newSearchTerm = this.getQuery();
    if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
      // Remove the results when they are no longer relevant for the new search term
      // so they don't show up when the dropdown opens again
      this.querySelector("#predictive-search-results-groups-wrapper")?.remove();
    }

    // Update the term asap, don't wait for the predictive search query to finish loading
    this.updateSearchForTerm(this.searchTerm, newSearchTerm);

    this.searchTerm = newSearchTerm;

    if (!this.searchTerm.length) {
      this.close(true);
      return;
    }

    await this.getSearchResults(this.searchTerm, selectedCountry);
  }

  onFormSubmit(event) {
    console.log("submit form");
    if (
      !this.getQuery().length ||
      this.querySelector('[aria-selected="true"] a')
    )
      event.preventDefault();
  }

  onFormReset(event) {
    super.onFormReset(event);
    const autofillContent = document.getElementById("autofill");
    if (super.shouldResetForm()) {
      this.searchTerm = "";
      autofillContent.value = "";
      this.abortController.abort();
      this.abortController = new AbortController();
      this.closeResults(true);
    }
  }

  async onFocus() {
    var selectedCountry = Shopify.country;
    const currentSearchTerm = this.getQuery();

    if (!currentSearchTerm.length) return;

    if (this.searchTerm !== currentSearchTerm) {
      // Search term was changed from other search input, treat it as a user change
      this.onChange();
    } else if (this.getAttribute("results") === "true") {
      this.open();
    } else {
      await this.getSearchResults(this.searchTerm, selectedCountry);
    }
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onKeyup(event) {
    if (!this.getQuery().length) this.close(true);
    event.preventDefault();

    switch (event.code) {
      case "ArrowUp":
        this.switchOption("up");
        break;
      case "ArrowDown":
        this.switchOption("down");
        break;
      case "Enter":
        this.selectOption();
        break;
    }
  }

  async onKeydown(event) {
    // Prevent the cursor from moving in the input when using the up and down arrow keys
    if (event.code === "ArrowUp" || event.code === "ArrowDown") {
      event.preventDefault();
    } else {
      var selectedCountry = Shopify.country;
      this.autoFill(event, selectedCountry);
      const inputElement = document.getElementById("Search-In-Modal");
      await this.getSearchResults(inputElement.value, selectedCountry);
    }
  }

  updateSearchForTerm(previousTerm, newTerm) {
    const searchForTextElement = this.querySelector(
      "[data-predictive-search-search-for-text]",
    );
    const currentButtonText = searchForTextElement?.innerText;
    if (currentButtonText) {
      if (currentButtonText.match(new RegExp(previousTerm, "g")).length > 1) {
        // The new term matches part of the button text and not just the search term, do not replace to avoid mistakes
        return;
      }
      const newButtonText = currentButtonText.replace(previousTerm, newTerm);
      searchForTextElement.innerText = newButtonText;
    }
  }

  switchOption(direction) {
    if (!this.getAttribute("open")) return;

    const moveUp = direction === "up";
    const selectedElement = this.querySelector('[aria-selected="true"]');

    // Filter out hidden elements (duplicated page and article resources) thanks
    // to this https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
    const allVisibleElements = Array.from(
      this.querySelectorAll("li, button.predictive-search__item"),
    ).filter((element) => element.offsetParent !== null);
    let activeElementIndex = 0;

    if (moveUp && !selectedElement) return;

    let selectedElementIndex = -1;
    let i = 0;

    while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
      if (allVisibleElements[i] === selectedElement) {
        selectedElementIndex = i;
      }
      i++;
    }

    this.statusElement.textContent = "";

    if (!moveUp && selectedElement) {
      activeElementIndex =
        selectedElementIndex === allVisibleElements.length - 1
          ? 0
          : selectedElementIndex + 1;
    } else if (moveUp) {
      activeElementIndex =
        selectedElementIndex === 0
          ? allVisibleElements.length - 1
          : selectedElementIndex - 1;
    }

    if (activeElementIndex === selectedElementIndex) return;

    const activeElement = allVisibleElements[activeElementIndex];

    activeElement.setAttribute("aria-selected", true);
    if (selectedElement) selectedElement.setAttribute("aria-selected", false);

    this.input.setAttribute("aria-activedescendant", activeElement.id);
  }

  selectOption() {
    const selectedOption = this.querySelector(
      '[aria-selected="true"] a, button[aria-selected="true"]',
    );

    if (selectedOption) selectedOption.click();
  }

  async getSearchResults(searchTerm, selectedCountry) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();
    this.setLiveRegionLoadingState();

    if (this.cachedResults[queryKey]) {
      this.renderSearchResults(this.cachedResults[queryKey]);
      return;
    }
    // Recomdo AI comment
    // fetch(
    //   `${routes.predictive_search_url}?q=${encodeURIComponent(
    //     searchTerm
    //   )}&section_id=predictive-search`,
    //   {
    //     signal: this.abortController.signal,
    //   }
    // )
    //   .then((response) => {
    //     if (!response.ok) {
    //       var error = new Error(response.status);
    //       this.close();
    //       throw error;
    //     }
    //     console.log("def predict", response);
    //     return response.text();
    //   })
    //   .then((text) => {
    //     console.log("predtext", text);
    //     const resultsMarkup = new DOMParser()
    //       .parseFromString(text, "text/html")
    //       .querySelector("#shopify-section-predictive-search").innerHTML;
    //     console.log("predtext", resultsMarkup);
    //     // Save bandwidth keeping the cache in all instances synced
    //     this.allPredictiveSearchInstances.forEach(
    //       (predictiveSearchInstance) => {
    //         predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
    //       }
    //     );
    //     this.renderSearchResults(resultsMarkup);
    //   })
    //   .catch((error) => {
    //     if (error?.code === 20) {
    //       // Code 20 means the call was aborted
    //       return;
    //     }
    //     this.close();
    //     throw error;
    //   });
    // Recomdo AI comment End
    await this.getAutoComplete(searchTerm, selectedCountry)
      .then((suggestions) => {
        // You can handle suggestions here

        const resultsMarkup = new DOMParser()
          .parseFromString(suggestions, "text/html")
          .querySelector("#shopify-section-predictive-search").innerHTML;
        // Save bandwidth keeping the cache in all instances synced
        this.allPredictiveSearchInstances.forEach(
          (predictiveSearchInstance) => {
            predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
          },
        );
        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        console.error("Error occurred:", error);
      });
  }

  setLiveRegionLoadingState() {
    this.statusElement =
      this.statusElement || this.querySelector(".predictive-search-status");
    this.loadingText =
      this.loadingText || this.getAttribute("data-loading-text");

    this.setLiveRegionText(this.loadingText);
    this.setAttribute("loading", true);
  }

  setLiveRegionText(statusText) {
    this.statusElement.setAttribute("aria-hidden", "false");
    this.statusElement.textContent = statusText;

    setTimeout(() => {
      this.statusElement.setAttribute("aria-hidden", "true");
    }, 1000);
  }

  renderSearchResults(resultsMarkup) {
    this.predictiveSearchResults.innerHTML = resultsMarkup;
    this.setAttribute("results", true);

    this.setLiveRegionResults();
    this.open();
  }

  setLiveRegionResults() {
    this.removeAttribute("loading");
    this.setLiveRegionText(
      this.querySelector("[data-predictive-search-live-region-count-value]")
        .textContent,
    );
  }

  getResultsMaxHeight() {
    this.resultsMaxHeight =
      window.innerHeight -
      document.querySelector(".section-header").getBoundingClientRect().bottom;
    return this.resultsMaxHeight;
  }

  open() {
    this.predictiveSearchResults.style.maxHeight =
      this.resultsMaxHeight || `${this.getResultsMaxHeight()}px`;
    this.setAttribute("open", true);
    this.input.setAttribute("aria-expanded", true);
    this.isOpen = true;
  }

  close(clearSearchTerm = false) {
    this.closeResults(clearSearchTerm);
    this.isOpen = false;
  }

  closeResults(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.input.value = "";
      this.removeAttribute("results");
    }
    const selected = this.querySelector('[aria-selected="true"]');

    if (selected) selected.setAttribute("aria-selected", false);

    this.input.setAttribute("aria-activedescendant", "");
    this.removeAttribute("loading");
    this.removeAttribute("open");
    this.input.setAttribute("aria-expanded", false);
    this.resultsMaxHeight = false;
    this.predictiveSearchResults.removeAttribute("style");
  }

  //RECOMDO-AI JS START
  async autoFill(e, country) {
    const inputElement = document.getElementById("Search-In-Modal");
    const keyword = inputElement.value;
    const autofillContent = document.getElementById("autofill");
    var matchword = autofillContent.value;
    if (typeof e != "undefined" && e.type === "input") {
      if (
        localStorage.getItem("recomdoai_autofill") == "undefined" ||
        !localStorage.getItem("recomdoai_autofill")
      ) {
        localStorage.setItem("recomdoai_autofill", "");
      }

      //====AUTOFILL API CALL START====
      this.getAutoFill(keyword, country)
        .then((suggestions) => {
          // You can handle suggestions here
        })
        //====AUTOFILL API CALL END====
        .catch((error) => {
          console.error("Error occurred:", error);
        });
      var suggestions = localStorage.getItem("recomdoai_autofill")
        ? JSON.parse(localStorage.getItem("recomdoai_autofill"))
        : [];

      if (suggestions.length > 0) {
        let regex = new RegExp("^" + keyword + ".*", "i");
        var words = suggestions;
        var word = [];
        autofillContent.value = "";
        for (let i = 0; i < words.length; i++) {
          if (words[i].match(regex)) {
            word = words[i];
            var match =
              keyword + words[i].slice(keyword.length, words[i].length);
            autofillContent.value = match;
            break;
          }
        }
      }
    } else if (typeof e != "undefined" && e.type === "keydown") {
      if (e.keyCode === 37) {
        // Left arrow key
        var currentValue = keyword;
        if (currentValue.length > 1) {
          inputElement.value = currentValue.slice(0, -1);
        } else {
          autofillContent.value = "";
          inputElement.value = "";
        }
      } else if (e.keyCode === 39 && matchword) {
        // Right arrow key
        if (matchword.length > 0) {
          var firstLetter = matchword.charAt(keyword.length);
          inputElement.value = keyword + firstLetter;
        }
      } else if (e.keyCode === 9) {
        if (matchword.length > 0) {
          inputElement.value = matchword;
        }
      }
    }
    if (keyword.length < 1) {
      autofillContent.value = "";
    }
  }

  async getAutoFill(keyword, country) {
    return new Promise((resolve, reject) => {
      if (keyword.length == 1) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://shopifybackend.ai/autofill", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
          if (xhr.status === 201 || xhr.status === 200) {
            var response = JSON.parse(xhr.response);
            var suggestions = response.result.data.autofill_names;
            localStorage.setItem(
              "recomdoai_autofill",
              JSON.stringify(suggestions),
            );
            resolve(suggestions);
          } else {
            this.close();
            console.error("some error occurred", xhr.status);
            reject("Some error occurred");
          }
        };
        xhr.onerror = function () {
          this.close();
          console.error("another error occurred");
          reject("Another error occurred");
        };
        xhr.send(JSON.stringify({ keyword: keyword, country, country }));
      }
    });
  }

  async autoComplete() {
    var selectedCountry = Shopify.country;
    if (
      localStorage.getItem("recomdoai_autocomplete") == "undefined" ||
      !localStorage.getItem("recomdoai_autocomplete")
    ) {
      localStorage.setItem("recomdoai_autocomplete", "");
    }
    const inputElement = document.getElementById("Search-In-Modal");
    const keyword = inputElement.value;

    //====AUTOCOMPLETE API CALL START====

    await this.getAutoComplete(keyword, selectedCountry)
      .then((suggestions) => {
        // You can handle suggestions here
      })
      .catch((error) => {
        console.error("Error occurred:", error);
      });

    //====AUTOCOMPLETE API CALL END====
  }

  async getAutoComplete(keyword, selectedCountry) {
    return new Promise((resolve, reject) => {
      if (keyword.length) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://shopifybackend.ai/autocomplete", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
          if (xhr.status === 201 || xhr.status === 200) {
            var response = xhr.response;
            var suggestions = response;
            localStorage.setItem("recomdoai_autocomplete", suggestions);
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
          JSON.stringify({ keyword: keyword, country: selectedCountry }),
        );
      }
    });
  }

  setAutoFillInput() {
    var searchform = document.getElementsByClassName(
      "search search-modal__form",
    );
    var searchInner = searchform[0].querySelector(".field");
    var input = document.createElement("input");
    input.setAttribute(
      "class",
      "search__input field__input autofill-content-style",
    );
    input.setAttribute("id", "autofill");
    input.setAttribute("disabled", "");
    searchInner.appendChild(input);

    // var inputProdOnly = document.createElement("input");
    // inputProdOnly.setAttribute("type", "hidden");
    // inputProdOnly.setAttribute("name", "type");
    // inputProdOnly.setAttribute("value", "product");
    // searchInner.appendChild(inputProdOnly);
  }
  //RECOMDO-AI JS END
}

customElements.define("predictive-search", PredictiveSearch);
