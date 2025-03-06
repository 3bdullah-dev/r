//                          HTML الكود الخاص بالجافاسكربت الخاص بالصفحة الرئيسية                         //

let visitStartTime = Date.now();
let userLocation = "غير معروف";
const GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzTFdRoFIOmxtuAERwjFDFtUJLPPrf53Y3mRHJlCQw4en6dk4LI27Knjbw-ZAdZarY3oA/exec";

let lastSentTimestamp = null; // متغير لتجنب إرسال بيانات متكررة

// 🟢 الحصول على موقع المستخدم (الدولة + المدينة)
async function getUserLocation() {
  if (userLocation !== "غير معروف") return; // إذا كانت البيانات موجودة، لا تقم بجلبها مرة أخرى

  try {
    const response = await fetch("https://ipinfo.io/json");
    const data = await response.json();

    // جلب اسم الدولة بالكامل
    const countryResponse = await fetch(
      `https://restcountries.com/v3.1/alpha/${data.country}`
    );
    const countryData = await countryResponse.json();

    let countryName = countryData[0]?.name?.common || "غير معروف";
    let city = data.city || "غير معروف";

    userLocation = `${countryName}, ${city}`; // تخزين الدولة + المدينة معًا
    console.log("تم تحديد الموقع:", userLocation);
  } catch (error) {
    console.error("❌ خطأ في جلب الموقع:", error);
  }
}

// 🟢 وظيفة تسجيل البيانات
async function sendVisitData() {
  await getUserLocation(); // تأكد من أن بيانات الموقع محملة

  const visitEndTime = Date.now();
  const visitDuration = visitEndTime - visitStartTime;

  if (visitDuration > 5000 && userLocation != "غير معروف") {
    const data = {
      country: userLocation, // إرسال (الدولة + المدينة)
      timestamp: new Date(visitEndTime).toISOString(),
      timeSpent: visitDuration,
    };

    // ✅ منع إرسال بيانات مكررة إذا كان الوقت متشابهًا جدًا مع آخر إرسال
    if (lastSentTimestamp && Math.abs(visitEndTime - lastSentTimestamp) < 100) {
      console.log("🚫 تم منع إرسال البيانات المكررة");
      return;
    }

    console.log("✅ إرسال البيانات:", data);
    navigator.sendBeacon(GOOGLE_SHEET_URL, JSON.stringify(data));

    lastSentTimestamp = visitEndTime; // حفظ آخر وقت إرسال لمنع التكرار
  } else {
    console.log(
      "⏳ لم يتم إرسال البيانات: مدة الزيارة قصيرة أو الموقع غير محدد."
    );
  }
}

// 🟢 تحميل بيانات الموقع مرة واحدة
getUserLocation().then(() => {
  window.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "hidden") {
      await sendVisitData();
    } else if (document.visibilityState === "visible") {
      visitStartTime = Date.now();
    }
  });

  window.addEventListener("pagehide", sendVisitData);
});

// إعادة تعيين وقت البداية عند العودة إلى الصفحة
function resetVisitStartTime() {
  visitStartTime = Date.now();
}

// تسجيل البيانات عند إغلاق الصفحة أو مغادرة التبويبة
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    sendVisitData();
  } else if (document.visibilityState === "visible") {
    resetVisitStartTime();
  }
});

window.addEventListener("pagehide", sendVisitData);

// إعادة تعيين وقت البداية عند التركيز على الصفحة
window.addEventListener("focus", resetVisitStartTime);

async function fetchArticles() {
  const spaceId = "1xctpowg2b6z";
  const accessToken = "np4JYIYcZ2zUEs1D_CDt7k6dHeBcQAEImSirUppOzHE";
  const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=article`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    displayArticles(data.items);
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
}

function extractTextFromRichText(richText) {
  if (!richText || !richText.content) return ""; // تجنب الأخطاء إذا لم يكن هناك محتوى
  return richText.content
    .map((block) =>
      block.content ? block.content.map((text) => text.value).join(" ") : ""
    )
    .join("\n");
}

function displayArticles(articles) {
  const container = document.getElementById("articles");
  container.innerHTML = "";

  articles.forEach((article) => {
    const title = article.fields.title;
    const content = extractTextFromRichText(article.fields.content);

    const articleDiv = document.createElement("div");
    articleDiv.className = "article";

    const titleElement = document.createElement("h2");
    titleElement.textContent = title;

    const contentElement = document.createElement("p");
    contentElement.className = "article-content";
    contentElement.innerHTML = content;

    const button = document.createElement("button");
    button.className = "toggle-article";
    button.textContent = "Read More";

    button.addEventListener("click", function () {
      if (
        contentElement.style.display === "none" ||
        contentElement.style.display === ""
      ) {
        contentElement.style.display = "block";
        button.textContent = "Read Less";
      } else {
        contentElement.style.display = "none";
        button.textContent = "Read More";
      }
    });

    articleDiv.appendChild(titleElement);
    articleDiv.appendChild(button);
    articleDiv.appendChild(contentElement);
    container.appendChild(articleDiv);
  });
}

fetchArticles();
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- //



// Dark Mode Toggle
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

const apiKey = "6be0496535fbb284d25d74ac33658e81"; // ضع مفتاح API الخاص بك هنا
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

const menuToggle = document.getElementById("menuToggle");
const topLinks = document.getElementById("top-links");
const navLinks = document.querySelectorAll(".nav-link");

menuToggle.addEventListener("click", function () {
  topLinks.classList.toggle("active");
});

navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    topLinks.classList.remove("active");
  });
});
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- //
