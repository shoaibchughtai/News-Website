window.onload = function () {
  const API_KEY = "bac618054ef44b14b15f568d80e9baea";
  const url = "https://newsapi.org/v2/everything";
  const proxyUrl = "https://api.allorigins.win/get?url=";

  let curSelectedNav = null;
  const searchInput = document.querySelector(".news-input");
  const cardsContainer = document.querySelector(".card-container");
  const newsCardTemplate = document.getElementById("template-news-card");

  // Load default news
  fetchNews("Pakistan");

  // Live search event
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    if (query.length > 2) {
      fetchNews(query);
    }
  });

  // Fetch News Function
  async function fetchNews(query) {
    try {
      const apiUrl = `${url}?q=${query}&apiKey=${API_KEY}`;
      const finalUrl = `${proxyUrl}${encodeURIComponent(apiUrl)}`;

      const res = await fetch(finalUrl);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(`API Error: ${data.message || "Unknown error"}`);
      }

      const jsonData = JSON.parse(data.contents);

      if (jsonData.status === "ok") {
        bindData(jsonData.articles, query);
      } else {
        throw new Error(jsonData.message);
      }
    } catch (error) {
      console.error("❌ Failed to fetch news:", error.message);
      cardsContainer.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
  }

  // Fill Data in News Card
  function bindData(articles, keyword = "") {
    cardsContainer.innerHTML = "";

    articles.forEach((article) => {
      if (!article.urlToImage) return;

      const cardClone = newsCardTemplate.content.cloneNode(true);
      fillDataInCard(cardClone, article, keyword);
      cardsContainer.appendChild(cardClone);
    });
  }

  // Highlight searched word
  function highlight(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }

  // Fill each news card
  function fillDataInCard(cardClone, article, keyword = "") {
    const newsImg = cardClone.querySelector(".news-img");
    const newsTitle = cardClone.querySelector(".news-title");
    const newsSource = cardClone.querySelector(".news-source");
    const newsDesc = cardClone.querySelector(".news-desc");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = highlight(article.title || "", keyword);
    newsDesc.innerHTML = highlight(article.description || "", keyword);

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
    });

    newsSource.innerHTML = `${article.source.name} · ${date}`;

    cardClone.firstElementChild.addEventListener("click", () => {
      window.open(article.url, "_blank");
    });
  }

  // Nav Item Click
  window.onNavItemClick = function (category) {
    fetchNews(category);

    const allNavItems = document.querySelectorAll(".nav-item a");
    allNavItems.forEach((item) => item.classList.remove("active"));

    const clickedItem = Array.from(allNavItems).find(
      (a) => a.innerText.toLowerCase() === category.toLowerCase()
    );
    if (clickedItem) {
      clickedItem.classList.add("active");
    }

    searchInput.value = "";
  };
};
