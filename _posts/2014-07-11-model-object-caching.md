---
layout: post
title: "Model Object Caching"
date:   2014-07-11 0:00:55
category:
- devops
- guide
---

At a [recent meetup] I was explaining the benefits of caching model objects and how it can help performance by reducing calls to your database. I was only able to give contrived examples at the time but I thought that since I recently had a use case that fell into this neighborhood I thought I’d share. I’ll note that Rails will, by default, write to the file system but for optimal performance you’ll want to use a memory based store like [memcached] or [redis].

If you open up a Rails console and access information from your database you can see the time it spends looking up that information. For example:

{% highlight ruby %}
>> Article.find(6616).title
  Article Load (0.5ms)  SELECT `articles`.* FROM `articles` WHERE `articles`.`id` = 6616 LIMIT 1
"The ‘Wow’ Factor: Mason Econ Major Interns at White House"
>> Article.find(6616).title
  Article Load (0.4ms)  SELECT `articles`.* FROM `articles` WHERE `articles`.`id` = 6616 LIMIT 1
"The ‘Wow’ Factor: Mason Econ Major Interns at White House"
{% endhighlight %}

I picked an article number and did a query of its title and see that it was a 0.5 and 0.4ms call on the database. The database I am working with locally is quite small and the query isn’t very complex. Regardless, with caching we can remove database calls from the equation. Caching works like a hash with a key and a value. The syntax is `Rails.cache.write('key', value)` and then `Rails.cache.read('key')`.

{% highlight ruby %}
>> Rails.cache.write('ArticleTitle',Article.find(6616).title)
  Article Load (0.4ms)  SELECT `articles`.* FROM `articles` WHERE `articles`.`id` = 6616 LIMIT 1
true
>> Rails.cache.read('ArticleTitle')
"The ‘Wow’ Factor: Mason Econ Major Interns at White House"
{% endhighlight %}

With the read action there is no database call. Caching also supports expiring the cache, versioning it, giving it a time to live and so on. More infomation can be found in [the Rails guides].

Aside from reading and writing, you can also perform a fetch which will read the result that is stored in the cache and if there is nothing there it will create the cache by performing the passed in block.

{% highlight ruby %}
>> Rails.cache.fetch('ArticleTitle') {Article.find(6616).title}
  Article Load (0.4ms)  SELECT `articles`.* FROM `articles` WHERE `articles`.`id` = 6616 LIMIT 1
"The ‘Wow’ Factor: Mason Econ Major Interns at White House"
>> Rails.cache.fetch('ArticleTitle') {Article.find(6616).title}
"The ‘Wow’ Factor: Mason Econ Major Interns at White House"
>> Rails.cache.fetch('ArticleTitle') {Article.find(6616).title}
"The ‘Wow’ Factor: Mason Econ Major Interns at White House"
>>
{% endhighlight %}

We see that the first time we attempted to fetch the `ArticleTitle` it didn’t exist so it made a database query but on each subsequent fetch there was no database call.

The use case that occurred recently was that our site at work has become a target for hackers. We’re using the fantastic [rack attack gem] that I created a cron job to poll daily and update the list by removing ip addresses that are no longer on the list and adding any new ones to the list. I created a `Blacklist` table in the database with the following cache actions:

{% highlight ruby %}
class Blacklist < ActiveRecord::Base
  attr_accessible :ip_address
  after_commit :clear_blacklisted_ips

  def self.blacklisted_ips
    Rails.cache.fetch([self, "blacklist"]) { Blacklist.all.collect {|x| x.ip_address}}
  end

  def clear_blacklisted_ips
    Rails.cache.delete([self.class.name, "blacklist"])
  end

end
{% endhighlight %}

So I am creating a `blacklisted_ips` that doesn’t expire unless the `after_commit` gets called by the blacklist table being changed. If the table is changed, I delete the cache so the most recent list of ips is in the cache. For reference, here is my rack attack initializer `rack_attack.rb`:

{% highlight ruby %}
Rack::Attack.blacklist('block dinks') do |req|

  Blacklist.blacklisted_ips.include?(req.ip)

end
{% endhighlight %}

I know, pretty basic eh?

[recent meetup]:(http://arlingtonruby.org)
[memcached]:(http://memcached.org/)
[redis]:(http://redis.io/)
[the Rails guides]:(http://guides.rubyonrails.org/caching_with_rails.html)
[rack attack gem]:(https://github.com/kickstarter/rack-attack)