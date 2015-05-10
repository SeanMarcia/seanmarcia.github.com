---
layout: post
title:  "SQL Old School Part 2"
date:   2014-04-16 04:07:49
categories:
- SQL
comments: true
---


Here is the second SQL example that took me more googling than it should have so I thought I’d also post about it. Lets assume we have a SQL table with employee bonuses in it. We know how easy it is to find the highest bonus.

{% highlight ruby %}
SELECT max(emp_bonus) FROM employeetable
{% endhighlight %}

Or the smallest bonus.

{% highlight ruby %}
SELECT min(emp_bonus) FROM employeetable
{% endhighlight %}

However, what if we want to know what the 8th highest bonus was? It turns out it is a lot easier than it seemed (at least to me.)

{% highlight ruby %}
SELECT min(emp_bonus) FROM employeetable
WHERE emp_bonus IN
(SELECT distinct top 8 emp_bonus FROM employeetable order by emp_bonus desc)
{% endhighlight %}

If we wanted the 120th highest bonus we would just make it the top 120.