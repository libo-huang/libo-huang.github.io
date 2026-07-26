#!/usr/bin/env ruby
# frozen_string_literal: true

require "cgi"
require "json"
require "pathname"

Encoding.default_external = Encoding::UTF_8

site = Pathname(ARGV.fetch(0, "_site")).expand_path
errors = []

required = %w[
  index.html index_zh-CN.html 404.html robots.txt sitemap.xml
  utils/style.css utils/theme.js utils/main.js
  utils/libo-huang.webp utils/social-card.png
]

required.each do |relative|
  path = site.join(relative)
  errors << "Missing generated file: #{relative}" unless path.file? && path.size.positive?
end

def attributes(tag)
  tag.scan(/([:\w-]+)\s*=\s*(["'])(.*?)\2/m).to_h { |name, _quote, value| [name.downcase, CGI.unescapeHTML(value)] }
end

documents = {}
site.glob("**/*.html").each do |path|
  html = path.read(encoding: "UTF-8")
  documents[path.cleanpath] = html

  html.scan(%r{<script\b[^>]*type=["']application/ld\+json["'][^>]*>(.*?)</script>}mi).each do |match|
    JSON.parse(match.first)
  rescue JSON::ParserError => error
    errors << "Invalid JSON-LD in #{path.relative_path_from(site)}: #{error.message}"
  end

  html.scan(/<a\b[^>]*>/mi).each do |tag|
    attrs = attributes(tag)
    next unless attrs["target"] == "_blank"

    rel = attrs.fetch("rel", "").split
    errors << "Missing safe rel in #{path.relative_path_from(site)}: #{attrs["href"]}" unless %w[noopener noreferrer].all? { |value| rel.include?(value) }
  end

  html.scan(/<img\b[^>]*>/mi).each do |tag|
    attrs = attributes(tag)
    errors << "Image lacks dimensions in #{path.relative_path_from(site)}: #{attrs["src"]}" unless attrs["width"] && attrs["height"]
  end
end

documents.each do |page, html|
  visible_html = html.gsub(/<!--.*?-->/m, "")
  visible_html.scan(/<(?:a|link|script|img|source)\b[^>]*>/mi).each do |tag|
    attrs = attributes(tag)
    raw = attrs["href"] || attrs["src"] || attrs["srcset"]
    next if raw.nil? || raw.strip.empty? || raw.start_with?("http://", "https://", "//", "mailto:", "tel:", "data:")

    value = raw.split.first
    path_part, fragment = value.split("#", 2)
    path_part = path_part.to_s.split("?", 2).first.to_s
    target = if path_part.empty?
               page
             elsif path_part.start_with?("/")
               site.join(path_part.delete_prefix("/"))
             else
               page.dirname.join(path_part)
             end.cleanpath
    target = target.join("index.html") if target.directory?

    unless target.file?
      errors << "Broken internal reference in #{page.relative_path_from(site)}: #{raw}"
      next
    end

    next if fragment.nil? || fragment.empty? || target.extname != ".html"

    target_html = documents.fetch(target, target.read)
    decoded = CGI.unescape(fragment)
    ids = target_html.scan(/\b(?:id|name)\s*=\s*(["'])(.*?)\1/mi).map { |match| CGI.unescapeHTML(match.last) }
    errors << "Missing anchor in #{page.relative_path_from(site)}: #{raw}" unless ids.include?(decoded)
  end
end

if errors.empty?
  puts "Generated site checks passed (#{documents.length} HTML files)."
else
  warn errors.uniq.join("\n")
  exit 1
end
