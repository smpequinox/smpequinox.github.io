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

  /* ---------- World map: zoom, pan, and click a blank spot to see its map_x / map_y ---------- */
  var mapCanvas = document.querySelector("[data-world-map]");
  if (mapCanvas) {
    var mapStage = mapCanvas.querySelector("[data-world-map-stage]");
    var mapCoords = mapCanvas.querySelector("[data-world-map-coords]");
    var zoomBox = mapCanvas.querySelector("[data-world-map-zoom]");
    var zoomIn = zoomBox.querySelector('[data-zoom="in"]');
    var zoomOut = zoomBox.querySelector('[data-zoom="out"]');
    var MAX_ZOOM = 6;
    var view = { z: 1, x: 0, y: 0 };
    var pointers = {};
    var gesture = null;
    var dragged = false;

    var applyView = function (animate) {
      var w = mapCanvas.clientWidth, h = mapCanvas.clientHeight;
      view.z = Math.min(MAX_ZOOM, Math.max(1, view.z));
      // keep the map filling the frame
      view.x = Math.min(0, Math.max(w - w * view.z, view.x));
      view.y = Math.min(0, Math.max(h - h * view.z, view.y));
      mapCanvas.classList.toggle("is-animating", !!animate && !reduceMotion);
      mapCanvas.classList.toggle("is-zoomed", view.z > 1);
      mapCanvas.style.setProperty("--z", view.z);
      mapStage.style.transform = "translate(" + view.x + "px, " + view.y + "px) scale(" + view.z + ")";
      zoomIn.disabled = view.z >= MAX_ZOOM;
      zoomOut.disabled = view.z <= 1;
    };
    // zoom by a factor, keeping the point (px, py) inside the frame still
    var zoomAt = function (factor, px, py, animate) {
      var z = Math.min(MAX_ZOOM, Math.max(1, view.z * factor));
      view.x = px - (px - view.x) * (z / view.z);
      view.y = py - (py - view.y) * (z / view.z);
      view.z = z;
      applyView(animate);
    };
    var localPoint = function (e) {
      var box = mapCanvas.getBoundingClientRect();
      return { x: e.clientX - box.left, y: e.clientY - box.top };
    };

    zoomBox.hidden = false;
    applyView();
    zoomBox.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var cx = mapCanvas.clientWidth / 2, cy = mapCanvas.clientHeight / 2;
      if (btn.dataset.zoom === "in") zoomAt(1.6, cx, cy, true);
      else if (btn.dataset.zoom === "out") zoomAt(1 / 1.6, cx, cy, true);
      else { view = { z: 1, x: 0, y: 0 }; applyView(true); }
    });
    mapCanvas.addEventListener("wheel", function (e) {
      if (e.target.closest("[data-world-map-zoom]")) return;
      if (view.z <= 1 && e.deltaY > 0) return; // fully zoomed out: let the page scroll
      e.preventDefault();
      var p = localPoint(e);
      zoomAt(Math.exp(-e.deltaY * 0.0015), p.x, p.y, false);
    }, { passive: false });

    mapCanvas.addEventListener("pointerdown", function (e) {
      if (e.target.closest("[data-world-map-zoom]")) return;
      pointers[e.pointerId] = localPoint(e);
      var ids = Object.keys(pointers);
      if (ids.length === 1) {
        dragged = false;
        gesture = { type: "pan", start: pointers[e.pointerId], x: view.x, y: view.y };
      } else if (ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        gesture = { type: "pinch", dist: Math.hypot(a.x - b.x, a.y - b.y) };
        dragged = true;
      }
    });
    mapCanvas.addEventListener("pointermove", function (e) {
      if (!(e.pointerId in pointers) || !gesture) return;
      var p = pointers[e.pointerId] = localPoint(e);
      if (gesture.type === "pan") {
        var dx = p.x - gesture.start.x, dy = p.y - gesture.start.y;
        if (!dragged && Math.hypot(dx, dy) < 5) return;
        if (!dragged) {
          dragged = true;
          if (view.z > 1) { mapCanvas.setPointerCapture(e.pointerId); mapCanvas.classList.add("is-dragging"); }
        }
        if (view.z > 1) { view.x = gesture.x + dx; view.y = gesture.y + dy; applyView(false); }
      } else {
        var ids = Object.keys(pointers), a = pointers[ids[0]], b = pointers[ids[1]];
        var dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (gesture.dist > 0) zoomAt(dist / gesture.dist, (a.x + b.x) / 2, (a.y + b.y) / 2, false);
        gesture.dist = dist;
      }
    });
    var endPointer = function (e) {
      delete pointers[e.pointerId];
      mapCanvas.classList.remove("is-dragging");
      var ids = Object.keys(pointers);
      gesture = ids.length === 1 ? { type: "pan", start: pointers[ids[0]], x: view.x, y: view.y } : null;
    };
    mapCanvas.addEventListener("pointerup", endPointer);
    mapCanvas.addEventListener("pointercancel", endPointer);

    mapCanvas.addEventListener("click", function (e) {
      // a drag or pinch is not a click on a pin or on the map
      if (dragged) { e.preventDefault(); dragged = false; return; }
      if (e.target.closest("a, [data-world-map-zoom]")) return;
      var box = mapStage.getBoundingClientRect();
      var x = ((e.clientX - box.left) / box.width * 100).toFixed(1);
      var y = ((e.clientY - box.top) / box.height * 100).toFixed(1);
      mapCoords.textContent = "map_x: " + x + "   map_y: " + y;
      mapCoords.hidden = false;
    }, true);
    window.addEventListener("resize", function () { applyView(false); });
  }

  /* ---------- Calendar: highlight the in-world month for today's date ---------- */
  var calendar = document.querySelector("[data-calendar]");
  if (calendar) {
    var row = calendar.querySelector('[data-month="' + (new Date().getMonth() + 1) + '"]');
    var now = document.querySelector("[data-calendar-now]");
    if (row) {
      row.classList.add("is-current");
      if (now) {
        now.innerHTML = "It is currently <strong></strong> in Equinox.";
        now.querySelector("strong").textContent = row.querySelector(".calendar__name").textContent;
        now.hidden = false;
      }
    }
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
