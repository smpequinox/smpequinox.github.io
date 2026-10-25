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

  /* ---------- Tabs (a race's variants) ---------- */
  // Without this script every panel simply shows, one after another.
  document.querySelectorAll("[data-tabs]").forEach(function (box) {
    var list = box.querySelector("[role=tablist]");
    var tabs = Array.prototype.slice.call(box.querySelectorAll("[role=tab]"));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    var show = function (i) {
      tabs.forEach(function (t, j) { t.setAttribute("aria-selected", i === j ? "true" : "false"); t.tabIndex = i === j ? 0 : -1; });
      panels.forEach(function (p, j) { p.hidden = i !== j; });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(i); });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (d) { var n = (i + d + tabs.length) % tabs.length; show(n); tabs[n].focus(); }
      });
    });
    // Opening a link to a variant or one of its lineages opens that tab first.
    var openHash = function () {
      var target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      var i = target ? panels.findIndex(function (p) { return p.contains(target); }) : -1;
      if (i >= 0) { show(i); target.scrollIntoView(); }
    };
    list.hidden = false;
    box.classList.add("is-ready");
    show(0);
    openHash();
    window.addEventListener("hashchange", openHash);
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      var target = a && document.getElementById(decodeURIComponent(a.hash.slice(1)));
      var i = target ? panels.findIndex(function (p) { return p.contains(target); }) : -1;
      if (i >= 0) show(i);
    });
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

    var editingPins = /[?&]edit-pins\b/.test(location.search);
    mapCanvas.addEventListener("pointerdown", function (e) {
      if (e.target.closest("[data-world-map-zoom]")) return;
      if (editingPins && e.target.closest("[data-pin]")) return;
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

    /* ---------- Touch: the first tap on a pin shows its name, the second opens its page ---------- */
    var lastPointer = "mouse";
    mapCanvas.addEventListener("pointerdown", function (e) { lastPointer = e.pointerType; }, true);
    mapStage.addEventListener("click", function (e) {
      var pin = e.target.closest(".world-map__pin");
      mapStage.querySelectorAll(".world-map__pin.is-active").forEach(function (p) { if (p !== pin) p.classList.remove("is-active"); });
      if (!pin || editingPins || lastPointer !== "touch" || pin.classList.contains("is-active")) return;
      e.preventDefault();
      pin.classList.add("is-active");
    });

    /* ---------- Pin editing mode (open the page with ?edit-pins) ---------- */
    var pinEditor = document.querySelector("[data-pin-editor]");
    if (editingPins && pinEditor) {
      pinEditor.hidden = false;
      mapCanvas.classList.add("is-editing-pins");
      var newSelect = pinEditor.querySelector("[data-pin-new]");
      var changeList = pinEditor.querySelector("[data-pin-changes]");
      var repo = pinEditor.dataset.repo;
      var changes = {};
      var percentAt = function (e) {
        var box = mapStage.getBoundingClientRect();
        var clamp = function (v) { return Math.min(100, Math.max(0, v)); };
        return {
          x: Math.round(clamp((e.clientX - box.left) / box.width * 100) * 10) / 10,
          y: Math.round(clamp((e.clientY - box.top) / box.height * 100) * 10) / 10
        };
      };
      var showChanges = function () {
        var paths = Object.keys(changes);
        changeList.textContent = "";
        if (!paths.length) {
          changeList.innerHTML = '<p class="pin-editor__empty">No pins moved yet.</p>';
          return;
        }
        paths.forEach(function (path) {
          var c = changes[path];
          var lines = "map_x: " + c.x + "\nmap_y: " + c.y;
          var row = document.createElement("div");
          row.className = "pin-editor__change";
          var name = document.createElement("strong");
          name.textContent = c.title;
          var code = document.createElement("pre");
          code.textContent = lines;
          var copy = document.createElement("button");
          copy.type = "button";
          copy.textContent = "Copy";
          copy.addEventListener("click", function () {
            if (navigator.clipboard) navigator.clipboard.writeText(lines).then(function () { copy.textContent = "Copied"; });
          });
          var edit = document.createElement("a");
          edit.href = repo + "/edit/main/" + path;
          edit.target = "_blank";
          edit.rel = "noopener";
          edit.textContent = "Edit file";
          row.append(name, code, copy, edit);
          changeList.appendChild(row);
        });
      };
      var record = function (pin, pos) {
        pin.style.left = pos.x + "%";
        pin.style.top = pos.y + "%";
        pin.classList.toggle("world-map__pin--left", pos.x > 65);
        changes[pin.dataset.pin] = { title: pin.querySelector(".world-map__label").textContent, x: pos.x, y: pos.y };
      };
      var makeDraggable = function (pin) {
        pin.addEventListener("click", function (e) { e.preventDefault(); });
        pin.addEventListener("pointerdown", function (e) {
          e.preventDefault();
          pin.setPointerCapture(e.pointerId);
          pin.classList.add("is-moving");
          var move = function (ev) { record(pin, percentAt(ev)); };
          var stop = function (ev) {
            record(pin, percentAt(ev));
            pin.classList.remove("is-moving");
            pin.removeEventListener("pointermove", move);
            pin.removeEventListener("pointerup", stop);
            pin.removeEventListener("pointercancel", stop);
            showChanges();
          };
          pin.addEventListener("pointermove", move);
          pin.addEventListener("pointerup", stop);
          pin.addEventListener("pointercancel", stop);
        });
      };
      mapStage.querySelectorAll("[data-pin]").forEach(makeDraggable);
      // with a place chosen, a click on the map pins it there
      mapCanvas.addEventListener("click", function (e) {
        if (dragged || !newSelect.value || e.target.closest("a, [data-world-map-zoom]")) return;
        var option = newSelect.options[newSelect.selectedIndex];
        var pin = document.createElement("a");
        pin.className = "world-map__pin";
        pin.href = option.dataset.url;
        pin.dataset.pin = option.value;
        pin.innerHTML = '<span class="world-map__dot" aria-hidden="true"></span><span class="world-map__label"></span>';
        pin.querySelector(".world-map__label").textContent = option.textContent;
        mapStage.appendChild(pin);
        makeDraggable(pin);
        record(pin, percentAt(e));
        option.remove();
        newSelect.value = "";
        showChanges();
      });
    }
  }

  /* ---------- Link names of wiki pages mentioned anywhere in the text ---------- */
  // e.g. "Prince of Arbitus" links "Arbitus". Info boxes, trees and tables link every
  // mention; ordinary page text links only the first mention of each page.
  var indexEl = document.getElementById("wiki-index");
  var mainEl = document.getElementById("main");
  if (indexEl && mainEl) {
    try {
      var here = location.pathname.replace(/index\.html$/, "");
      var pages = JSON.parse(indexEl.textContent).filter(function (p) { return p && p.u !== here; });
      pages.sort(function (a, b) { return b.t.length - a.t.length; });
      // Names match ignoring capitals, apostrophes, quotation marks and hyphens,
      // so "Cni'daria", "Cni’Daria" and "cnidaria" are the same name.
      var marks = /['’‘`ʼ"“”]/g;
      var nameKey = function (s) { return s.toLowerCase().replace(marks, "").replace(/[\s-]+/g, " ").trim(); };
      var byKey = {}, hasMark = {};
      pages.forEach(function (p) { if (p.a) byKey[nameKey(p.t)] = p.u; });   // aliases first,
      pages.forEach(function (p) { if (!p.a) byKey[nameKey(p.t)] = p.u; });  // so titles win
      pages.forEach(function (p) { if (p.t.search(marks) >= 0) hasMark[nameKey(p.t)] = true; });
      var namePattern = function (t) {
        return t.split("").map(function (ch) {
          if (/['’‘`ʼ"“”]/.test(ch)) return "['’‘`ʼ\"“”]?";
          if (/[\s-]/.test(ch)) return "[\\s-]+";
          return ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }).join("").replace(/(\[\\s-\]\+)+/g, "[\\s-]+");
      };
      if (pages.length) {
        var nameRe = new RegExp("(^|[^\\p{L}\\p{N}_])(" + pages.map(function (p) { return namePattern(p.t); }).join("|") + ")(?![\\p{L}\\p{N}_])", "giu");
        var skip = "a, button, h1, h2, h3, h4, h5, h6, code, pre, script, style, .calendar-now, .world-map, .toc, [data-no-autolink]";
        var everyMention = ".facts, .bond-tree, .rank-tree, table";
        var linkedOnce = {};
        mainEl.querySelectorAll("a[href]").forEach(function (a) { linkedOnce[a.getAttribute("href")] = true; });
        var walker = document.createTreeWalker(mainEl, NodeFilter.SHOW_TEXT, {
          acceptNode: function (n) {
            if (!n.nodeValue.trim() || !n.parentElement || n.parentElement.closest(skip)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        });
        var textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        textNodes.forEach(function (node) {
          var text = node.nodeValue, last = 0, m, frag = null;
          var all = !!node.parentElement.closest(everyMention);
          nameRe.lastIndex = 0;
          while ((m = nameRe.exec(text))) {
            var key = nameKey(m[2]);
            var url = byKey[key];
            // all-lowercase mentions of ordinary words ("the blade", "lament") stay plain text;
            // made-up names with an apostrophe ("cnidaria") still link
            if (!url || (m[2] === m[2].toLowerCase() && !hasMark[key])) continue;
            if (!all && linkedOnce[url]) continue;
            var start = m.index + m[1].length;
            frag = frag || document.createDocumentFragment();
            frag.appendChild(document.createTextNode(text.slice(last, start)));
            var a = document.createElement("a");
            a.href = url;
            a.textContent = m[2];
            frag.appendChild(a);
            last = start + m[2].length;
            linkedOnce[url] = true;
          }
          if (frag) {
            frag.appendChild(document.createTextNode(text.slice(last)));
            node.parentNode.replaceChild(frag, node);
          }
        });
      }
    } catch (err) { /* names stay as plain text */ }
  }

  /* ---------- Calendar: count in-world time forward from the known date in _config.yml ---------- */
  var calNow = document.querySelector("[data-calendar-now]");
  var calConfig = document.querySelector("[data-calendar-config]");
  if (calNow && calConfig) {
    try {
      var calData = JSON.parse(calConfig.textContent);
      var cal = calData.calendar, months = calData.months;
      var startParts = String(cal.start_date).split("-");
      var calStart = new Date(+startParts[0], +startParts[1] - 1, +startParts[2]);
      var dayMs = 86400000;
      var passed = Math.floor((Date.now() - calStart.getTime()) / dayMs / cal.days_per_month);
      if (passed >= 0 && months.length === 12 && cal.days_per_month > 0) {
        var startTotal = cal.start_year * 12 + (cal.start_month - 1);
        var total = startTotal + passed;
        var year = Math.floor(total / 12);
        var monthIndex = total % 12;
        var perSeason = cal.months_per_season || 6;
        var seasons = cal.seasons;
        var seasonAt = function (t) {
          var shift = Math.floor(t / perSeason) - Math.floor(startTotal / perSeason);
          return seasons[(((cal.start_season - 1 + shift) % seasons.length) + seasons.length) % seasons.length];
        };
        var eraFor = function (y) {
          var found = null;
          cal.eras.forEach(function (e) { if (y >= e.start_year && y < e.start_year + cal.years_per_era) found = e; });
          return found;
        };
        var era = eraFor(year);
        var season = seasonAt(total);
        var realDate = function (t) {
          return new Date(calStart.getTime() + Math.floor((t - startTotal) * cal.days_per_month) * dayMs)
            .toLocaleDateString(undefined, { month: "long", day: "numeric" });
        };
        var nextSeasonTotal = (Math.floor(total / perSeason) + 1) * perSeason;
        var nextSeason = seasonAt(nextSeasonTotal);
        var firstEra = cal.eras[0];
        var eraYear = era ? year - era.start_year + 1
          : ((((year - firstEra.start_year) % cal.years_per_era) + cal.years_per_era) % cal.years_per_era) + 1;

        calNow.querySelector("[data-calendar-date]").textContent =
          months[monthIndex] + " " + year + (era && era.abbr ? " " + era.abbr : "");
        calNow.querySelector("[data-calendar-detail]").textContent =
          season.name + " (" + season.kind + ") \u00b7 " +
          "year " + eraYear + " of " + cal.years_per_era + " of the era of " + (era ? era.name : cal.unnamed_era);
        var next = calNow.querySelector("[data-calendar-next]");
        if (next) next.textContent = months[(monthIndex + 1) % 12] + " begins around " + realDate(total + 1) + ". " +
          nextSeason.name + " (" + nextSeason.kind + ") begins in " + months[nextSeasonTotal % 12] + ", around " + realDate(nextSeasonTotal) + ".";
        if (next) next.hidden = false;
        document.querySelectorAll("[data-calendar] tr[data-month]").forEach(function (r) {
          r.classList.toggle("is-current", +r.dataset.month === monthIndex + 1);
        });
      }
    } catch (err) { /* keep the date written into the page */ }
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
