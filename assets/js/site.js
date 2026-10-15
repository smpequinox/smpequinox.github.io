/* Equinox SMP — small enhancements. The site works without this file;
   it adds the carousel, the event viewer, the page outline, and the mobile menu. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("wiki-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.querySelector(".menu-toggle__label").textContent = open ? "Close" : "Menu";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) document.body.classList.remove("nav-open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.querySelector(".menu-toggle__label").textContent = "Menu";
        toggle.focus();
      }
    });
  } else if (toggle) {
    toggle.hidden = true;
  }

  /* ---------- Wide tables scroll inside their own box ---------- */
  document.querySelectorAll(".prose table").forEach(function (table) {
    if (table.parentElement.classList.contains("table-wrap")) return;
    var wrap = document.createElement("div");
    wrap.className = "table-wrap";
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  /* ---------- "On this page" outline ---------- */
  var tocList = document.querySelector("[data-toc]");
  if (tocList) {
    var headings = document.querySelectorAll(".doc__main h2, .doc__main h3");
    var slugCounts = {};
    var items = [];
    headings.forEach(function (h) {
      if (!h.id) {
        var base = h.textContent.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") || "section";
        slugCounts[base] = (slugCounts[base] || 0) + 1;
        h.id = slugCounts[base] > 1 ? base + "-" + slugCounts[base] : base;
      }
      var li = document.createElement("li");
      li.className = h.tagName === "H3" ? "toc--h3" : "toc--h2";
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      tocList.appendChild(li);
      items.push({ h: h, a: a });
    });
    if (headings.length < 3) {
      tocList.closest(".doc__toc").hidden = true;
    } else if ("IntersectionObserver" in window) {
      var active = null;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var match = items.find(function (i) { return i.h === entry.target; });
            if (match) {
              if (active) active.classList.remove("is-active");
              active = match.a;
              active.classList.add("is-active");
            }
          }
        });
      }, { rootMargin: "-15% 0px -70% 0px" });
      items.forEach(function (i) { io.observe(i.h); });
    }
  }

  /* ---------- Copy server address ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var label = btn.querySelector("[data-copy-label]");
      var done = function () {
        if (!label) return;
        label.textContent = "Copied: " + value;
        setTimeout(function () { label.textContent = value; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, function () { window.prompt("Server address:", value); });
      } else {
        window.prompt("Server address:", value);
      }
    });
  });

  /* ---------- Recent events carousel ---------- */
  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var track = carousel.querySelector("[data-carousel-track]");
    var slides = Array.prototype.slice.call(track.children);
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dots] button"));
    var section = carousel.closest(".events");
    var prev = section.querySelector("[data-carousel-prev]");
    var next = section.querySelector("[data-carousel-next]");
    var index = 0;
    var timer = null;
    var interval = parseInt(carousel.getAttribute("data-interval"), 10) || 7000;

    var go = function (i) {
      index = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[index].offsetLeft - track.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
      mark();
    };
    var mark = function () {
      dots.forEach(function (d, n) { d.setAttribute("aria-current", n === index ? "true" : "false"); });
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var start = function () {
      if (reduceMotion || slides.length < 2) return;
      stop();
      timer = setInterval(function () { go(index + 1); }, interval);
    };

    if (prev) prev.addEventListener("click", function () { go(index - 1); start(); });
    if (next) next.addEventListener("click", function () { go(index + 1); start(); });
    dots.forEach(function (d, n) { d.addEventListener("click", function () { go(n); start(); }); });

    // keep the dots in sync when people swipe
    var scrollTimer;
    track.addEventListener("scroll", function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var w = track.clientWidth || 1;
        index = Math.round(track.scrollLeft / w);
        mark();
      }, 80);
    }, { passive: true });

    // pause while someone is looking or interacting
    section.addEventListener("mouseenter", stop);
    section.addEventListener("mouseleave", start);
    section.addEventListener("focusin", stop);
    section.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });

    mark();
    start();
  }

  /* ---------- Event viewer (lightbox) ---------- */
  var dialog = document.querySelector("[data-lightbox-dialog]");
  if (dialog && typeof dialog.showModal === "function") {
    var lbImg = dialog.querySelector("[data-lb-img]");
    var lbTitle = dialog.querySelector("[data-lb-title]");
    var lbDate = dialog.querySelector("[data-lb-date]");
    var lbSummary = dialog.querySelector("[data-lb-summary]");
    var lbLink = dialog.querySelector("[data-lb-link]");

    document.querySelectorAll("[data-event-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var img = btn.getAttribute("data-image");
        var link = btn.getAttribute("data-link");
        if (img) { lbImg.src = img; lbImg.alt = btn.getAttribute("data-title") || ""; lbImg.hidden = false; }
        else { lbImg.removeAttribute("src"); lbImg.hidden = true; }
        lbTitle.textContent = btn.getAttribute("data-title") || "";
        lbDate.textContent = btn.getAttribute("data-date") || "";
        lbDate.hidden = !lbDate.textContent;
        lbSummary.textContent = btn.getAttribute("data-summary") || "";
        lbSummary.hidden = !lbSummary.textContent;
        if (link) { lbLink.href = link; lbLink.hidden = false; } else { lbLink.hidden = true; }
        dialog.showModal();
      });
    });
    // click outside the panel closes it
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  }
})();
