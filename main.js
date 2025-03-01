// Theme Toggle
const themeToggle = document.getElementById("themeToggle");

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark-mode")
  );
});

// Crypto Ticker
const ticker = document.getElementById("ticker");

async function fetchCurrencyPrices() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
    );
    const data = await response.json();

    // إنشاء عناصر HTML لكل عملة
    const prices = data
      .map((coin) => {
        return `<div class="ticker-item">
                <img src="${coin.image}" alt="${coin.name}" class="coin-logo">
                <span>${coin.name} (${coin.symbol.toUpperCase()})</span>
                <span class="price">$${coin.current_price.toLocaleString()}</span>
                <span class="${
                  coin.price_change_percentage_24h > 0
                    ? "change-positive"
                    : "change-negative"
                }">${coin.price_change_percentage_24h.toFixed(2)}%</span>
              </div>`;
      })
      .join("");

    // تحديث شريط العملات
    const ticker = document.getElementById("ticker");
    ticker.innerHTML = prices + prices; // تكرار العناصر لإنشاء حركة مستمرة
  } catch (error) {
    console.error("Error fetching currency prices:", error);
    const ticker = document.getElementById("ticker");
    ticker.innerHTML = "<div style='color: red;'>Error loading data.</div>";
  }
}

// تحديث الأسعار يوميًا
fetchCurrencyPrices();
setInterval(fetchCurrencyPrices, 86400000); // تحديث يومي

const apiKey = "95837298722ea8ce73d6f03caee38065"; // ضع مفتاح API الخاص بك هنا
const apiUrl = `https://gnews.io/api/v4/search?q=bitcoin&token=${apiKey}&lang=en&max=5&sortby=publishedAt`;

async function fetchBitcoinNews() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    const newsContainer = document.getElementById("newsContainer");
    newsContainer.innerHTML = ""; // تفريغ المحتوى السابق

    // عرض آخر 5 أخبار
    data.articles.forEach((article) => {
      const newsItem = document.createElement("div");
      newsItem.classList.add("news-item");

      newsItem.innerHTML = `
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${
                  article.description || "No description available."
                }</p>
                <a href="${
                  article.url
                }" target="_blank" class="toggle-article" style="text-decoration: none;">Read more</a>
                <span class="news-timestamp">${new Date(
                  article.publishedAt
                ).toLocaleString()}</span>
            `;

      newsContainer.appendChild(newsItem);
    });
  } catch (error) {
    console.error("Error fetching Bitcoin news:", error);
    document.getElementById("newsContainer").innerHTML =
      "<p style='color: red;'>Error loading news. Please try again later.</p>";
  }
}

// تحديث الأخبار كل 24 ساعة
fetchBitcoinNews();
setInterval(fetchBitcoinNews, 24 * 60 * 60 * 1000); // 24 ساعة

document.addEventListener("DOMContentLoaded", function () {
  const toggleButtons = document.querySelectorAll(".toggle-article");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const content = this.nextElementSibling; // العنصر التالي وهو محتوى المقال
      const isVisible = content.style.display === "block";

      // تبديل العرض
      content.style.display = isVisible ? "none" : "block";
      this.textContent = isVisible ? "Read More" : "Read Less";
    });
  });
});

// نافذة سياسة الخصوصية
const modal = document.getElementById("privacyModal");
const openModalButton = document.querySelector(".footer-link");
const closeModalButton = modal.querySelector(".close");

// فتح النافذة
openModalButton.addEventListener("click", (e) => {
  e.preventDefault(); // منع التنقل
  modal.style.display = "block";
});

// غلق النافذة
closeModalButton.addEventListener("click", () => {
  modal.style.display = "none";
});

// غلق النافذة عند الضغط خارجها
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Handle Contact Form Submission
const contactForm = document.getElementById("contact-form");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent the page from refreshing
  alert("Your message has been sent successfully! We'll get back to you soon.");
  contactForm.reset(); // Reset form fields
});



