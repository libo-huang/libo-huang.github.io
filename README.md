[![](https://img.shields.io/github/last-commit/libo-huang/libo-huang.github.io.svg)](#libo-huang.github.io)

# Libo Huang's Personal Homepage

🌐 **Website**: `<a href="https://libo-huang.github.io/" target="_blank">`libo-huang.github.io`</a>`

---

## **Usage & Attribution | 使用说明与版权声明**

### **English**

This repository contains the source code of my personal homepage. You are welcome to explore and learn from it. However, if you use any **code snippets, modules, or design elements** from this project, please:

- **Cite this repository** (e.g., "Code adapted from [libo-huang.github.io](https://github.com/libo-huang/libo-huang.github.io)").
- **Do not directly copy** the entire project for your own use without significant modification.

This project is for **learning and reference purposes only**. Commercial use or unattributed reuse is **not permitted**.

---

### **中文**

本仓库为我的个人主页源代码，欢迎学习参考。如需使用其中的 **代码片段、功能模块或设计元素**，请遵守以下规则：

- **注明来源**（如："代码参考自 [libo-huang.github.io](https://github.com/libo-huang/libo-huang.github.io)"）。
- **禁止直接复制**整个项目用于个人用途（需显著修改）。

本项目仅限 **学习交流**，未经许可不得用于商业用途或未署名转载。

---

## **License | 许可证**

[![CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
This work is licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License](http://creativecommons.org/licenses/by-nc/4.0/).
本作品采用[知识共享署名-非商业性使用 4.0 国际许可协议](http://creativecommons.org/licenses/by-nc/4.0/)授权。


---



## Local Development & Debugging

This site is powered by [Jekyll](https://jekyllrb.com/) (the default engine for GitHub Pages) using the `{% raw %}{% include %}{% endraw %}` mechanism for modular components.

To preview and debug the site locally on a new machine before pushing to GitHub, follow these steps:

### 1. Prerequisites

Ensure you have **Ruby** installed on your system.

- Mac: Usually pre-installed, or use `brew install ruby`.
- Windows: Download and install [RubyInstaller](https://rubyinstaller.org/).
- Linux: `sudo apt-get install ruby-full`.

### 2. Install Jekyll

Open your terminal, navigate to the root directory of this repository, and install Jekyll:

```bash
gem install jekyll bundler
```


### 3. Run the Local Server

Start the Jekyll local development server by running:

```bash
jekyll serve
```

*(Note: Use `bundle exec jekyll serve` if you decide to add a Gemfile in the future).*


### 4. Live Preview

Open your browser and go to: **http://127.0.0.1:4000/**

**💡 Pro Tip for debugging:**
Jekyll will continuously watch for changes. Whenever you modify `index.html`, `index_zh-CN.html`, or any file inside the `_includes/` folder, the local site will automatically rebuild. Just refresh your browser to see the updates! *(Note: The site will automatically rebuild when you save changes. Just refresh your browser!)*
