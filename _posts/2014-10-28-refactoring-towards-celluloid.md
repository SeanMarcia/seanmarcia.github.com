---
layout: post
title: "Refactoring towards Celluloid"
quote: "Let's speed this up, then let's speed it up some more."
date:   2014-10-28 0:00:55
category:
- devops
- guide
---

note: this blog post is work in progress, I figure since it was getting excessively long I would post what I have.)

#“Broken gets fixed but crap lasts forever.”

We had a request a couple years ago for an automated link checker for all the sites in our system so our users would know when content they are linking to was no longer available. While tasks like this are important everywhere, in the academic setting, where I work, this is extremely important as our researchers and professors academic rankings depends on accurate and reviewable information.

I quickly hacked out a horrible solution that worked, put it into a cron job and then promised myself I’d come back and refactor when I had more time.

We’ve recently began to gamify the back end of our site to encourage user engagement and one of the metrics we’re using is the number of broken links. This required a refactoring of the task and a speeding up of it. This is something that is only run in a cron job once a month so the fact that it took 40 or so minutes wasn’t really an issue. We wanted to be able to speed this up so we could run it multiple times a day or hour if we wanted to.

So here’s the (ugly) code:

{% highlight ruby %}
@emaillist = {}
@events = Event.all
@articles = Article.all
@resources = Resource.all
@logfile = File.open("bad_link_log.txt","w")

