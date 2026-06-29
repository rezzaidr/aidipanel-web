(function () {
        var root = document.documentElement;
        function setTheme(t) {
          root.setAttribute("data-theme", t);
          try {
            localStorage.setItem("aidipanel-theme", t);
          } catch (e) {}
        }
        try {
          var s = localStorage.getItem("aidipanel-theme");
          if (s) setTheme(s);
        } catch (e) {}
        document.getElementById("theme").addEventListener("click", function () {
          setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
        });

        // nav background once scrolled past the top (IntersectionObserver, no scroll handler)
        var nav = document.getElementById("nav"),
          sentinel = document.getElementById("top-sentinel");
        new IntersectionObserver(
          function (es) {
            nav.classList.toggle("scrolled", !es[0].isIntersecting);
          },
          { rootMargin: "-8px 0px 0px 0px" },
        ).observe(sentinel);

        // copy buttons
        var CMD = "bash <(curl -fsSL https://get.aidipanel.com)";
        function wireCopy(id) {
          var b = document.getElementById(id);
          if (!b) return;
          b.addEventListener("click", function () {
            if (!navigator.clipboard) return;
            navigator.clipboard.writeText(CMD).then(function () {
              b.classList.add("ok");
              b.innerHTML = '<svg class="ic"><use href="#i-check"/></svg>';
              setTimeout(function () {
                b.classList.remove("ok");
                b.innerHTML = '<svg class="ic"><use href="#i-copy"/></svg>';
              }, 1500);
            }).catch(function () {});
          });
        }
        wireCopy("copy");
        wireCopy("copy2");

        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

        // reveal on scroll
        var io = new IntersectionObserver(
          function (es) {
            es.forEach(function (e) {
              if (e.isIntersecting) {
                e.target.classList.add("in");
                io.unobserve(e.target);
              }
            });
          },
          { threshold: 0.16 },
        );
        document.querySelectorAll(".rv,.rv-lines,.stage,.stage-f").forEach(function (el) {
          io.observe(el);
        });

        // count-up KPIs when in view
        function countUp(el) {
          var to = parseFloat(el.dataset.to),
            dec = parseInt(el.dataset.dec || 0, 10),
            dur = 1100,
            t0 = null;
          if (reduce) {
            el.textContent = to.toFixed(dec);
            return;
          }
          function step(ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / dur, 1),
              e = 1 - Math.pow(1 - p, 3);
            el.textContent = (to * e).toFixed(dec);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = to.toFixed(dec);
          }
          requestAnimationFrame(step);
        }
        var cio = new IntersectionObserver(
          function (es) {
            es.forEach(function (e) {
              if (e.isIntersecting) {
                countUp(e.target);
                cio.unobserve(e.target);
              }
            });
          },
          { threshold: 0.6 },
        );
        document.querySelectorAll(".ct").forEach(function (el) {
          cio.observe(el);
        });
        // live "See the panel" dashboard - vanilla SVG, sample data that ticks like real-time
        (function () {
          var stage = document.getElementById("stage");
          if (!stage) return;
          var N = 24,
            W = 520,
            H = 150;
          var cached = [],
            origin = [];
          (function () {
            var c = 92,
              o = 18;
            for (var i = 0; i < N; i++) {
              c = Math.max(55, Math.min(120, c + (Math.random() - 0.5) * 22));
              o = Math.max(8, Math.min(34, o + (Math.random() - 0.5) * 10));
              cached.push(c);
              origin.push(o);
            }
          })();
          function rw(a, vol, lo, hi) {
            return Math.max(lo, Math.min(hi, a[a.length - 1] + (Math.random() - 0.5) * vol));
          }
          function path(a, close) {
            var d = "";
            for (var i = 0; i < a.length; i++) {
              var x = (i / (a.length - 1)) * W,
                y = H - a[i];
              d += (i ? " L" : "M") + x.toFixed(1) + "," + y.toFixed(1);
            }
            if (close) d += " L" + W + "," + H + " L0," + H + " Z";
            return d;
          }
          var cFill = document.getElementById("cFill"),
            cLine = document.getElementById("cLine"),
            oLine = document.getElementById("oLine");
          function setD(el, d) {
            if (!el) return;
            el.setAttribute("d", d);
            el.style.d = 'path("' + d + '")';
          }
          function draw() {
            setD(cFill, path(cached, true));
            setD(cLine, path(cached, false));
            setD(oLine, path(origin, false));
          }
          draw();
          var kReq = document.getElementById("kReq"),
            kHit = document.getElementById("kHit"),
            kBw = document.getElementById("kBw"),
            kData = document.getElementById("kData");
          var kpi = { req: 18.4, hit: 94.2, bw: 2.7, data: 312 };
          function tween(el, from, to, dec, dur) {
            if (!el) return;
            var t0 = null;
            (function s(ts) {
              if (!t0) t0 = ts;
              var p = Math.min((ts - t0) / dur, 1),
                e = 1 - Math.pow(1 - p, 3),
                v = from + (to - from) * e;
              el.textContent = v.toFixed(dec);
              if (p < 1) requestAnimationFrame(s);
            })(performance.now());
          }
          var donutArc = document.getElementById("donutArc"),
            donutLbl = document.getElementById("donutLbl"),
            C = 263.9;
          function setDonut(pct) {
            if (donutArc) donutArc.style.strokeDashoffset = (C * (1 - pct / 100)).toFixed(1);
            if (donutLbl) donutLbl.textContent = pct.toFixed(1);
          }
          function tick() {
            cached.shift();
            cached.push(rw(cached, 22, 55, 120));
            origin.shift();
            origin.push(rw(origin, 10, 8, 34));
            draw();
            var nReq = kpi.req + 0.1 + Math.random() * 0.3;
            tween(kReq, kpi.req, nReq, 1, 520);
            kpi.req = nReq;
            var nHit = Math.max(93.8, Math.min(94.7, kpi.hit + (Math.random() - 0.5) * 0.5));
            tween(kHit, kpi.hit, nHit, 1, 520);
            kpi.hit = nHit;
            var nBw = kpi.bw + (Math.random() < 0.5 ? 0 : 0.1);
            tween(kBw, kpi.bw, nBw, 1, 520);
            kpi.bw = nBw;
            var nData = Math.max(300, Math.min(330, kpi.data + (Math.random() - 0.4) * 4));
            tween(kData, kpi.data, nData, 0, 520);
            kpi.data = nData;
            setDonut(nHit);
          }
          if (reduce) {
            if (kReq) kReq.textContent = "18.4";
            if (kHit) kHit.textContent = "94.2";
            if (kBw) kBw.textContent = "2.7";
            if (kData) kData.textContent = "312";
            setDonut(94.2);
            return;
          }
          var timer = null,
            started = false,
            sectionVisible = false;
          function startTick() {
            if (!timer && sectionVisible && !document.hidden) timer = setInterval(tick, 4000);
          }
          function stopTick() {
            if (timer) { clearInterval(timer); timer = null; }
          }
          new IntersectionObserver(
            function (es) {
              es.forEach(function (e) {
                sectionVisible = e.isIntersecting;
                if (sectionVisible) {
                  if (!started) { started = true; setDonut(kpi.hit); }
                  startTick();
                } else {
                  stopTick();
                }
              });
            },
            { threshold: 0.2 },
          ).observe(stage);
          document.addEventListener("visibilitychange", function () {
            if (document.hidden) { stopTick(); } else { startTick(); }
          });
        })();


        // interactive See the panel tabs
        (function () {
          var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-panel-tab]"));
          var views = Array.prototype.slice.call(document.querySelectorAll("[data-panel-view]"));
          if (!tabs.length || !views.length) return;
          var meta = {
            dashboard: { ip: "203.0.113.10", avatar: "A" },
            sites: { ip: "203.0.113.10", avatar: "A" },
            admin: { ip: "203.0.113.10", avatar: "A" }
          };
          var ip = document.getElementById("panelPreviewIp");
          var avatar = document.getElementById("panelPreviewAvatar");
          var hintPlayed = false;
          var hintTimers = [];
          function clearTabHints() {
            hintTimers.forEach(function (t) { clearTimeout(t); });
            hintTimers = [];
            tabs.forEach(function (tab) {
              tab.classList.remove("tab-hint", "tab-hint-late");
            });
          }
          function playTabHints() {
            if (hintPlayed || reduce) return;
            hintPlayed = true;
            var hintTabs = tabs.filter(function (tab) { return tab.dataset.panelTab !== "dashboard"; });
            hintTabs.forEach(function (tab, index) {
              var timer = setTimeout(function () {
                if (tab.classList.contains("on")) return;
                tab.classList.remove("tab-hint", "tab-hint-late");
                void tab.offsetWidth;
                tab.classList.add("tab-hint");
                if (index > 0) tab.classList.add("tab-hint-late");
              }, 260 + index * 360);
              hintTimers.push(timer);
            });
            hintTimers.push(setTimeout(clearTabHints, 3600));
          }
          var panelHeightHost = document.querySelector("#how .wbody");
          var dashboardView = document.querySelector('[data-panel-view="dashboard"]');
          var resizePanelTimer = null;
          function syncPanelPreviewHeight() {
            if (!panelHeightHost || !dashboardView) return;
            var wasHidden = dashboardView.hidden;
            var previousStyle = dashboardView.getAttribute("style");
            if (wasHidden) dashboardView.hidden = false;
            dashboardView.style.position = wasHidden ? "absolute" : dashboardView.style.position;
            dashboardView.style.visibility = wasHidden ? "hidden" : dashboardView.style.visibility;
            dashboardView.style.pointerEvents = "none";
            dashboardView.style.height = "auto";
            dashboardView.style.overflow = "visible";
            dashboardView.style.width = "100%";
            var height = Math.ceil(dashboardView.scrollHeight);
            if (height > 0) panelHeightHost.style.setProperty("--panel-preview-height", height + "px");
            if (previousStyle === null) dashboardView.removeAttribute("style");
            else dashboardView.setAttribute("style", previousStyle);
            if (wasHidden) dashboardView.hidden = true;
          }
          function schedulePanelHeightSync() {
            if (resizePanelTimer) clearTimeout(resizePanelTimer);
            resizePanelTimer = setTimeout(syncPanelPreviewHeight, 120);
          }
          syncPanelPreviewHeight();
          setTimeout(syncPanelPreviewHeight, 350);
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(syncPanelPreviewHeight).catch(function () {});
          }
          window.addEventListener("resize", schedulePanelHeightSync, { passive: true });
          var hintHost = document.querySelector("#how .stage");
          if (hintHost && "IntersectionObserver" in window) {
            var hintObserver = new IntersectionObserver(function (entries) {
              entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                hintObserver.disconnect();
                hintTimers.push(setTimeout(playTabHints, 700));
              });
            }, { threshold: 0.38 });
            hintObserver.observe(hintHost);
          } else {
            hintTimers.push(setTimeout(playTabHints, 1200));
          }
          function activate(name) {
            tabs.forEach(function (tab) {
              var on = tab.dataset.panelTab === name;
              tab.classList.toggle("on", on);
              tab.setAttribute("aria-selected", on ? "true" : "false");
            });
            views.forEach(function (view) {
              var on = view.dataset.panelView === name;
              view.classList.toggle("active", on);
              view.hidden = !on;
            });
            if (meta[name]) {
              if (ip) ip.textContent = meta[name].ip;
              if (avatar) avatar.textContent = meta[name].avatar;
            }
          }
          tabs.forEach(function (tab, index) {
            tab.addEventListener("click", function () { clearTabHints(); activate(tab.dataset.panelTab); });
            tab.addEventListener("keydown", function (e) {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              var next = e.key === "ArrowRight" ? index + 1 : index - 1;
              if (next < 0) next = tabs.length - 1;
              if (next >= tabs.length) next = 0;
              tabs[next].focus();
              clearTabHints();
              activate(tabs[next].dataset.panelTab);
            });
          });
          var q = document.getElementById("panelSiteSearch");
          var f = document.getElementById("panelSiteFilter");
          var rows = Array.prototype.slice.call(document.querySelectorAll("#panelSitesTable tbody tr[data-domain]"));
          function filterSitesPreview() {
            var query = q ? q.value.toLowerCase().trim() : "";
            var type = f ? f.value : "all";
            rows.forEach(function (row) {
              var show = (type === "all" || row.dataset.type === type) && (!query || row.dataset.domain.indexOf(query) !== -1);
              row.style.display = show ? "" : "none";
            });
          }
          if (q) q.addEventListener("input", filterSitesPreview);
          if (f) f.addEventListener("change", filterSitesPreview);
        })();

        // terminal: paced installer playback with real pauses and live-tail scrolling
        var term = document.querySelector(".term");
        if (term) {
          var tbody = term.querySelector(".tbody");
          var tlines = [].slice.call(tbody.querySelectorAll(".tl"));
          if (tlines.length && !reduce) {
            term.classList.add("is-playing");
            var linePosition = 0,
              terminalTimer = null,
              terminalInView = false,
              pendingTerminalDelay = 350,
              pendingTerminalAction = advanceTerminal,
              commandCharPosition = 0,
              terminalResetPending = false;

            function terminalDelay(line, position) {
              var customDelay = Number(line.dataset.delay);
              if (customDelay > 0) return customDelay;
              var text = line.textContent.trim();
              if (!text) return 220;
              if (line.querySelector(".t-sec")) return 720;
              if (/Package index updated|Nginx installed|PHP 8\.4 installed|MariaDB 10\.11 installed/.test(text)) {
                return 1150;
              }
              return 300 + (position % 4) * 70;
            }

            function scheduleTerminal(delay, action) {
              pendingTerminalDelay = delay;
              pendingTerminalAction = action || advanceTerminal;
              if (terminalTimer) clearTimeout(terminalTimer);
              terminalTimer = setTimeout(function () {
                terminalTimer = null;
                pendingTerminalAction();
              }, delay);
            }

            function followTerminalTail(line) {
              requestAnimationFrame(function () {
                var bodyRect = tbody.getBoundingClientRect(),
                  lineRect = line.getBoundingClientRect();
                if (lineRect.bottom > bodyRect.bottom - 12) {
                  tbody.scrollTo({
                    top: tbody.scrollTop + lineRect.bottom - bodyRect.bottom + 18,
                    behavior: "smooth",
                  });
                }
              });
            }

            function clearTerminalCycle() {
              term.dataset.playbackState = "resetting";
              tlines.forEach(function (line) {
                line.classList.remove("is-visible");
              });
              var typedCommand = term.querySelector(".t-typed");
              if (typedCommand) typedCommand.textContent = "";
              tbody.scrollTop = 0;
              linePosition = 0;
              commandCharPosition = 0;
              terminalResetPending = false;
              scheduleTerminal(850);
            }

            function typeTerminalCommand() {
              if (!terminalInView) return;
              var line = tlines[linePosition],
                typed = line.querySelector(".t-typed"),
                command = typed.dataset.command;

              term.dataset.playbackState = "typing";
              if (commandCharPosition < command.length) {
                commandCharPosition += 1;
                typed.textContent = command.slice(0, commandCharPosition);
                followTerminalTail(line);
                scheduleTerminal(24 + (commandCharPosition % 5) * 4, typeTerminalCommand);
                return;
              }

              linePosition += 1;
              commandCharPosition = 0;
              term.dataset.playbackState = "running";
              scheduleTerminal(500);
            }

            function advanceTerminal() {
              if (!terminalInView) return;
              if (terminalResetPending) {
                clearTerminalCycle();
                return;
              }

              var line = tlines[linePosition];
              line.classList.add("is-visible");
              followTerminalTail(line);

              if (line.classList.contains("term-command")) {
                var typed = line.querySelector(".t-typed");
                if (!typed) { linePosition += 1; scheduleTerminal(300); return; }
                typed.textContent = "";
                commandCharPosition = 0;
                term.dataset.playbackState = "typing";
                scheduleTerminal(terminalDelay(line, linePosition), typeTerminalCommand);
                return;
              }

              var delay = terminalDelay(line, linePosition);
              linePosition += 1;

              if (linePosition >= tlines.length) {
                term.dataset.playbackState = "complete";
                terminalResetPending = true;
                scheduleTerminal(3500);
              } else {
                term.dataset.playbackState = "running";
                scheduleTerminal(delay);
              }
            }

            new IntersectionObserver(
              function (es) {
                es.forEach(function (e) {
                  terminalInView = e.isIntersecting;
                  if (terminalInView) {
                    term.dataset.playbackState = pendingTerminalAction === typeTerminalCommand ? "typing" : "running";
                    if (!terminalTimer) scheduleTerminal(pendingTerminalDelay, pendingTerminalAction);
                  } else {
                    term.dataset.playbackState = "paused";
                    if (terminalTimer) clearTimeout(terminalTimer);
                    terminalTimer = null;
                  }
                });
              },
              { threshold: 0.05 },
            ).observe(term);
          } else if (tlines.length) {
            term.dataset.playbackState = "static";
            tbody.scrollTop = 0;
          }
        }

        // pause infinite CSS animations when their section is off-screen
        (function () {
          function pauseOut(el) {
            if (!el) return;
            new IntersectionObserver(
              function (es) {
                es.forEach(function (e) {
                  el.classList.toggle("is-paused", !e.isIntersecting);
                });
              },
              { threshold: 0 },
            ).observe(el);
          }
          pauseOut(document.querySelector(".hero .glow"));
          pauseOut(document.querySelector(".mq-track"));
          document.querySelectorAll(".fl-chip").forEach(pauseOut);
        })();

        // cursor-reactive enhancements: only on real hover+fine pointers, and not when reduced motion
        var canHover = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
        if (canHover && !reduce) {
          // magnetic CTAs + copy buttons (rAF-batched)
          document.querySelectorAll(".btn-primary,.cp").forEach(function (b) {
            var rect = null,
              ev = null,
              raf = 0;
            function run() {
              raf = 0;
              if (!ev || !rect) return;
              b.style.transform =
                "translate(" +
                (ev.clientX - rect.left - rect.width / 2) * 0.16 +
                "px," +
                (ev.clientY - rect.top - rect.height / 2) * 0.28 +
                "px)";
            }
            b.addEventListener("pointerenter", function () {
              rect = b.getBoundingClientRect();
            });
            b.addEventListener("pointermove", function (e) {
              ev = e;
              if (!rect) rect = b.getBoundingClientRect();
              if (!raf) raf = requestAnimationFrame(run);
            });
            b.addEventListener("pointerleave", function () {
              b.style.transform = "";
              rect = null;
            });
          });
          // cursor spotlight on cards (rAF-batched)
          document.querySelectorAll(".fcard,.spot").forEach(function (c) {
            var rect = null,
              ev = null,
              raf = 0;
            function run() {
              raf = 0;
              if (!ev || !rect) return;
              c.style.setProperty("--mx", ((ev.clientX - rect.left) / rect.width) * 100 + "%");
              c.style.setProperty("--my", ((ev.clientY - rect.top) / rect.height) * 100 + "%");
            }
            c.addEventListener("pointerenter", function () {
              rect = c.getBoundingClientRect();
            });
            c.addEventListener("pointermove", function (e) {
              ev = e;
              if (!rect) rect = c.getBoundingClientRect();
              if (!raf) raf = requestAnimationFrame(run);
            });
            c.addEventListener("pointerleave", function () {
              rect = null;
            });
          });
          // terminal tilt + sheen (rAF-batched)
          if (term) {
            var trect = null,
              tev = null,
              traf = 0;
            function trun() {
              traf = 0;
              if (!tev || !trect) return;
              var px = (tev.clientX - trect.left) / trect.width,
                py = (tev.clientY - trect.top) / trect.height;
              term.style.setProperty("--mx", px * 100 + "%");
              term.style.setProperty("--my", py * 100 + "%");
              term.style.transform =
                "perspective(1000px) rotateY(" + (px - 0.5) * 6 + "deg) rotateX(" + (0.5 - py) * 6 + "deg)";
            }
            term.addEventListener("pointerenter", function () {
              trect = term.getBoundingClientRect();
            });
            term.addEventListener("pointermove", function (e) {
              tev = e;
              if (!trect) trect = term.getBoundingClientRect();
              if (!traf) traf = requestAnimationFrame(trun);
            });
            term.addEventListener("pointerleave", function () {
              term.style.transform = "";
              trect = null;
            });
          }
          // hero parallax + floating glyph repel (rAF-batched)
          var hero = document.querySelector(".hero"),
            bgfx = document.querySelector(".bgfx"),
            floaters = document.getElementById("floaters");
          var chips = [].slice.call(document.querySelectorAll(".fl-in"));
          if (hero) {
            var hev = null,
              hraf = 0;
            function hrun() {
              hraf = 0;
              if (!hev) return;
              var cx = hev.clientX / window.innerWidth - 0.5,
                cy = hev.clientY / window.innerHeight - 0.5;
              if (bgfx) bgfx.style.transform = "translate(" + cx * -14 + "px," + cy * -14 + "px)";
              if (floaters) floaters.style.transform = "translate(" + cx * 20 + "px," + cy * 20 + "px)";
              chips.forEach(function (ch) {
                var r = ch.getBoundingClientRect();
                var dx = r.left + r.width / 2 - hev.clientX,
                  dy = r.top + r.height / 2 - hev.clientY,
                  d = Math.hypot(dx, dy) || 1;
                if (d < 150) {
                  var f = ((150 - d) / 150) * 28;
                  ch.style.transform = "translate(" + (dx / d) * f + "px," + (dy / d) * f + "px)";
                } else {
                  ch.style.transform = "";
                }
              });
            }
            hero.addEventListener("pointermove", function (e) {
              hev = e;
              if (!hraf) hraf = requestAnimationFrame(hrun);
            });
            hero.addEventListener("pointerleave", function () {
              if (bgfx) bgfx.style.transform = "";
              if (floaters) floaters.style.transform = "";
              chips.forEach(function (ch) {
                ch.style.transform = "";
              });
            });
          }
        }

        // faq
        document.querySelectorAll(".acc-h").forEach(function (h) {
          h.addEventListener("click", function () {
            var item = h.parentElement;
            var open = item.classList.toggle("open");
            h.setAttribute("aria-expanded", open ? "true" : "false");
          });
        });
        (function () {
          var pipe = document.querySelector(".pipeline"),
            dot = document.querySelector(".pl-dot");
          var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
          if (!pipe || !dot || rm) return;
          function C(el) {
            var pr = pipe.getBoundingClientRect(),
              r = el.getBoundingClientRect();
            return {
              x: r.left - pr.left + r.width / 2,
              t: r.top - pr.top,
              b: r.bottom - pr.top,
              m: r.top - pr.top + r.height / 2,
            };
          }
          function build() {
            var vis = pipe.querySelector(".pl-trunk .pnode"),
              lookup = pipe.querySelector(".pnode.hero"),
              hit = pipe.querySelector(".branch.hit"),
              hitHead = pipe.querySelector(".branch.hit .pnode.head"),
              resp = pipe.querySelector(".pnode.final");
            if (!vis || !lookup || !hit || !hitHead || !resp) return;
            var cv = C(vis),
              cl = C(lookup),
              ch = C(hitHead),
              cb = C(hit),
              cr = C(resp);
            var cx = Math.round(cv.x),
              hx = Math.round(ch.x),
              yS = Math.round(cl.b + 15),
              yM = Math.round(cb.b + 15);
            var d =
              "M" +
              cx +
              "," +
              Math.round(cv.t) +
              " L" +
              cx +
              "," +
              yS +
              " L" +
              hx +
              "," +
              yS +
              " L" +
              hx +
              "," +
              yM +
              " L" +
              cx +
              "," +
              yM +
              " L" +
              cx +
              "," +
              Math.round(cr.m);
            dot.style.setProperty("--flow", 'path("' + d + '")');
            dot.classList.add("go");
          }
          build();
          var rt;
          window.addEventListener(
            "resize",
            function () {
              clearTimeout(rt);
              rt = setTimeout(build, 150);
            },
            { passive: true },
          );
          new IntersectionObserver(
            function (es) {
              es.forEach(function (e) {
                dot.classList.toggle("is-paused", !e.isIntersecting);
              });
            },
            { threshold: 0.05 },
          ).observe(pipe);
        })();
      })();
    

/* ---- split from inline <script> blocks ---- */

(function(){var nav=document.getElementById('nav'),ham=document.getElementById('navham'),mob=document.getElementById('mobnav'),mobClose=document.querySelector('.mobnav-close');
if(!nav||!ham)return;
function closeMenu(){nav.classList.remove('menuopen');ham.setAttribute('aria-expanded','false');document.body.style.overflow='';if(mob)mob.setAttribute('aria-hidden','true');}
function openMenu(){nav.classList.add('menuopen');ham.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';if(mob)mob.setAttribute('aria-hidden','false');}
ham.addEventListener('click',function(){if(nav.classList.contains('menuopen')){closeMenu();}else{openMenu();}});
if(mobClose)mobClose.addEventListener('click',function(){closeMenu();ham.focus();});
if(mob)mob.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){closeMenu();ham.focus();});});
nav.addEventListener('click',function(e){if(e.target===nav&&nav.classList.contains('menuopen')){closeMenu();ham.focus();}});
document.addEventListener('click',function(e){if(nav.classList.contains('menuopen')&&!nav.contains(e.target)){closeMenu();ham.focus();}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('menuopen')){closeMenu();ham.focus();}});
})();
