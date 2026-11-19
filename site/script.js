/* Agent Skills OS — site interactions. No dependencies. */
(function () {
  "use strict";

  /* ---------- Toast ---------- */
  var toast = document.getElementById("toast");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 1600);
  }

  /* ---------- Copy ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy") ? resolve() : reject(new Error("copy failed"));
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".copy");
    if (!btn) return;
    var text = btn.getAttribute("data-copy");
    if (text === null) {
      var src = document.getElementById(btn.getAttribute("data-copy-from"));
      var code = src && (src.querySelector("pre code") || src.querySelector("code"));
      text = code ? code.textContent : "";
    }
    var label = btn.querySelector(".copy__label") || btn;
    var original = label.textContent;
    copyText(text).then(
      function () {
        btn.classList.add("is-done");
        label.textContent = "Copied";
        showToast("Copied to clipboard");
        setTimeout(function () {
          btn.classList.remove("is-done");
          label.textContent = original;
        }, 1400);
      },
      function () {
        showToast("Couldn't copy. Select the text instead.");
      }
    );
  });

  /* ---------- Tablists (roving focus, arrow keys) ---------- */
  function tablist(root, onSelect) {
    if (!root) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: "nearest", inline: "nearest" });
      onSelect(tab);
    }
    root.addEventListener("click", function (e) {
      var tab = e.target.closest('[role="tab"]');
      if (tab) select(tab, false);
    });
    root.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i === -1) return;
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        select(next, true);
      }
    });
  }

  /* Usage tabs */
  tablist(document.getElementById("usage-tabs"), function (tab) {
    var id = tab.getAttribute("aria-controls");
    document.querySelectorAll(".usage__panel").forEach(function (p) {
      p.hidden = p.id !== id;
    });
  });

  /* ---------- Adapter demo ----------
     Mirrors the adapters in src/index.js, applied to the example skill
     shown on the left. Keep these in step with the package. */
  var skill = {
    name: "release-notes",
    description: "Turn merged pull requests into release notes grouped by what users notice.",
    version: "0.1.0",
    tags: ["writing", "engineering"],
    inputs: [{ name: "changes", description: "Merged PR titles and descriptions.", required: true }],
    related: [],
    author: null,
    author_url: null,
    instructions:
      "# release-notes\n\n" +
      "Group changes under New, Improved and Fixed.\n" +
      "Write one line per change, in plain words, present tense.\n" +
      "Leave out internal refactors unless they change behavior.",
  };

  var adapters = {
    claude: {
      fn: "forClaude",
      hint: "Pass system to anthropic.messages.create()",
      run: function (s) {
        return { system: s.instructions, metadata: { skill_name: s.name, skill_version: s.version, related_skills: s.related } };
      },
    },
    openai: {
      fn: "forOpenAI",
      hint: "Spread into openai.beta.assistants.create()",
      run: function (s) {
        return { name: s.name, description: s.description, instructions: s.instructions };
      },
    },
    langchain: {
      fn: "forLangChain",
      hint: "Give template to PromptTemplate.fromTemplate()",
      run: function (s) {
        var vars = s.inputs.map(function (i) { return i.name; });
        var section = vars.length
          ? "\n\n---\n\n" + vars.map(function (v) { return v + ":\n{" + v + "}"; }).join("\n\n")
          : "";
        return { template: s.instructions + section, inputVariables: vars };
      },
    },
    crewai: {
      fn: "forCrewAI",
      hint: "Maps onto a CrewAI Agent",
      run: function (s) {
        return { role: s.name, goal: s.description, backstory: s.instructions };
      },
    },
    autogen: {
      fn: "forAutoGen",
      hint: "Pass to AssistantAgent()",
      run: function (s) {
        return { name: s.name, system_message: s.instructions };
      },
    },
    cursor: {
      fn: "forCursor",
      hint: "Write to .cursor/rules/",
      file: true,
      run: function (s) {
        return {
          filename: s.name + ".mdc",
          content: "---\ndescription: " + JSON.stringify(s.description) + "\nalwaysApply: false\n---\n\n" + s.instructions + "\n",
        };
      },
    },
    agentsMd: {
      fn: "forAgentsMd",
      hint: "Append to your project's AGENTS.md",
      file: true,
      run: function (s) {
        return {
          filename: s.name + ".agents.md",
          content: "## " + s.name + " (via universal-agent-skills)\n\n" + s.description + "\n\n" + s.instructions + "\n",
        };
      },
    },
    stitch: {
      fn: "forStitchPrompt",
      hint: "Paste into the prompt box",
      file: true,
      run: function (s) {
        return { content: s.description + "\n\n" + s.instructions };
      },
    },
    generic: {
      fn: "forGeneric",
      hint: "For your own runtime or tool registry",
      run: function (s) {
        return {
          name: s.name, description: s.description, version: s.version, tags: s.tags,
          inputs: s.inputs, related: s.related, author: s.author, author_url: s.author_url,
          instructions: s.instructions,
        };
      },
    },
  };

  function esc(str) {
    return str.replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  function highlightJson(json) {
    return esc(json).replace(
      /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|\b(\d+(?:\.\d+)?)\b/g,
      function (m, str, colon, lit, num) {
        if (str && colon) return '<span class="t-key">' + str + "</span>" + colon;
        if (str) return '<span class="t-s">' + str + "</span>";
        if (lit) return '<span class="t-k">' + lit + "</span>";
        return '<span class="t-n">' + num + "</span>";
      }
    );
  }

  var out = document.getElementById("demo-out");
  var call = document.getElementById("demo-call");
  var hint = document.getElementById("demo-hint");

  function render(key) {
    var a = adapters[key];
    if (!a || !out) return;
    var result = a.run(skill);
    call.textContent = a.fn + '("' + skill.name + '")';
    hint.textContent = a.hint;
    if (a.file) {
      var head = result.filename
        ? '<span class="t-c">// filename: ' + esc(result.filename) + "</span>\n\n"
        : '<span class="t-c">// content</span>\n\n';
      out.innerHTML = head + esc(result.content);
    } else {
      out.innerHTML = highlightJson(JSON.stringify(result, null, 2));
    }
  }

  tablist(document.getElementById("demo-tabs"), function (tab) {
    render(tab.getAttribute("data-target"));
  });
  render("claude");
})();