def organize_url(url, originating_site_domain)
  url.insert(0, originating_site_domain) if url.match(/^\//)
  url.insert(0, "http://") unless ((url.match(/^http\:\/\//)) or (url.match(/^https\:\/\//)))
  url = URI.encode(url) if (url =~ URI::DEFAULT_PARSER.regexp[:ABS_URI]).nil?
  return url
end

def notify_site(problem_type, page_id, domain, email, url, page_type)
  email ||= "No Admin <chssweb@gmu.edu>"
  if @emaillist.has_key?(email)
    @emaillist[email] += ["On #{domain}/#{page_type}/#{page_id} the link #{url} is returning a #{problem_type}."]
  else
    @emaillist[email] = ["On #{domain}/#{page_type}/#{page_id} the link #{url} is returning a #{problem_type}."]
  end
  @logfile.puts("There was a #{problem_type} on #{domain}/#{page_type}/#{page_id} linking to #{url} and #{email} was notified.")
end

def find_broken_link(original_site, id, admin_email, url, page_type)
  baseurl = organize_url(url, original_site)
  begin
    res = Net::HTTP.get_response(URI.parse(baseurl))
    puts "Code: #{res.code} for #{url}"
    notify_site("404 error", id, original_site, admin_email, url, page_type) if (res.code.to_i == 404)
  rescue
    puts "Broken/bad link for #{url}"
    notify_site("broken link error", id, original_site, admin_email, url, page_type)
  end
end

def release_the_dogs(admin_contact, contact_message)
  BrokenLinkMailer.broken_link_notifier(admin_contact, contact_message).deliver
end

@emaillist.each_key do |key|
  release_the_dogs(key, @emaillist[key])
end

@events.each do |e|
  if e.url?
    find_broken_link(e.originating_site.domain,e.id, e.originating_site.reporting_email,e.url,"events")
  end
  long_desc_links = URI.extract(e.long_description).select!{|v| v =~ /http/}
  if !long_desc_links.blank?
    long_desc_links.each do |link|
      find_broken_link(e.originating_site.domain,e.id, e.originating_site.reporting_email,link,"events")
    end
  end
end

@articles.each do |a|
  if a.url_link?
    find_broken_link(a.originating_site.domain,a.id, a.originating_site.reporting_email,a.url_link,"articles")
  end
  long_desc_links = URI.extract(a.main_content).select!{|v| v =~ /http/}
  if !long_desc_links.blank?
    long_desc_links.each do |link|
      find_broken_link(a.originating_site.domain,a.id, a.originating_site.reporting_email,link,"articles")
    end
  end

end

@resources.each do |r|
  if r.page_id?
    if r.url?
      find_broken_link(r.originating_site.domain,r.id, r.originating_site.reporting_email,r.url,"resources")
    end
  end
end

@emaillist.each_key do |key|
  release_the_dogs(key, @emaillist[key])
end

@logfile.close
{% endhighlight %}

Starting with the low hanging fruit:

{% highlight ruby %}
@events = Event.all
@articles = Article.all
@resources = Resource.all
.
.
.
@events.each do |e|
  if e.url?
    find_broken_link(e.originating_site.domain,e.id, e.originating_site.reporting_email,e.url,"events")
  end
  long_desc_links = URI.extract(e.long_description).select!{|v| v =~ /http/}
  if !long_desc_links.blank?
    long_desc_links.each do |link|
      find_broken_link(e.originating_site.domain,e.id, e.originating_site.reporting_email,link,"events")
    end
  end
end

@articles.each do |a|
  if a.url_link?
    find_broken_link(a.originating_site.domain,a.id, a.originating_site.reporting_email,a.url_link,"articles")
  end
  long_desc_links = URI.extract(a.main_content).select!{|v| v =~ /http/}
  if !long_desc_links.blank?
    long_desc_links.each do |link|
      find_broken_link(a.originating_site.domain,a.id, a.originating_site.reporting_email,link,"articles")
    end
  end

end

@resources.each do |r|
  if r.page_id?
    if r.url?
      find_broken_link(r.originating_site.domain,r.id, r.originating_site.reporting_email,r.url,"resources")
    end
  end
end
{% endhighlight %}

I started by creating a scope in resources that checks for a page_id and a url. I also created some aliases for url_link and main_content to in my Article model in order to have parity with the Event and Resource model in order to get some uniformity.

{% highlight ruby %}
@events = Event.unlinked_events
@event_links = Event.linked_events
@articles = Article.unlinked_articles
@article_links = Article.linked_articles
@resources = Resource.link_resources

[@event_links, @article_links, @resources].each do |collection_item|
  collection_item.each do |item|
    find_broken_link(item.originating_site.domain,item.id,
                               item.originating_site.reporting_email,
                               item.url,item.class.name.downcase.pluralize)
  end
end

[@events, @articles].each do |collection_item|
  collection_item.each do |item|
    long_desc_links = URI.extract(item.long_description).select!{|v| v =~ /http/}
    unless long_desc_links.blank?
      long_desc_links.each do |link|
        find_broken_link(item.originating_site.domain,item.id,
                                   item.originating_site.reporting_email,
                                   link,item.class.name.downcase.pluralize)
      end
    end
  end
end
{% endhighlight %}

Was passing too much stuff into find_broken_link so that was decomposed.

{% highlight ruby %}
[@event_links, @article_links, @resources].each do |collection_item|
  collection_item.each do |item|
    find_broken_link(link_details(item))
  end
end

[@events, @articles].each do |collection_item|
  collection_item.each do |item|
    long_desc_links = URI.extract(item.long_description).select!{|v| v =~ /http/}
    unless long_desc_links.blank?
      long_desc_links.each do |link|
        find_broken_link(link_details(item, link))
      end
    end
  end
end

#method for cleaning up the passed in stuff called inside find_broken_link:

def link_details(link_item, link = nil)
  {
    :original_site => link_item.originating_site.domain,
    :id => link_item.id,
    :admin_email => link_item.originating_site.reporting_email,
    :url => link.nil? ? link_item.url : link,
    :page_type => link_item.class.name.downcase.pluralize
  }
end
{% endhighlight %}

Nothing here really sped the task up so that was the next part. I next implemented Celluloid and broke this up into three files.

Lots of instance variables:

{% highlight ruby %}
#checker.rb
require 'celluloid/autostart'
require 'logger'
require_relative 'broken_link/link_cell'
require_relative 'broken_link/link_checker'

module Checker
  DEFAULTS = {
    default_protocol:   'http://',
    pool_size:          25,
    logger_class:       Logger,
    admin_email:        "No Admin <chssweb@gmu.edu>",
    log_file_name:      "bad_link_log.csv"
  }

  def self.linkcheck(opts={})
    link_check_results = LinkChecker.new(opts)
    link_check_results.agent_pool.future.terminate

    link_check_results
  end
end
{% endhighlight %}

{% highlight ruby %}
module Checker
  class LinkChecker
    attr_reader :agent_pool, :opts, :default_protocol, :output_file, :logger

    def initialize(override_opts={})
      @opts  = DEFAULTS.merge(override_opts)
      @default_protocol = opts[:default_protocol]
      @output_file = opts[:output_file] || File.open(opts[:log_file_name], 'a')
      @logger = opts[:logger_class].new(output_file)
      @agent_pool = LinkCell.pool(size: opts[:pool_size], args: [logger])
      @events = Event.unlinked_events
      @event_links = Event.linked_events
      @articles = Article.unlinked_articles
      @article_links = Article.linked_articles
      @resources = Resource.linkable
      @count = 0
      check_embedded_links
      check_direct_links
      self
    ensure
      output_file.close if output_file.respond_to?(:close)
    end

    def check_direct_links
      [@event_links, @article_links, @resources].each do |collection_item|
        collection_item.each do |item|
          find_broken_link(link_details(item))
        end
      end
    end

    def check_embedded_links
      [@events, @articles].each do |collection_item|
        collection_item.each do |item|
          long_desc_links = URI.extract(item.long_description).select!{|v| v =~ /http/}
          unless long_desc_links.blank?
            long_desc_links.each do |link|
              find_broken_link(link_details(item, link))
            end
          end
        end
      end
    end

    private

    def link_details(link_item, link = nil)
      {
        :original_site => link_item.originating_site.domain,
        :id => link_item.id,
        :admin_email => link_item.originating_site.reporting_email.empty? ? "No Admin <chssweb@gmu.edu>" : link_item.originating_site.reporting_email,
        :url => link.nil? ? link_item.url : link,
        :page_type => link_item.class.name.downcase.pluralize
      }
    end

    def find_broken_link(url)
      agent_pool.future.get(url)
    end
  end
end
{% endhighlight %}

{% highlight ruby %}
module Checker
  class LinkCell
    include Celluloid

    attr_reader :logger

    def initialize(logger)
      @logger = logger
    end

    def organize_url(url, originating_site_domain)
      url.insert(0, originating_site_domain) if url.match(/^\//)
      url.insert(0, "http://") unless (((url.match(/^http\:\/\//)) or (url.match(/^https\:\/\//))) || url.empty?)
      url = URI.encode(url) if (url =~ URI::DEFAULT_PARSER.regexp[:ABS_URI]).nil?
      return url
    end

    def get(link)
      site = link[:original_site]
      return if organize_url(link[:url],site).empty?
      baseurl = organize_url(link[:url],site)
      begin
        res = Net::HTTP.get_response(URI.parse(baseurl))
        puts "Code: #{res.code} for #{link[:url]}"
        logger << "404 error, #{link[:id]}, #{link[:original_site]}, \
                  #{link[:admin_email]}, #{link[:url]}, #{link[:page_type]}\n" if (res.code.to_i == 404)
      rescue
        puts "Broken/bad link for #{link[:url]}"
        logger << "Broken link error, #{link[:id]}, #{link[:original_site]}, \
                  #{link[:admin_email]}, #{link[:url]}, #{link[:page_type]}\n"
      end
    end

  end
end
{% endhighlight %}

I’m still on the fence on DEFAULTS option has I pass in. I realize it is probably better OO to do it that way and it makes it better for customizing and changing in the future but I fell that right now it is just wasting space.

So after cleaning up all those ugly instance variables:

{% highlight ruby %}
#link_checker.rb
module Checker
  class LinkChecker
    attr_reader :agent_pool, :direct_links, :embedded_links, :logger, :opts, :output_file

    def initialize(override_opts={})
      @opts  = DEFAULTS.merge(override_opts)
      @output_file = opts[:output_file] || File.open(opts[:log_file_name], 'a')
      @logger = opts[:logger_class].new(output_file)
      @agent_pool = LinkCell.pool(size: opts[:pool_size], args: [logger])
      @embedded_links = Event.unlinked_events + Article.unlinked_articles
      @direct_links = Event.linked_events + Article.linked_articles + Resource.linkable
      check_embedded_links
      check_direct_links
      self
    ensure
      output_file.close if output_file.respond_to?(:close)
    end

    def check_direct_links
      direct_links.each do |item|
        find_broken_link(link_details(item))
      end
    end

    def check_embedded_links
      embedded_links.each do |item|
        long_desc_links = URI.extract(item.long_description).select!{|v| v =~ /http/}
        unless long_desc_links.blank?
          long_desc_links.each do |link|
            find_broken_link(link_details(item, link))
          end
        end
      end
    end

    def link_details(link_item, link = nil)
      {
        :original_site => link_item.originating_site.domain,
        :id => link_item.id,
        :admin_email => link_item.originating_site.reporting_email.empty? ? "No Admin <chssweb@gmu.edu>" : link_item.originating_site.reporting_email,
        :url => link.nil? ? link_item.url : link,
        :page_type => link_item.class.name.downcase.pluralize,
        :originating_site => link_item.originating_site.id
      }
    end

    def find_broken_link(url)
      agent_pool.future.get(url)
    end
  end
end
{% endhighlight %}

I wanted to start fresh with a new log each time so:

{% highlight ruby %}
require 'celluloid/autostart'
require 'logger'
require_relative 'broken_link/link_cell'
require_relative 'broken_link/link_checker'

module Checker
  DEFAULTS = {
    pool_size:          25,
    logger_class:       Logger,
    admin_email:        "No Admin <chssweb@gmu.edu>",
    log_file_name:      "bad_link_log.csv"
  }

  def self.linkcheck(opts={})
    File.delete("bad_link_log.csv") if File.exist?("bad_link_log.csv")
    link_check_results = LinkChecker.new(opts)
    link_check_results.agent_pool.future.terminate

    link_check_results
  end
end
{% endhighlight %}

No updates yet on the link_cell.rb file but this has greatly improved the speed of the task. What was a ~35 minute task now runs in about a minute.

More refactorings on this to come…